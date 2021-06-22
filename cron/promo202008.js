"use strict";
const moment = require('moment');
const _ = require('lodash');

const writeLog = require('../writeLog/writeLog');
const helper = require('../common/helper');
const {mongo} = require('../common/connector');
const CONNECTION = require('../config/connection');
const PROMO_CONFIG = require('../config/promoConfig');

let runTime, db__;
const whereConfig = {
  packageCode: PROMO_CONFIG.promo_2.packageCode,
  nameCommand: {
    '$in': [
      'reg_first_success',
      'reg_again_success',
      'renew_success',
    ]
  },
  status: 0,
};

const CronJob = require('cron').CronJob;
(new CronJob('01 03 * * * *', stat)).start();

// stat();
function stat() {
  runTime = moment().format('YYYY-MM-DD HH:mm:ss');
  const hour = Number(moment().subtract(1, 'h').format('YYYYMMDDHH'));
  const day = Number(moment(hour, 'YYYYMMDDHH').format('YYYYMMDD'));

  const whereStream = Object.assign({}, whereConfig);
  whereStream['$and'] = [
    {day: PROMO_CONFIG.promo_2.timePromo},
    {day: {$eq: day}},
    {hour},
  ];

  console.log(runTime, 'hour day', hour, day);
  console.log(runTime, 'whereStream', JSON.stringify(whereStream));

  return mongo
    .then((db) => {
      db__ = db;
      const stream =
        db.collection(CONNECTION.mongo.col.tran)
          .find(whereStream)
          .sort({createdAt: 1})
          .stream();

      let i = 0;
      stream.on("data", async(item) => {
        i++;

        console.log(runTime, '----------------');
        console.log(runTime, '----------------');
        console.log(runTime, '----------------');
        console.log(runTime, 'i dayRun', i, day);
        console.log(runTime, 'item._id hour', item._id, item.hour);

        stream.pause();
        try {
          await handleItem(item);
        } catch (err) {
          console.error(runTime, 'ERROR ITEM', item._id, err.stack || err);
          return Promise.reject(err);
        }
        finally {
          setTimeout(function () {
            stream.resume();
          }, 50);
        }
      });
      stream.on("end", function () {
      });
    })
    .catch((err) => console.error(runTime, 'ERROR MAIN', err.stack || err));
};

const handleItem = async(item) => {
  //save_tran_by_day

  const where = {
    day: item.day,
    isdn: item.isdn,
    packageCode: item.packageCode,
    promoId: 'promo_2',
  };

  const data = Object.assign({}, where);
  data.createdAt = new Date();

  const inc = {
    count: 1,
    point: PROMO_CONFIG.promo_2.pointPerTran,
  };
  const push = {
    time: Number(moment(item.createdAt).format('YYYYMMDDHHmmss'))
  };

  console.log(runTime, 'where', where);
  await increment({
    where,
    data,
    inc,
    push
  });
};

const increment = async(params) => {
  const objUpdate = {$set: params.data};
  if (params.inc)
    objUpdate['$inc'] = params.inc;
  if (params.push)
    objUpdate['$push'] = params.push;

  return new Promise((resolve, reject) => {
    db__.collection(CONNECTION.mongo.col.userPromo202008).updateOne(
      params.where,
      objUpdate,
      {multi: true, upsert: params.upsert || true},
      (err, result) => {
        if (err) return reject(err);
        else return resolve(result);
      }
    );
  });
};

async function removeDataPromo(where) {
  console.log(runTime, 'removeDataPromo where', where);

  return new Promise((resolve, reject) => {
    db__.collection(CONNECTION.mongo.col.userPromo202008).deleteMany(//NOT CHANGE
      where,
      (err, result) => {
        if (err) return reject(err);
        else return resolve(result);
      }
    );
  });
};




