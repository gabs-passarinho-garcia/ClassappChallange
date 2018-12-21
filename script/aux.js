//Este arquivo não faz parte do projeto, apenas criei pra testar as funções enquanto faço
function separar(string){
  var texto = string.split(/\"|\,/)
  console.log(JSON.stringify(texto,null,4))
}
separar("fullname,eid,class,class,\"email Responsável, Pai\",phone Pai,\"phone Responsável, Mãe\",email Mãe,email Aluno,phone Aluno,invisible,see_all")
