"use strict";
const handler = module.exports = require('express').Router();

//listen request from service mobifone
const approve = require('./mobifone');
approve.updatePackage({
  handler: handler,
  router: '/updatePackage',
  collection: 'TransactionMobi',
});

//send Mt with user && pass
approve.sendMt({
  handler: handler,
  router: '/sendMt',
});

