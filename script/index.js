/*Nome: Gabriel de Freitas Garcia
Objetivo: Fazer um programa em node.js que receba um arquivo input.csv, processe os dados e imprima em um arquivo outpu.json*/
function main(){
  var fs = require("fs")
  const readline = require("readline")
  var modelo, endereço,alunos = [],header = []
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
    addres: ""
  }
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

//Agradeço a Deus porque Ele sempre está comigo, morreu por mim, me salvou e cuidou de mim em cada momento de minha vida.
