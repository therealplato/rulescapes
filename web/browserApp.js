$(document).ready(init)

function init(){
  $('form').submit(function(e){
    e.preventDefault();
    writeRule();
  })
}

function writeRule(){
  $.ajax('/writeRule', {
    method: 'POST',
    data: $('form').serialize(),
    success: onRuleWritten,
  });
}

function onRuleWritten(res){

}

function defineRulescape(){
}