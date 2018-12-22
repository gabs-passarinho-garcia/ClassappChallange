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
  var aspas1 = /\".+/, aspas2 = /.+\"/
  var texto = string.split(",")
  for (var i = 0; i < texto.length; i++){
    if (aspas.test(texto[i])){
      while(true){
        if (i === (texto.length)-1){
          break
        }
        if (aspas2.test(texto[i+1])){
          texto[i] = texto[i] + texto[i+1]
          texto.splice(i+1,1)
          texto[i] = texto[i].substr(1).slice(0, -1)
          break
        } else {
          texto[i] = texto[i] + texto[i+1]
          texto.splice(i+1,1)
        }
      }
    }
  }
  return texto
}
function cria_objeto(aluno,header,modelo,endereço){
  const PNF = require('google-libphonenumber').PhoneNumberFormat;
  const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance()
  var name = /fullname/i, eid = /eid/i, num = /\d+/,classe = /class/i, sala = /Sala \d+/i, correio = /email/i
  var email = /\w+@\w+\.[a-z]+\.?[a-z]{0,2}/, telefone = /phone/i, invisivel = /invisible/i, ver = /see_all/i
  aluno = separar(aluno)
  endereço.tags = []
  if (aluno[i] === ""){
    continue
  }
  for (var i = 0; i < header.length; i++){
    if (name.test(header[i])){
      modelo.fullname = aluno[i]
    } else if (eid.test(header[i])){
      modelo.eid = num.exec(aluno[i])[0]
    } else if (classe.test(header[i])){
        modelo = adicionar
    } else if (correio.test(header[i])){
      endereço.type = "email"
      var tags = header[i].split(" ")
      for (var j = 0; j < tags.length; j++){
        if (correio.test(tags[j])){
          continue
        } else{
          endereço.tags.push(tags[j])
        }
      }
      modelo = adicionar(endereço,aluno[i],email,modelo)
    } else if (telefone.test(header[i])){
      endereço.type = "phone"
      var tags = header[i].split(" ")
      for (var j = 0; j < tags.length; j++){
        if (telefone.test(tags[j])){
          continue
        } else{
          endereço.tags.push(tags[j])
        }
      }
      var number = phoneUtil.parseAndKeepRawInput("(11) 38839332", 'BR')
      if (phoneUtil.isValidNumber(number)){
        endereço.address.push(phoneUtil.format(number, PNF.E164).replace("+",""))
        modelo.addresses.push(endereço)
      }
    } else if (invisivel.test(header[i])){
      if ((aluno[i] == true || aluno[i] !== "false" || num.test(aluno[i])) && aluno[i] != 0){
        modelo.invisible = true
      }
    } else if (ver.test(header[i])){
      if ((aluno[i] == true || aluno[i] !== "false" || num.test(aluno[i])) && aluno[i] != 0){
        modelo.see_all = true
      }
    }
  }
}
function adicionar(endereço,aluno,regex,modelo){
  while (regex.test(aluno)){
    var corresponde = regex.exec(aluno[i])[0]
    endereço.address = corresponde
    aluno[i].replace(corresponde,"")
    modelo.addresses.push(endereço)
  }
  return modelo
}
main()
//Agradeço a Deus porque Ele sempre está comigo, morreu por mim, me salvou e cuidou de mim em cada momento de minha vida.
