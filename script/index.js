/*Nome: Gabriel de Freitas Garcia
Objetivo: Fazer um programa em node.js que receba um arquivo input.csv, processe os dados e imprima em um arquivo outpu.json*/
function main(){
  const libphone = require('google-libphonenumber')
  var fs = require("fs")
  var modelo, endereço, arquivo,linhas,aluno
  var alunos = []
  var header = []
  modelo = {
    fullname : "",
    eid: "",
    classes : [],
    addresses: [],
    invisible: false,
    see_all: false
  }
  endereço = {
    type: "",
    tags: [],
    address: ""
  }
  arquivo = fs.readFileSync("input.csv","utf-8")
  linhas = arquivo.split(/\r?\n/)
  header = separar(linhas[0])
  linhas.splice(0,1)
  for (var i = 0; i < linhas.length;i++){
    aluno = cria_objeto(linhas[i],header,modelo,endereço)
    alunos.push(aluno)
  }
  console.log(JSON.stringify(alunos,null,4))
}
function separar(string){
  var texto = string.split(",")
  for (var i = 0; i < texto.length; i++){
    if (/\".+/.test(texto[i])){
      while(true){
        if (i === (texto.length)-1){
          break
        }
        if (/.+\"/.test(texto[i+1])){
          texto[i] = texto[i] + texto[i+1]
          texto.splice(i+1,1)
          texto[i] = texto[i].substr(1).slice(0, -1)
          break
        } else {
          texto[i] = texto[i] + texto[i+1]
          texto.splice(i+1,1)
          texto[i] = texto[i].substr(1).slice(0, -1)
        }
      }
    }
  }
  return texto
}
function cria_objeto(aluno,header,modelo,endereço){
  aluno = separar(aluno)
  if (aluno[i] === ""){
    continue
  }
  for (var i = 0; i < header.length; i++){
    if (/fullname/i.test(header[i])){
      modelo.fullname = aluno[i]
    } else if (/eid/.test(header[i])){
      modelo.eid = /\d+/.exec(aluno[i])[0]
    } else if (/class/i.test(header[i])){
        var classe1
        while(/classe \d+/i.test(aluno[i])){
          classe1 = /Classe \d+/i.exec(aluno[i])[0]
          modelo.classes.push(classe1)
          aluno[i].replace(classe1,"")
        }
    } else if (/email/i.test(header[i])){
      endereço.type = "email"
      var tags = header[i].split(" ")
      for (var j = 0; j < tags.length; j++){
        if (/email/i.test(tags[j])){
          continue
        } else{
          endereço.tags.push(tags[i])
        }
      }
      endereço.address = /\w+@\w+\.[a-z]+\.?[a-z]{0,2}/.exec(aluno[i])[0]
      modelo.addresses.push(endereço)
    } else if (/phone/i.test(header[i])){
      endereço.type = "phone"
      var tags = header[i].split(" ")
      for (var j = 0; j < tags.length; j++){
        if (/phone/i.test(tags[j])){
          continue
        } else{
          endereço.tags.push(tags[i])
        }

      }
    }
  }
}
main()
//Agradeço a Deus porque Ele sempre está comigo, morreu por mim, me salvou e cuidou de mim em cada momento de minha vida.
