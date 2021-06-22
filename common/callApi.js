"use strict";
const moment = require('moment');
const axios = require('axios');
const TELCO_CONFIG = require('../config/telcoConfig');

const headers = {
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
  timeout: 5000
};

const callApi = {};
callApi.checkUser = async(params) => {
  const dataApi = {username: params.isdn};
  const url = TELCO_CONFIG.SERVER_APP.BASE_URL + TELCO_CONFIG.SERVER_APP.API.checkUser;
  
  console.log(moment().format('YYYY-MM-DD HH:mm:ss'), '-------------');
  console.log(moment().format('YYYY-MM-DD HH:mm:ss'), '---------checkUser--dataApi----', url, dataApi);
  
  return axios.get(
    url,
    {params: dataApi}
  ).then(res => {
    console.log(moment().format('YYYY-MM-DD HH:mm:ss'), '----success--checkUser---', dataApi, res.data);
    return Promise.resolve(res.data);
  })
    .catch(err => {
      return Promise.reject('checkUser: ' + err.stack || err);
    });
};

callApi.createUser = async(params) => {
  const dataApi = {username: params.isdn};
  const url = TELCO_CONFIG.SERVER_APP.BASE_URL + TELCO_CONFIG.SERVER_APP.API.createUser;
  
  console.log(moment().format('YYYY-MM-DD HH:mm:ss'), '-------------');
  console.log(moment().format('YYYY-MM-DD HH:mm:ss'), '---------createUser--dataApi----', url, dataApi);
  
  return axios.post(
    url,
    dataApi,
    headers
  ).then(res => {
    console.log(moment().format('YYYY-MM-DD HH:mm:ss'), '----success--createUser---', dataApi, res.data);
    return Promise.resolve(res.data);
  })
    .catch(err => {
      return Promise.reject('createUser: ' + err.stack || err);
    });
};

callApi.addPackage = async(params) => {
  const packageConfig = TELCO_CONFIG.MOBI.PACKAGE;
  const packageItem = packageConfig[params.packageCode] || null;
  
  const dataApi = {
    username: params.isdn,
    time: packageItem.expiredMap || null,
    amount: packageItem.amount || null,
  };
  
  const url = TELCO_CONFIG.SERVER_APP.BASE_URL + TELCO_CONFIG.SERVER_APP.API.addPackage;
  
  console.log(moment().format('YYYY-MM-DD HH:mm:ss'), '-------------');
  console.log(moment().format('YYYY-MM-DD HH:mm:ss'), '---------addPackage--dataApi----', url, dataApi);
  
  return axios.post(
    url,
    dataApi,
    headers
  ).then(res => {
    console.log(moment().format('YYYY-MM-DD HH:mm:ss'), '----SUCCESS--addPackage---', dataApi, res.data);
    return Promise.resolve(res.data);
  })
    .catch(err => {
      return Promise.reject('addPackage: ' + err.stack || err);
    });
};

callApi.removePackage = async(params) => {
  const packageConfig = TELCO_CONFIG.MOBI.PACKAGE;
  const packageItem = packageConfig[params.packageCode] || null;
  
  const dataApi = {
    username: params.isdn,
    // time: packageItem.expiredMap || null,
    // amount: packageItem.amount || null,
  };
  
  const url = TELCO_CONFIG.SERVER_APP.BASE_URL + TELCO_CONFIG.SERVER_APP.API.removePackage;
  
  console.log(moment().format('YYYY-MM-DD HH:mm:ss'), '-------------');
  console.log(moment().format('YYYY-MM-DD HH:mm:ss'), '---------removePackage--dataApi----', url, dataApi);
  
  return axios.post(
    url,
    dataApi,
    headers
  ).then(res => {
    console.log(moment().format('YYYY-MM-DD HH:mm:ss'), '----SUCCESS--removePackage---', dataApi, res.data);
    return Promise.resolve(res.data);
  })
    .catch(err => {
      return Promise.reject('removePackage: ' + err.stack || err);
    });
};

module.exports = callApi;
