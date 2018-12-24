/*Nome: Gabriel de Freitas Garcia
Objetivo: Fazer um programa em node.js que receba um arquivo input.csv, processe os dados e imprima em um arquivo outpu.json*/
function main(){
  var fs = require("fs")
  var arquivo,linhas,aluno
  var alunos = []
  var header = []
  arquivo = fs.readFileSync("input.csv","utf-8")
  linhas = arquivo.split(/\r?\n/)
  header = separar(linhas[0])
  linhas.splice(0,1)
  for (var i = 0; i < linhas.length;i++){
    aluno = cria_objeto(linhas[i],header)
    if (aluno.classes.length == 1){
      aluno.classes = aluno.classes[0]
    } else if (aluno.classes.length == 0){
      aluno.classes = ""
    }
    alunos = coloca(alunos,aluno)
  }
  if (alunos.length == 1){
    alunos = alunos[0]
  } else if (alunos.length == 0){
    alunos = ""
  }
  fs.writeFileSync("output.json",JSON.stringify(alunos,null,1),"utf-8")
  //console.log(JSON.stringify(alunos,null,4))
}
function separar(string){
  var aspas1 = /\".+/, aspas2 = /.+\"/
  var texto = string.split(",")
  for (var i = 0; i < texto.length; i++){
    if (aspas1.test(texto[i])){
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
function cria_objeto(aluno,header){
  const PNF = require('google-libphonenumber').PhoneNumberFormat;
  const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance()
  var name = /fullname/i, eid = /eid/i, num = /\d+/,classe = /class/i, sala = /sala \d+/i, correio = /email/i
  var email = /\w+@\w+\.[a-z]+\.?[a-z]{0,2}/, telefone = /phone/i, invisivel = /invisible/i, ver = /see_all/i, letra = /[a-zA-Z]+/,especiais = /[();:!#$*&£\[\]\{\}+=]+/
  var modelo, endereço
  modelo = {
    fullname : "",
    eid: "",
    classes : [],
    addresses: [],
    invisible: false,
    see_all: false
  }
  aluno = separar(aluno)
  for (var i = 0; i < header.length; i++){
    endereço = {
      type: "",
      tags: [],
      address: ""
    }
    if (aluno[i] === ""){
      continue
    }
    if (name.test(header[i])){
      modelo.fullname = aluno[i]
    } else if (eid.test(header[i])){
      modelo.eid = num.exec(aluno[i])[0]
    } else if (classe.test(header[i])){
        modelo = adicionar(endereço,aluno[i],sala,modelo,1)
    } else if (correio.test(header[i])){
      if (especiais.test(aluno[i])){
        continue
      }
      endereço.type = "email"
      var tags = header[i].split(" ")
      for (var j = 0; j < tags.length; j++){
        if (correio.test(tags[j])){
          continue
        } else{
          if (!busca(tags[j],endereço.tags))
          endereço.tags.push(tags[j])
        }
      }
      modelo = adicionar(endereço,aluno[i],email,modelo,2)
    } else if (telefone.test(header[i])){
      if ((letra.test(aluno[i]))){
        continue
      }
      endereço.type = "phone"
      var tags = header[i].split(" ")
      for (var j = 0; j < tags.length; j++){
        if (telefone.test(tags[j])){
          continue
        } else{
          if (!busca(tags[j],endereço.tags))
          endereço.tags.push(tags[j])
        }
      }
      var number = phoneUtil.parseAndKeepRawInput(aluno[i], 'BR')
      if (phoneUtil.isValidNumber(number)){
        endereço.address = phoneUtil.format(number, PNF.E164).replace("+","")
        modelo.addresses = funde(modelo.addresses,endereço)
      }
    } else if (invisivel.test(header[i])){
      if ((aluno[i] == true || aluno[i] == "yes" || num.test(aluno[i])) && (aluno[i] != 0 && aluno[i] !== "false" && aluno[i] != "no" && aluno[i] != false)){
        modelo.invisible = true
      }
    } else if (ver.test(header[i])){
      if ((aluno[i] == true || aluno[i] == "yes" || num.test(aluno[i])) && (aluno[i] != 0 && aluno[i] !== "false" && aluno[i] != "no" && aluno[i] != false)){
        modelo.see_all = true
      }
    }
  }
  return modelo
}
function adicionar(endereço,aluno,regex,modelo,tipo){
  var cópia
  while (regex.test(aluno)){
    cópia = {
      type: endereço.type,
      tags: endereço.tags,
      address: ""
    }
    var corresponde = regex.exec(aluno)[0]
    if (tipo === 1){
      if (!busca(corresponde,modelo.classes)){
        modelo.classes.push(corresponde)
      }
    } else {
      cópia.address = corresponde
      modelo.addresses = funde(modelo.addresses,cópia)
    }
    aluno = aluno.replace(corresponde,"")
  }
  return modelo
}
function coloca(lista,aluno){
  var i ,j
  for (i = 0; i < lista.length; i++){
    if (lista[i].eid === aluno.eid){
      for (j = 0; j < aluno.classes.length; j++){
        if (!busca(aluno.classes[j],lista[i].classes)){
          lista[i].classes.push(aluno.classes[j])
        }
      }
      for (j = 0; j < aluno.addresses.length; j++){
        lista[i].addresses = funde(lista[i].addresses,aluno.addresses[j])
      }
      if (lista[i].invisible === true || aluno.invisible === true){
        lista[i].invisible = true
      }
      if (lista[i].see_all === true || aluno.see_all === true){
        lista[i].see_all = true
      }
      return lista
    }
  }
  lista.push(aluno)
  return lista
}
function busca(elemento,lista){
  var i
  if (lista === undefined || lista === null){
    lista = []
  }
  for (i = 0; i < lista.length; i++){
    if (elemento == lista[i]){
      return true
    }
  }
  return false
}
function funde(lista,endereço){
  if (lista === undefined || lista === null){
    lista = []
  }
  var x = busca_endereço(lista,endereço)
  if (lista.tags === undefined || lista.tags === null){
    lista.tags = []
  }
  console.log(endereço.address)
  console.log(endereço.tags)
  if (x < 0){
    lista.push(endereço)
    return lista
  } else{
    for (var i = 0; i < endereço.tags.length; i++){
      if (!busca(endereço.tags[i],lista.tags)){
        lista[x].tags.push(endereço.tags[i])
        console.log(lista[x].tags)
      }
    }
    return lista
  }
}
function busca_endereço(lista,endereço){
  var i
  for (i = 0; i < lista.length; i++){
    if (endereço.address == lista[i].address){
      return i
    }
  }
  return -1
}
main()
//Agradeço a Deus porque Ele sempre está comigo, morreu por mim, me salvou e cuidou de mim em cada momento de minha vida.
