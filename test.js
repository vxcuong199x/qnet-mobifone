const moment = require('moment');

const whereConfig = {
  packageCode: 5,
  nameCommand: {
    '$in': [
      'reg_first_success',
      'reg_again_success',
      'renew_success',
    ]
  },
  status: 0,
  $and: [
    {day: 202008}
  ]
};
setInterval(function () {
  main()
}, 1000);

function main() {
  const hour = Number(moment().subtract(1, 'h').format('YYYYMMDDHH'));
  const day = Number(moment(hour, 'YYYYMMDDHH').format('YYYYMMDD'));

  const whereStream = Object.assign({}, whereConfig);
  whereStream['$and'] = [
    {day: {$lte: 20200820}},
    {day: {$eq: day}}
  ];
  whereStream.hour = hour;

  console.log('------------------')
  console.log('------------------')
  console.log(whereStream['$and'])
  console.log(whereStream)
}
