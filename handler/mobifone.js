"use strict";
const moment = require('moment');
const axios = require('axios');
const soap = require('soap');
const _ = require('lodash');
const Validator = require('validatorjs');

const CONFIG = require('../config/config');
const CONNECTION = require('../config/connection');
const TELCO_CONFIG = require('../config/telcoConfig');
const writeLog = require('../writeLog/writeLog');
const callApi = require('../common/callApi');
const helper = require('../common/helper');
const model = require('../common/model');

const ruleConfig = {
  updatePackage: {
    isdn: 'required|string',
    serviceCode: ['required', 'string', {'in': [TELCO_CONFIG.MOBI.SERVICE_CODE]}],
    // packageCode: 'string',
    // groupCode: 'string',
    commandCode: 'required|string',
    regDatetime: 'required|string',
    // staDatetime: 'string',
    // endDatetime: 'string',
    // expireDatetime: 'string',
    status: 'required|string',
    channel: 'required|string',
    // charge_price: 'string',
    // message_send: 'string',
    org_request: 'required|string',
  },
  sendMt: {
    isdn: 'required|string',
    content: 'required|string',
  },
};


const api = {};
module.exports = api;

//fn updatePackage
api.updatePackage = (handelerConfig) => {
  const {handler, router, collection} = handelerConfig;
  
  //router
  handler.post(router, async(req, res, next) => {
    let response;
    const reqBody = req.body;
    const params = helper.formatDataUpdatePackage(reqBody);
    
    console.log(moment().format('YYYY-MM-DD HH:mm:ss'), '-------------------------');
    console.log(moment().format('YYYY-MM-DD HH:mm:ss'), '-------------------------');
    console.log(moment().format('YYYY-MM-DD HH:mm:ss'), '-------------------------');
    console.log(moment().format('YYYY-MM-DD HH:mm:ss'), '--api-updatePackage--params---', params);
    
    const packageConfig = TELCO_CONFIG.MOBI.PACKAGE;
    params.packageCode = params.packageCode || helper.getPackageCodeByCommand(params.commandCode, packageConfig);
    
    console.log(moment().format('YYYY-MM-DD HH:mm:ss'), '---------packageCode---', params.packageCode);
    
    const packageItem = packageConfig[params.packageCode] || {};
    const syntaxItem = packageItem['syntax'] || {};
    
    try {
      //validator request
      const validator = new Validator(reqBody, ruleConfig.updatePackage);
      if (validator.fails()) {
        return response = Object.assign({}, CONFIG.EC.INVALID_PARAM, {msg: JSON.stringify(validator.errors.all())});
      }
      
      //logic
      const mapCommand = helper.convertObjectToObjectByKey(syntaxItem, 'command');
      const nameCommand = mapCommand[params.commandCode.toUpperCase()]
        ? mapCommand[params.commandCode.toUpperCase()].key || null
        : null;
      params.nameCommand = nameCommand;
      console.log(moment().format('YYYY-MM-DD HH:mm:ss'), '-----------nameCommand---', nameCommand);
      
      //check valid command
      const condValidCommand = [
          'reg_first_success',
          'reg_again_success',
          'reg_not_success_not_money',
          'renew_success',
          'unreg_by_system',
          'unreg_by_user',
          'get_pass_by_user',
          'get_status_user',
        ].indexOf(nameCommand) == -1;
      if (condValidCommand) {
        return response = Object.assign({}, CONFIG.EC.FAIL, {msg: 'Invalid Command: '});
      }
      
      
      //check command GH, DK, DKLAI ko đủ tiền
      const condNotMoney = ['reg_not_success_not_money'].indexOf(nameCommand) > -1;
      if (condNotMoney) {
        return response = CONFIG.EC.SUCCESS;
      }
      
      //check user exist in app
      const exists = await callApi.checkUser(params);
      const condReg = ['reg_first_success', 'reg_again_success'].indexOf(nameCommand) > -1;
      
      //if not exists user: create user
      if (!exists['exists'] && condReg) {
        const rsCreateUser = await callApi.createUser(params);
        if (rsCreateUser['ec']) {//not success
          return response = Object.assign({}, CONFIG.EC.FAIL, {msg: rsCreateUser['message'] || ''});
        }
      }
      
      //if exists user: check package current user: only one package in db
      else {
        let userItemDb = await model.findOne({
          where: {_id: params.isdn},
          collection: CONNECTION.mongo.col.user
        });
        
        console.log(moment().format('YYYY-MM-DD HH:mm:ss'), '---------api updatePackage-userItemDb--', !!userItemDb);
        if (_.isEmpty(userItemDb) && !condReg) {//!condReg: vì có những user đã exists trên ht app nhưng đăng kí lần đầu qua đầu số này
          return response = Object.assign({}, CONFIG.EC.FAIL, {msg: `User Not Exist in DB Local`});
        }
        userItemDb = userItemDb || {};
        params.packageCodePrev = userItemDb.packageCode || '';
        
        
        //command HUY
        const condHuy = ['unreg_by_system', 'unreg_by_user'].indexOf(nameCommand) > -1;
        if (condHuy) {
          if (['unreg_by_user'].indexOf(nameCommand) > -1) {
            //call api hủy: user tự hủy là ko xem được content và ko miễn phí data
            await callApi.removePackage(params);
          }
          return response = CONFIG.EC.SUCCESS;
        }
        
        
        //command get pass by user
        const condGetPass = ['get_pass_by_user'].indexOf(nameCommand) > -1;
        if (condGetPass) {
          if (userItemDb && userItemDb.pass) {
            await sendMT({isdn: params.isdn, content: userItemDb.pass});
            return response = Object.assign({}, CONFIG.EC.SUCCESS, {result: userItemDb.pass});
          }
          else
            return response = Object.assign({}, CONFIG.EC.FAIL, {msg: `Pass Not Found in DB Local`});
        }
        
        //check only register a package or status user
        const condSamePackage = userItemDb && (userItemDb['packageCode'] == params.packageCode);
        const condTwoPackage = userItemDb && (userItemDb['packageCode'] != params.packageCode);
        const condNotExpired = userItemDb
          ? moment(userItemDb['expireDatetime'], 'DD/MM/YYYY HH:mm:ss').unix() >= moment().unix()
          : true;
        
        //command get status by user
        const condStatusUser = ['get_status_user'].indexOf(nameCommand) > -1;
        if (condStatusUser) {
          console.log(moment().format('YYYY-MM-DD HH:mm:ss'), '---------activeUser---', (condSamePackage && condNotExpired));
          
          if (condSamePackage && condNotExpired) {
            return response = CONFIG.EC.SUCCESS
          } else return response = Object.assign({}, CONFIG.EC.FAIL, {msg: `User Unactive`});
        }
        
        //check only register a package
        console.log(moment().format('YYYY-MM-DD HH:mm:ss'), '---------condTwoPackage---', (condTwoPackage && condNotExpired));
        if (condTwoPackage && condNotExpired) {
          return response = Object.assign({}, CONFIG.EC.FAIL,
            {msg: `Only one package: Current package && expire: ${userItemDb['packageCode']}; ${userItemDb['expireDatetime']}`}
          );
        }
      }
      
      //add package: call server app with //command reg, renew
      const rsAddPackage = await callApi.addPackage(params);
      if (rsAddPackage['ec']) {//not success
        return response = Object.assign({}, CONFIG.EC.FAIL, {msg: 'addPackage Not Success: ' + rsAddPackage['message'] || ''});
      }
      
      //add package success
      return response = CONFIG.EC.SUCCESS;
    } catch (e) {
      console.error(moment().format('YYYY-MM-DD HH:mm:ss'), '-----------ERROR-updatePackage-----', e.stack || e);
      return response = Object.assign({}, CONFIG.EC.FAIL, {msg: (e.stack || e)});
    }
    finally {
      if (response.msg)
        response.msg = response.msg.substr(0, 150);
      
      console.log(moment().format('YYYY-MM-DD HH:mm:ss'), '---------into--url--response---', response);
      
      //create transaction with params mobi, status, reponse
      params.expireSelf = moment().add(packageItem.expiredIn || 1, 'd').format('DD/MM/YYYY HH:mm:ss');
      await writeLog.saveTran(params, reqBody, response);
      await writeLog.saveUser(params, response);
      
      if (response.resultCode == CONFIG.EC.SUCCESS.resultCode)
        return res.json(response);
      else
        return next(response);
    }
  });
};

