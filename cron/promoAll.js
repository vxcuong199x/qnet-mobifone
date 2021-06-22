"use strict";
const moment = require('moment');
const _ = require('lodash');

const writeLog = require('../writeLog/writeLog');
const helper = require('../common/helper');
const {mongo} = require('../common/connector');
const CONNECTION = require('../config/connection');
const PROMO_CONFIG = require('../config/promoConfig');

let db__;
const whereConfig = {
  packageCode: PROMO_CONFIG.promo_1.packageCode,
  nameCommand: {
    '$in': [
      'reg_first_success',
      'reg_again_success',
      'renew_success',
    ]
  },
  status: 0
};

const CronJob = require('cron').CronJob;
(new CronJob('01 10 * * * *', stat)).start();

// stat();
function stat() {
  const hour = Number(moment().subtract(1, 'h').format('YYYYMMDDHH'));
  const day = Number(moment(hour, 'YYYYMMDDHH').format('YYYYMMDD'));

  console.log(moment().format('YYYY-MM-DD HH:mm:ss'), '--------hour--', hour, day);

  /*
   * run by hour
   */
  const whereStream = Object.assign(
    {day},
    whereConfig,
    {hour}
  );

  /*
   * run by day
   */
  // const whereStream = Object.assign({
  //     // isdn: "0705750172",
  //     day: 20200205,
  //   },
  //   whereConfig,
  //   {
  //     hour: {
  //       '$gte': 2020020501,
  //       '$lte': 2020020520,
  //     }
  //   }
  // );

  console.log(moment().format('YYYY-MM-DD HH:mm:ss'), '---------into--whereStream--', JSON.stringify(whereStream));

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
        console.log('-------------------------------------------------------------------------------');
        console.log('-------------------------------------------------------------------------------');
        console.log('-------------------------------------------------------------------------------');
        console.log('-------------------------------------------------------------------------------');
        console.log('-----------into--------------day---', i, day);
        console.log('-----------into----id day-------------', item._id, item.day);

        stream.pause();
        try {
          // if (i == 1) {
          // await removeDataPromo({
          //   day: item.day
          // });
          // }

          await handleItem(item);
        } catch (err) {
          console.error(moment().format('YYYY-MM-DD HH:mm:ss'), '-----------into---ERROR---', item._id, err.stack || err);
          return Promise.reject(err);
        }
        finally {
          setTimeout(function () {
            stream.resume();
          }, 30);
        }
      });
      stream.on("end", function () {
      });
    })
    .catch((err) => console.error(moment().format('YYYY-MM-DD HH:mm:ss'), '-----------into---ERROR---', err.stack || err));
};

const handleItem = async(item) => {
  const where = {
    isdn: item.isdn,
    packageCode: item.packageCode,
    promoId: 'promo_1',
    status: 1
  };
  const data = Object.assign({}, where);
  data.createdAt = new Date();

  const hasDay3 = await checkHasDay35({
    isdn: item.isdn,
    day_3: 1,
  });

  console.log(moment().format('YYYY-MM-DD HH:mm:ss'), '--------hasDay3--', hasDay3);

  if (!hasDay3) {
    const {objDay_3, objDay_5} = await checkPrevDay(item);

    data.day_3 = objDay_3.hasDay ? 1 : 0;
    data.objTime_3 = objDay_3.objTime;

    data.day_5 = objDay_5.hasDay ? 1 : 0;
    data.objTime_5 = objDay_5.objTime;
  }
  const inc = {
    count: 1,
    point: PROMO_CONFIG.promo_1.pointPerTran,
  };

  const push = {
    timeArr: item.createdAt
  };
  console.log(moment().format('YYYY-MM-DD HH:mm:ss'), '---------data---', data);

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
    db__.collection(CONNECTION.mongo.col.userPromo).updateOne(
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

const checkPrevDay = async(item) => {
  const listTranUser = await findTranUser({
    isdn: item.isdn,
  });

  const objDay = {};
  listTranUser.forEach((item) => {
    objDay[item.day] = item.createdAt;//lấy createdAt cuối cùng của ngày hôm đó
  });
  const objDay_3 = {
    hasDay: false,
    objTime: {}
  };
  const objDay_5 = {
    hasDay: false,
    objTime: {}
  };

  for (let day in objDay) {
    const rsCheck = {day_0: day};

    for (let i = 1; i < 5; i++) {
      const dayAfter = moment(day, 'YYYYMMDD')
        .add(i, 'days')
        .format('YYYYMMDD');

      const dayPrev = moment(dayAfter, 'YYYYMMDD')
        .add(-1, 'days')
        .format('YYYYMMDD');

      const unixCalAfter = objDay[dayPrev] && moment(objDay[dayPrev]).unix() + 86400;
      const unixDbAfter = moment(objDay[dayAfter]).unix();
      const cond = objDay[dayAfter]
        && unixCalAfter
        && (unixDbAfter <= unixCalAfter);

      if (cond) {
        rsCheck[`day_${i}`] = dayAfter;
      }
    }

    const hasDay_3 = rsCheck.day_0 && rsCheck.day_1 && rsCheck.day_2;
    const hasDay_5 = hasDay_3 && rsCheck.day_3 && rsCheck.day_4;
    if (!objDay_3.hasDay && hasDay_3) {
      objDay_3.hasDay = true;
      objDay_3.objTime = getTime(objDay, rsCheck);
    }
    if (!objDay_5.hasDay && hasDay_5) {
      objDay_5.hasDay = true;
      objDay_5.objTime = getTime(objDay, rsCheck);
    }
  }

  return {objDay_3, objDay_5};
};

const getTime = (objDay, objDayCheck) => {
  const rs = {};

  const arrDayCheck = Object.values(objDayCheck);
  arrDayCheck.forEach((day) => {
    rs[day] = objDay[day];
  });
  return rs;
};

const findTranUser = async({isdn}) => {
  const where = Object.assign({
    isdn,
    day: PROMO_CONFIG.promo_1.timePromo,
  }, whereConfig);
  console.log(moment().format('YYYY-MM-DD HH:mm:ss'), '-------where---findTranUser---', where);

  return new Promise((resolve, reject) => {
    db__.collection(CONNECTION.mongo.col.tran)
      .find(where, {projection: {'createdAt': 1, 'day': 1}})
      .sort({createdAt: 1})
      .toArray(
        (err, result) => {
          if (err) return reject(err);
          else return resolve(result);
        }
      );
  });
};

const checkHasDay35 = async(where) => {
  return new Promise((resolve, reject) => {
    db__.collection(CONNECTION.mongo.col.userPromo).countDocuments(
      where,
      (err, result) => {
        if (err) return reject(err);
        else return resolve(result);
      }
    );
  });
};

async function removeDataPromo(where) {
  console.log(moment().format('YYYY-MM-DD HH:mm:ss'), '--------removeDataPromo--where---', where);

  return new Promise((resolve, reject) => {
    db__.collection(CONNECTION.mongo.col.userPromo).deleteMany(//NOT CHANGE
      where,
      (err, result) => {
        if (err) return reject(err);
        else return resolve(result);
      }
    );
  });
};




