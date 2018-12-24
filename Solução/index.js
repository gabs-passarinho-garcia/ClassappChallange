/*Nome: Gabriel de Freitas Garcia
Objetivo: Fazer um programa em node.js que receba um arquivo input.csv, processe os dados e imprima em um arquivo outpu.json*/
function main(){ //função principal
  var fs = require("fs"); //módulo com funções para arquivos
  var arquivo,linhas,aluno;
  var alunos = [];
  var header = []; //variáveis usadas para guardar o arquivo, o arquivo separado em linhas, aluno provisoriamente, headers e a lista com os alunos
  arquivo = fs.readFileSync("input.csv","utf-8"); //lê a entrada sincronamente, pra não dar problema com as operações em paralelo
  linhas = arquivo.split(/\r?\n/); //quebra cada linha da entrada numa lista
  header = separar(linhas[0]); //separa o header num formato aproveitável
  linhas.splice(0,1); //retira o header da lista
  for (var i = 0; i < linhas.length;i++){
    if (linhas[i] == "" || linhas[i] == null || linhas[i] == undefined){
      continue; //se não houver nada neste elemento de linhas, passa pra próxima iteração
    }
    aluno = cria_objeto(linhas[i],header); //salva a linha num objeto
    if (aluno.classes.length == 1){
      aluno.classes = aluno.classes[0]; //Se houver apenas um aluno, transforma lista em string
    } else if (aluno.classes.length == 0){
      aluno.classes = ""; //Se não houver nenhum, transforma lista em string vazia
    }
    alunos = coloca(alunos,aluno); //Insere o aluno na lista alunos
  }
  if (alunos.length == 1){
    alunos = alunos[0]; //Se houver apenas um aluno. transforma em objeto
  } else if (alunos.length == 0){
    alunos = ""; //Se não houver nenhum, transforma em string vazia
  }
  fs.writeFileSync("output.json",JSON.stringify(alunos,null,1),"utf-8"); //Escreve no arquivo de saída, sincronamente, achei melhor não lidar com assincro por enquanto
  //console.log(JSON.stringify(alunos,null,4))
}
function separar(string){
  var aspas1 = /\".+/, aspas2 = /.+\"/; //Regex para expressões com aspas no começo e no final
  var texto = string.split(","); //Separa testo pelas vírgulas
  for (var i = 0; i < texto.length; i++){
    if (aspas1.test(texto[i])){ //Se começa com aspas
      while(true){
        if (i === (texto.length)-1){
          break; //Se for o último da lista quebra o laço
        }
        if (aspas2.test(texto[i+1])){ //Quando acha aspas no final
          texto[i] = texto[i] + texto[i+1]; //Concatena as duas strings
          texto.splice(i+1,1); //Tira a segunda string da lista
          texto[i] = texto[i].substr(1).slice(0, -1); //Remove as aspas
          break;
        } else {
          texto[i] = texto[i] + texto[i+1]; //Se não tiver aspas no final, não é a última tag, apenas concatena as strings
          texto.splice(i+1,1); //E remove a segunda da lista
        }
      }
    }
  }
  return texto; //Retorna lista com os headers
}
function cria_objeto(aluno,header){ //Função que transforma linha da entrada em objeto js
  const PNF = require('google-libphonenumber').PhoneNumberFormat; //Invoca biblioteca de telefone
  const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
  var name = /fullname/i, eid = /eid/i, num = /\d+/,classe = /class/i, sala = /sala \d+/i, correio = /email/i; //Regex uteis para buscar coisas nas strings e verificar se algo é um email
  var email = /\w+@\w+\.[a-z]+\.?[a-z]{0,2}/, telefone = /phone/i, invisivel = /invisible/i, ver = /see_all/i, letra = /[a-zA-Z]+/,especiais = /[();:!#$*&£\[\]\{\}+=]+/;
  var modelo, endereço; //Variáveis usadas
  modelo = {
    fullname : "",
    eid: "",
    classes : [],
    addresses: [],
    invisible: false,
    see_all: false
  } //Objeto com informações para os alunos
  aluno = separar(aluno);
  for (var i = 0; i < header.length; i++){
    endereço = {
      type: "",
      tags: [],
      address: ""
    } //Objeto para salvar os endereços, precisa ser recriado a cada iteração para não dar problema de referência
    if (aluno[i] === ""){
      continue;
    }
    if (name.test(header[i])){ //Se o elemento for o nome
      modelo.fullname = aluno[i]; //Salva o nome no objeto
    } else if (eid.test(header[i])){ //Se for um identificador
      if(num.test(aluno[i])){ //Verifica se elemento é válido
        modelo.eid = num.exec(aluno[i])[0]; //Se for, salva no objeto
      }
    } else if (classe.test(header[i])){ //Se elemento for uma sala
        modelo = adicionar(endereço,aluno[i],sala,modelo,1); //Chama função que adiciona ao objeto
    } else if (correio.test(header[i])){ //Se for email
      if (especiais.test(aluno[i])){ //Se houver coisas inválidas, pula
        continue;
      }
      endereço.type = "email"; //O tipo de endereço é email
      var tags = header[i].split(" "); //Separa as tags em uma lista
      for (var j = 0; j < tags.length; j++){
        if (correio.test(tags[j])){ //Se não for uma tag, pula
          continue;
        } else{
          if (!busca(tags[j],endereço.tags))
          endereço.tags.push(tags[j]); //Salva a tag se ela não estiver na lista
        }
      }
      modelo = adicionar(endereço,aluno[i],email,modelo,2); //Adiciona o email ao objeto
    } else if (telefone.test(header[i])){ //Se for telefone
      if ((letra.test(aluno[i]))){ //Se for inválido, pula
        continue;
      }
      endereço.type = "phone"; //Tipo é email
      var tags = header[i].split(" ");
      for (var j = 0; j < tags.length; j++){
        if (telefone.test(tags[j])){
          continue;
        } else{
          if (!busca(tags[j],endereço.tags))
          endereço.tags.push(tags[j]); //Salva as tags, como acontece com o email
        }
      }
      var number = phoneUtil.parseAndKeepRawInput(aluno[i], 'BR'); //Salva o numero como um numero correto
      if (phoneUtil.isValidNumber(number)){ //Verifica se o número é válido
        endereço.address = phoneUtil.format(number, PNF.E164).replace("+",""); //Salva número no formato correto e elimina o mais
        modelo.addresses = funde(modelo.addresses,endereço); //Adiciona o telefone ao objeto com função
      }
    } else if (invisivel.test(header[i])){ //Se for invisibles
      if ((aluno[i] == true || aluno[i] == "yes" || num.test(aluno[i])) && (aluno[i] != 0 && aluno[i] !== "false" && aluno[i] != "no" && aluno[i] != false)){
        modelo.invisible = true; //Se for verdade, seta como true, caso contrário, permanece falso
      }
    } else if (ver.test(header[i])){ //Se for see_all
      if ((aluno[i] == true || aluno[i] == "yes" || num.test(aluno[i])) && (aluno[i] != 0 && aluno[i] !== "false" && aluno[i] != "no" && aluno[i] != false)){
        modelo.see_all = true; //O mesmo vale para o see_all
      }
    }
  }
  return modelo; //retorna o modelo
}
function adicionar(endereço,aluno,regex,modelo,tipo){ //Função que adiciona as salas e o email, recebe o texto, a expressão regular necessária, o objeto, o objeto de endereço e o tipo, 1 para classe, 2 para email
  var cópia; //Variável pra evitar problema de referência
  while (regex.test(aluno)){
    cópia = {
      type: endereço.type,
      tags: endereço.tags,
      address: ""
    } //A cada iteração, recria o objeto, pra não dar problema de alterar o email dentro da lista quando troca o email do objeto temporário
    var corresponde = regex.exec(aluno)[0]; //Pega o elemento que queremos
    if (tipo === 1){ //Se for classe
      if (!busca(corresponde,modelo.classes)){ //Verifica se essa classe já está na lista
        modelo.classes.push(corresponde); //Se não estiver, adiciona à lista
      }
    } else { //Se for email
      cópia.address = corresponde; //Salva email na cópia
      modelo.addresses = funde(modelo.addresses,cópia); //Usa função funde para adicionar email
    }
    aluno = aluno.replace(corresponde,""); //Retira da String o email ou classe que já foi adicionado
  }
  return modelo; //Retorna objeto
}
function coloca(lista,aluno){ //Que adiciona aluno na lista de alunos
  var i ,j
  for (i = 0; i < lista.length; i++){ //Percorre a lista
    if (lista[i].eid === aluno.eid){ //Se encontrar dois alunos com a mesma identificação, os funde
      for (j = 0; j < aluno.classes.length; j++){
        if (!busca(aluno.classes[j],lista[i].classes)){
          if (!Array.isArray(lista[i].classes)){ //Se for string, transforma em array
            lista[i].classes = [lista[i].classes];
          }
          lista[i].classes.push(aluno.classes[j]); //Coloca as classes inéditas do aluno que está sendo fundido no aluno da lista
        }
      }
      for (j = 0; j < aluno.addresses.length; j++){
        lista[i].addresses = funde(lista[i].addresses,aluno.addresses[j]); //Adiciona os emails inéditos com função
      }
      if (lista[i].invisible === true || aluno.invisible === true){ //Se os invisibles de, pelo menos, um dos dois for true, fica como true
        lista[i].invisible = true;
      }
      if (lista[i].see_all === true || aluno.see_all === true){ //O mesmo vale para o see_all
        lista[i].see_all = true;
      }
      return lista; //Retorna a lista
    }
  }
  lista.push(aluno); //Se o aluno for inédito, não estiver na lista, ele é adicionado à lista
  return lista; //Retorna lista
}
function busca(elemento,lista){ //Busca sequencial, não tenho como garantir que as listas estão ordenadas e não valia a pena ordenar
  var i;
  if (lista === undefined || lista === null){ //Se não for lista, transforma em lista vazia
    lista = [];
  }
  for (i = 0; i < lista.length; i++){
    if (elemento == lista[i]){
      return true; //Se encontra o elemento dentro da lista, retorna verdade
    }
  }
  return false; //Se não encontrar, retorna falso
}
function funde(lista,endereço){
  if (lista === undefined || lista === null){ //Se não for nada, transforma em lista
    lista = [];
  }
  var x = busca_endereço(lista,endereço) //Busca se o endereço está na lista
  if (lista.tags === undefined || lista.tags === null){ //Se tags não for nada, transforma em lista
    lista.tags = [];
  }
  if (x < 0){
    lista.push(endereço); //Se elemento não estiver na lista, adiciona
    return lista; //Retorna lista
  } else{ //Se endereço estiver na lista
    for (var i = 0; i < endereço.tags.length; i++){
      if (!busca(endereço.tags[i],lista.tags)){ //Procura se tag já está na lista
        lista[x].tags.push(endereço.tags[i]); //Se não estiver, adiciona
      }
    }
    return lista; //Retorna lista
  }
}
function busca_endereço(lista,endereço){ //Busca sequencial de endereços, sequencial pela mesma razão da outra função
  var i
  for (i = 0; i < lista.length; i++){
    if (endereço.address == lista[i].address){ //Verfica se o endereço de um objeto está presente em algum dos objetos de uma lista
      return i; //Se encontra, retorna a posição onde foi encontrado
    }
  }
  return -1; //Se não encontra, retorna -1
}


main() //Chamada da função principal
//Agradeço a Deus porque Ele sempre está comigo, morreu por mim, me salvou e cuidou de mim em cada momento de minha vida.
