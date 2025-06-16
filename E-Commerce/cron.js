// If NODE_ENV is not set, default to 'production'
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

console.log('NODE_ENV:', process.env.NODE_ENV);

if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'new-test') {
  var cron = require('node-cron');
  var cronActions = require('./modules/cronActions/cronController');

  console.log('cron.js - Setting up scheduled tasks')

  //to-do

  cron.schedule('0 8 * * *', () => {
    console.log('Running sendOtoms task');
    cronActions.sendOtoms();
  });

  cron.schedule('0 7 * * *', () => {
    console.log('Running changeNaknadnoDate task');
    cronActions.changeNaknadnoDate();
  });
  
  cron.schedule('20 6 * * *', () => {
    console.log('Running updateCurrencies task');
    cronActions.updateCurrencies();
  });
  
  // cron.schedule('0 * * * *', () => {
  //   cronActions.sendAbandonedCartMails();
  // });
  
  /*
  cron.schedule('0 11 * * *', () => {
    cronActions.checkIfStillSent();
  });
  */

  /*
  cron.schedule('0 * * * *', () => {
    cronActions.updateSitemap();
  });
  */
}
