var fs = require('fs');
var rulescape = require('./rulescapes-git.js');

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false })); //  application/x-www-form-urlencoded

// Serve static files matching /web/* from the ./web directory:
app.use(express.static(__dirname+'/../web'));

app.get('/', function(req, res){
  res.header('Content-Type', 'text/html');
  res.send(fs.readFileSync('../web/index.html', 'utf8'));
})

app.post('/writeRule', function(req, res){
  rulescape.createRule(req.body.rule, function(err, opts){
    if(err){
      console.log(err);
      return res.status(500).send();
    }
    res.status(200).json(opts);
  })
})

rulescape.listRules(function(rules){
  console.log(rules);
})

require('http')
.createServer(app)
.listen(3001)