module.exports = {
  promo_1: {
    timePromo: {
      '$gte': 20191230,
      '$lte': 20200328,
    },
    packageCode: 'MAX5',
    dayContinous: [3, 5],
    pointPerTran: 5000,
  },

  promo_2: {
    timePromo: {
      '$gte': 20200904,
      // '$lte': 20200328,
    },
    packageCode: 'MAX5',
    pointPerTran: 5000,
  }
};
