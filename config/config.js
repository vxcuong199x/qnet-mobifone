const CONFIG = module.exports = {
  EC_SYSTEM: {
    SUCCESS: {
      CODE: 0,
      MESSAGE: 'SUCCESS'
    },
    NOT_SUCCESS: {
      CODE: 1,
      MESSAGE: 'NOT_SUCCESS'
    },
    INVALID_PARAM: {
      CODE: 400,
      MESSAGE: 'INVALID_PARAM'
    },
  },
  
  EC: {
    SUCCESS: {
      resultCode: '1',
      result: 'OK'
    },
    FAIL: {
      resultCode: '0',
      result: 'FAIL'
    },
    INVALID_PARAM: {
      resultCode: '400',
      result: 'INVALID_PARAM'
    },
    IP_NOT_ALLOWED: {
      resultCode: '3',
      result: 'IP_NOT_ALLOWED'
    },
    ACCESS_DENIED: {
      resultCode: '403',
      result: 'ACCESS_DENIED'
    },
    WRONG_SIGNATURE: {
      resultCode: '405',
      result: 'WRONG_SIGNATURE'
    },
    SYSTEM_ERROR: {
      resultCode: '500',
      result: 'SYSTEM_ERROR'
    }
  },
};