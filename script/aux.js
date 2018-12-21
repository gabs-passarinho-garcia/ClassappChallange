//Este arquivo não faz parte do projeto, apenas criei pra testar as funções enquanto faço
const PNF = require('google-libphonenumber').PhoneNumberFormat;
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance()
const number = phoneUtil.parseAndKeepRawInput("(11) 38839332", 'BR')
console.log(phoneUtil.format(number, PNF.E164))
