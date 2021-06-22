"use strict";
const moment = require('moment');

const CONFIG = require('../config/config');
const CONNECTION = require('../config/connection');
const model = require('../common/model');

const writeLog = {};
module.exports = writeLog;


writeLog.saveLogMt = async(params, reqBody, response) => {
  const data = Object.assign({}, params, response);
  data.params = reqBody;
  data.response = response;
  
  const currTime = moment();
  data.day = Number(currTime.format('YYYYMMDD'));
  data.hour = Number(currTime.format('YYYYMMDDHH'));
  data.createdAt = new Date();
  data.createdAt__ = currTime.format('YYYY-MM-DD HH:mm:ss');
  
  data.status = (data.CODE == CONFIG.EC_SYSTEM.SUCCESS.CODE) ? 0 : 1;
  data.msg = (data.CODE == CONFIG.EC_SYSTEM.SUCCESS.CODE) ? (data.msg || 'Success') : (data.msg || 'fail');
  
  
  await model.insertOne({
    data,
    collection: CONNECTION.mongo.col.logMt
  });
};

writeLog.saveTran = async(params, reqBody, response) => {
  const data = Object.assign({}, params, response);
  data.params = reqBody;
  data.response = response;
  
  const currTime = moment();
  data.day = Number(currTime.format('YYYYMMDD'));
  data.hour = Number(currTime.format('YYYYMMDDHH'));
  data.createdAt = new Date();
  data.createdAt__ = currTime.format('YYYY-MM-DD HH:mm:ss');
  
  const hasRenewByUser = checkRenewSuccess(data);
  data.nameCommandLast = hasRenewByUser
    ? `renew_${data.nameCommand}`
    : data.nameCommand;
  
  const commandGet = [
      'reg_not_success_not_money'
    ].indexOf(data.nameCommand) > -1;
  
  data.status = (data.resultCode == CONFIG.EC.SUCCESS.resultCode) ? commandGet ? 1 : 0 : 1;
  data.msg = (data.resultCode == CONFIG.EC.SUCCESS.resultCode) ? (data.msg || 'Success') : (data.msg || 'fail');
  
  await model.insertOne({
    data,
    collection: CONNECTION.mongo.col.tran
  });
};

writeLog.saveUser = async(params, response) => {
  const data = Object.assign({}, params, response);
  
  const currTime = moment();
  data.day = Number(currTime.format('YYYYMMDD'));
  data.hour = Number(currTime.format('YYYYMMDDHH'));
  data.createdAt = new Date();
  data.updatedAt = new Date();
  data.createdAt__ = currTime.format('YYYY-MM-DD HH:mm:ss');
  data.updatedAt__ = currTime.format('YYYY-MM-DD HH:mm:ss');
  
  data._id = params.isdn;
  
  //check case not need write log User
  const statusFail = (data.resultCode != CONFIG.EC.SUCCESS.resultCode);
  const notId = !data._id;
  const commandGet = [
      'get_pass_by_user',
      'get_status_user',
      'reg_not_success_not_money'
    ].indexOf(data.nameCommand) > -1;
  
  console.log(moment().format('YYYY-MM-DD HH:mm:ss'), '---------into--url--statusFail---', statusFail, notId, commandGet);
  
  if (statusFail || notId || commandGet) {
    return;
  }
  
  //case save field in custom
  const hasRenewByUser = checkRenewSuccess(data);
  data.nameCommandLast = hasRenewByUser
    ? `renew_${data.nameCommand}`
    : data.nameCommand;
  
  //check command reg, renew, unreg
  const hasRegRenew = [
      'reg_first_success',
      'reg_again_success',
      'renew_success'
    ].indexOf(data.nameCommand) > -1;
  
  const hasUnregByUser = [
      'unreg_by_user',
    ].indexOf(data.nameCommand) > -1;
  
  if (hasRegRenew)
    data.expireDatetime = data.expireDatetime || data.expireSelf;
  
  if (hasUnregByUser)
    data.expireDatetime = moment().format('DD/MM/YYYY HH:mm:ss');
  
  if (data.packageCodePrev) {//createdAt: time khi lần đầu dùng dịch vụ
    delete data.createdAt;
    delete data.createdAt__;
  }
  
  data.status = 0;
  data.msg = data.msg || 'Success';
  
  await model.updateOne({
    data,
    collection: CONNECTION.mongo.col.user
  });
};
writeLog.savePassUser = async(params, response) => {
  const data = {
    _id: params.isdn,
    pass: params.content
  };
  
  if (response.CODE != CONFIG.EC_SYSTEM.SUCCESS.CODE || !data._id) {
    return;
  }
  
  await model.updateOne({
    data,
    collection: CONNECTION.mongo.col.user
  });
};

const checkRenewSuccess = (data) => {
  const condReg = [
      'reg_first_success',
      'reg_again_success',
    ].indexOf(data.nameCommand) > -1;
  const success = (data.resultCode == CONFIG.EC.SUCCESS.resultCode);
  const duplicatePackage = (data.packageCodePrev && data.packageCode == data.packageCodePrev);
  return (condReg && success && duplicatePackage);
};