//send mt otp
api.sendMt = (handelerConfig) => {
  const {handler, router} = handelerConfig;
  
  //router
  handler.post(router, async(req, res, next) => {
    let response;
    const reqBody = req.body;
    const params = Object.assign({}, reqBody);
    params.isdn = helper.formatPhone(params.isdn);
    
    console.log(moment().format('YYYY-MM-DD HH:mm:ss'), '-------------------------');
    console.log(moment().format('YYYY-MM-DD HH:mm:ss'), '-------------------------');
    console.log(moment().format('YYYY-MM-DD HH:mm:ss'), '-------------------------');
    console.log(moment().format('YYYY-MM-DD HH:mm:ss'), '--------sendMt-reqBody---', reqBody);
    
    try {
      //validator request
      const validator = new Validator(reqBody, ruleConfig.sendMt);
      if (validator.fails()) {
        return response = Object.assign({}, CONFIG.EC.INVALID_PARAM, {msg: JSON.stringify(validator.errors.all())});
      }
      
      //sendMt
      await sendMT(params);
      return response = CONFIG.EC_SYSTEM.SUCCESS;
    } catch (e) {
      console.error(moment().format('YYYY-MM-DD HH:mm:ss'), '-----------ERROR-sendMt-----', e.stack || e);
      return response = Object.assign({}, CONFIG.EC_SYSTEM.NOT_SUCCESS, {msg: '--sendMT--: ' + (e.stack || e)});
    }
    finally {
      if (response.msg)
        response.msg = response.msg.substr(0, 150);
      
      console.log(moment().format('YYYY-MM-DD HH:mm:ss'), '---------sendMt--response---', response);
      
      //write log
      await writeLog.saveLogMt(params, reqBody, response);
      await writeLog.savePassUser(params, response);
      
      if (response.CODE == CONFIG.EC_SYSTEM.SUCCESS.CODE)
        return res.json(response);
      else
        return next(response);
    }
  });
};

