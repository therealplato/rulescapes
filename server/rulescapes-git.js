var crypto = require('crypto');
var async = require('async');
var fs = require('fs');
var RUN = require('child_process').exec;
var strf = require('util').format;

module.exports = self = {
  /* Top level calls: DIY grunt */
  createRule: function(rule, callback){
    var opts = {rule:rule};
    async.waterfall([
      function(next){
        next(null, opts)
      },
      self.hashRule,
      self.writeRuleFile,
      self.gitInitRules,
      self.gitAddRules,
      self.gitCommitRules,
    ], callback)
  },

  modifyRule: function(oldRuleHash, rule, callback){
    var opts = {
      rule:rule,
      oldRuleHash: oldRuleHash,
    };
    async.waterfall([
      function(next){
        next(null, opts)
      },
      self.hashRule,
      self.gitRmOldRule,
      self.gitAddRules,
      function(opts, next){
        opts.commitMsg = 'Edit; New: '+opts.hash;
        next(null, opts);
      },
      self.gitCommitRules,
    ], callback)
  },

  listRules: function(callback){
    RUN('ls -1 *.rule', {cwd: '../rules/'}, function(err, stdout, stderr){
      // trim stdout whitespace:
      stdout = stdout.replace(/^\s+/, '').replace(/\s+$/, '');
      var filenames = stdout.split('/n');
      var collection = [];

      async.eachSeries(filenames, collectFile, function(err){
        callback(err, collection);
      });

      function collectFile(filename, done){
        fs.readFile(filename, {encoding: 'utf8'}, function(err, data){
          if(err){ return done(err)};
          collection.push({
            filename: filename,
            hash: filename.replace('.rule', ''),
            file: data,
          });
          done(null);
        })
      }

      //console.log(stdout, stderr);
      //next(err, opts);
    })
  },

  /* Second level calls: chained in various top level calls */
  hashRule: function(opts, next){
    var err = null;
    try{
      opts.buffer = new Buffer(opts.rule, 'utf8');
      var sha256er = crypto.createHash('sha256');
      sha256er.update(opts.buffer);
      opts.hash = sha256er.digest('hex');
    } catch(e){
      err = e;
    }
    next(err, opts);
  },
  writeRuleFile: function(opts, next){
    opts.rulePath = '../rules/'+opts.hash+'.rule';
    fs.writeFile(opts.rulePath, opts.buffer, {encoding:'utf8'}, function(err){
      next(err, opts);
    });
    opts.commitMsg = 'New Rule: '+opts.hash;
  },
  gitInitRules: function(opts, next){
    console.log('git init')
    RUN('git init', {cwd: '../rules/'}, function(err, stdout, stderr){
      console.log(stdout, stderr);
      next(err, opts);
    })
  },
  gitAddRules: function(opts, next){
    console.log('git add')
    RUN('git add -A', {cwd: '../rules/'}, function(err, stdout, stderr){
      console.log(stdout, stderr);
      next(err, opts);
    })
  },
  gitCommitRules: function(opts, next){
    console.log('git commit')
    var cmd = strf('git commit -m "%s"', opts.commitMsg)
    RUN(cmd, {cwd: '../rules'}, function(err, stdout, stderr){
      console.log(stdout, stderr)
      next(err, opts);
    })
  },

  gitRmOldRule: function(opts, next){
    RUN('git rm '+opts.oldRuleHash+'.rule', {cwd: '../rules'}, function(err, stdout, stderr){
      console.log(stdout, stderr)
      next(err, opts);
    })
  },

}