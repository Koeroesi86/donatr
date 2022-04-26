const path = require('path');

module.exports = {
  hostname: 'donatr.eu', //defines what host to provide the instance for
  protocol: 'http', //defines what protocol to use. http/https
  type: 'worker',
  options: {
    root: '/var/www/donatr.eu/build/public/',
    env: {
      DATA_BASE_PATH: '/var/www/donatr.eu/data',
      PUBLIC_URL: 'https://donatr.eu/',
    },
    limit: 0,
    limitPerPath: 1,
    index: [
      'index.js'
    ],
    // staticWorker: path.resolve(__dirname, '../examples/staticWorker.js'),
  },
};
