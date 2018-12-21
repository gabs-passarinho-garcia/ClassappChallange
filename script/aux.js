//Este arquivo não faz parte do projeto, apenas criei pra testar as funções enquanto faço
var fs = require("fs")
const readline = require("readline")
var rl = readline.createInterface({
      input : fs.createReadStream('input.csv'),
      output: process.stdout,
      terminal: false
})
var i = 0
rl.on('line',function(line){
    if (i == 0){
      console.log("batata")
    }
    console.log(line)
    ++i
})
