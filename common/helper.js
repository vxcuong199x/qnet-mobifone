const md5 = require('md5');
const moment = require('moment');

const Helper = {};
module.exports = Helper;

Helper.getPackageCodeByCommand = (commandCode, packageConfig) => {
  let rs = null;
  
  for (const packageCode of Object.keys(packageConfig)) {
    const objSyntax = packageConfig[packageCode].syntax;
    
    for (const namCommand of Object.keys(objSyntax)) {
      const commandItem = objSyntax[namCommand];
      if (commandItem.command == commandCode.toUpperCase())
        rs = packageCode;
    }
  }
  return rs;
};

Helper.convertObjectToObjectByKey = (obj, key) => {
  const rs = {};
  for (let i in obj) {
    const item = obj[i];
    item.key = i;
    
    rs[item[key]] = item;
  }
  return rs;
};

Helper.formatDataUpdatePackage = (reqBody) => {
  const params = Object.assign({}, reqBody);
  
  for (let key in params) {
    const value = params[key] ? params[key].trim() : params[key];
    if (key == 'isdn') {
      params[key] = Helper.formatPhone(value);
    }
    
    if (['isdn', 'endDatetime', 'message_send'].indexOf(key) == -1) {
      if (Number.isInteger(Number(value)))
        params[key] = Number(value);
    }
  }
  return params;
};
// Helper.isString = (variable) => {
//   if (typeof variable === 'string' || variable instanceof String)
//     return true;
//   else return false;
// };

Helper.formatPhone = (phone) => {
  let phoneLast;
  
  const addZero = phone.length <= 9
    ? true
    : false;
  const del84 = (phone.length > 10 && phone.substr(0, 2) == '84')
    ? true
    : false;
  
  if (addZero)
    phoneLast = '0' + phone;
  else if (del84)
    phoneLast = '0' + phone.substr(2, phone.length - 1);
  else phoneLast = phone;
  
  return phoneLast;
};