const sendMT = async(params) => {
  const MT = 'Tai khoan truy cap <user>, mat khau <pass>.'
    + 'Truy cap ung dung STV Play de xem Truyen hinh nuoc ngoai KHONG GIOI HAN DUNG LUONG TOC DO CAO.'
    + 'Chi tiet lien he 9090. Tran trong';
  const content = MT.replace('<user>', params.isdn).replace('<pass>', params.content);
  
  const dataApi = {
    ServiceCode: TELCO_CONFIG.MOBI.SERVICE_CODE,
    User: TELCO_CONFIG.MOBI.USER,
    Password: TELCO_CONFIG.MOBI.PASS,
    ISDN: params.isdn,
    Content: content,
    UseBrandname: '1',
  };
  console.log(moment().format('YYYY-MM-DD HH:mm:ss'), '---sendMT--dataApi---', dataApi);
  
  return soap.createClientAsync(TELCO_CONFIG.MOBI.BASE_URL)
    .then((client) => {
      return client.sendMessageAsync(dataApi);
    }).then(response => {
      console.log(moment().format('YYYY-MM-DD HH:mm:ss'), '---success--sendMT---', response);
      
      const success = response[0] && response[0]['return'] && response[0]['return'] == 'OK';
      if (success)
        return Promise.resolve(response);
      else return Promise.reject('sendMt: ' + response);
    })
    .catch(err => {
      console.log(moment().format('YYYY-MM-DD HH:mm:ss'), '---error---sendMT---', err.stack || err);
      return Promise.reject('sendMt: ' + err.stack || err);
    });
};


