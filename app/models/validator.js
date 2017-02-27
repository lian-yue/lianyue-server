const validator = require('validator');



const locales = [
  // 'ar-DZ',
  // 'ar-SY',
  // 'en-US',
  // 'cs-CZ',
  // 'de-DE',
  // 'da-DK',
  // 'el-GR',
  // 'en-AU',
  // 'en-GB',
  // 'en-HK',
  // 'en-IN',
  // 'en-NZ',
  // 'en-ZA',
  // 'en-ZM',
  // 'es-ES',
  // 'fi-FI',
  // 'fr-FR',
  // 'hu-HU',
  // 'ms-MY',
  // 'nb-NO',
  // 'nn-NO',
  // 'pl-PL',
  // 'pt-BR',
  // 'pt-PT',
  // 'ru-RU',
  // 'tr-TR',
  // 'vi-VN',
  'zh-CN',
  // 'zh-TW',
  ]

exports.email = function(email)  {
  if (!validator.isEmail(email, {allow_utf8_local_part:false})) {
    return false;
  }

  if (!/^[0-9A-Za-z.+_-]+\@[0-9A-Za-z.-]+$/.test(email)) {
    return false;
  }

  if (email.length > 64) {
    return false;
  }

  return email.toLowerCase();
}




exports.mobilePhone = function(phone)  {
  if (!phone || typeof phone != 'string') {
    return false;
  }
  if (phone.substr(0,1) == '0') {
    phone = '+' + phone;
  }
  if (phone.substr(0,1) != '+') {
    phone = '+86' + phone;
  }
  phone = phone.replace(/^\+0+/, '+').replace(/[ _-]/g, '');

  var test = false;
  for (let i = 0; i < locales.length; i++) {
    if (validator.isMobilePhone(phone, locales[i])) {
      test = true;
      break;
    }
  }
  if (!test) {
    return false;
  }

  if (phone.substr(0, 3) == '+86') {
    phone = phone.substr(3)
  }

  return phone;
}
