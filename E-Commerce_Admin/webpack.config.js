 if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') {
     module.exports = require('./webpack.config.prod');
     return;
 }

module.exports = require('./webpack.config.dev');
