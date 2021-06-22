module.exports = {
  SERVER_APP: {
    BASE_URL: 'http://172.16.20.28:8000/api/v1',
    // BASE_URL: 'https://gatesctvott.gviet.vn:8000/api/v1',
    API: {
      checkUser: '/public/checkUserExists',
      createUser: '/public/registerUser',
      addPackage: '/public/addPackage',
      removePackage: '/public/removePackage',
    }
  },
  MOBI: {
    SERVICE_CODE: '99911',
    USER: 'GAMEMAX',
    PASS: 'GAMEMAX@MBF2019',
    BASE_URL: 'http://10.54.140.22:8888/soap?wsdl',
    PACKAGE: {
      MAX5: {
        amount: 5000,
        expiredMap: 'P1D',
        expiredIn: 1,//day,
        bonusTime: 0,//day,
        dataInternet: '300M',
        syntax: {
          reg_first_success: {
            command: 'DK MAX5',
            response: 'MAX5_DK_SUCC'
          },
          reg_again_success: {
            command: 'DKLAI MAX5',
            response: 'MAX5_DKLAI_SUCC'
          },
          reg_not_success_not_money: {
            command: 'DK MAX5 NOT EM',
            response: 'MAX5_DK_SUCC_NOTEM'
          },
          
          //renew
          renew_success: {
            command: 'GH MAX5',
            response: 'MAX5_GH_SUCC'
          },
          
          //unreg
          unreg_by_system: {
            command: 'HTHUY MAX5',
            response: 'MAX5_HUY_SUCC'
          },
          unreg_by_user: {
            command: 'HUY MAX5',
            response: 'MAX5_HUY_SUCC'
          },
          
          //get pass
          get_pass_by_user: {
            command: 'MK MAX5',
            response: 'MK MAX5'
          },
          
          //status user
          get_status_user: {
            command: 'ROLLBACK MAX5',
            response: 'MAX5_HUY_SUCC'
          },
        }
      },
      MAX8: {
        amount: 8000,
        expiredMap: 'P1D',
        expiredIn: 1,//day,
        bonusTime: 0,//day,
        dataInternet: '450M',
        syntax: {
          reg_first_success: {
            command: 'DK MAX8',
            response: 'MAX8_DK_SUCC'
          },
          reg_again_success: {
            command: 'DKLAI MAX8',
            response: 'MAX8_DKLAI_SUCC'
          },
          reg_not_success_not_money: {
            command: 'DK MAX8 NOT EM',
            response: 'MAX8_DK_SUCC_NOTEM'
          },
          
          //renew
          renew_success: {
            command: 'GH MAX8',
            response: 'MAX8_GH_SUCC'
          },
          
          //unreg
          unreg_by_system: {
            command: 'HTHUY MAX8',
            response: 'MAX8_HUY_SUCC'
          },
          unreg_by_user: {
            command: 'HUY MAX8',
            response: 'MAX8_HUY_SUCC'
          },
          
          //get pass
          get_pass_by_user: {
            command: 'MK MAX8',
            response: 'MK MAX8'
          },
          
          //status user
          get_status_user: {
            command: 'ROLLBACK MAX8',
            response: 'MAX8_HUY_SUCC'
          },
        }
      },
      MAX80: {
        amount: 80000,
        expiredMap: 'P30D',
        expiredIn: 30,//day,
        bonusTime: 0,//day,
        dataInternet: '3000M',
        syntax: {
          reg_first_success: {
            command: 'DK MAX80',
            response: 'MAX80_DK_SUCC'
          },
          reg_again_success: {
            command: 'DKLAI MAX80',
            response: 'MAX80_DKLAI_SUCC'
          },
          reg_not_success_not_money: {
            command: 'DK MAX80 NOT EM',
            response: 'MAX80_DK_SUCC_NOTEM'
          },
          
          //renew
          renew_success: {
            command: 'GH MAX80',
            response: 'MAX80_GH_SUCC'
          },
          
          //unreg
          unreg_by_system: {
            command: 'HTHUY MAX80',
            response: 'MAX80_HUY_SUCC'
          },
          unreg_by_user: {
            command: 'HUY MAX80',
            response: 'MAX80_HUY_SUCC'
          },
          
          //get pass
          get_pass_by_user: {
            command: 'MK MAX80',
            response: 'MK MAX80'
          },
          
          //status user
          get_status_user: {
            command: 'ROLLBACK MAX80',
            response: 'MAX80_HUY_SUCC'
          },
        }
      }
    }
  },
};
