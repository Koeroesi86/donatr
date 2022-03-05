const path = require('path');

module.exports = {
  serverOptions: {
    hostname: 'help.koro.si', //defines what host to provide the instance for
    protocol: 'http', //defines what protocol to use. http/https
  },
  workerOptions: {
    root: '/var/www/help.koro.si/build/public/',
    options: {
      cwd: path.resolve(__dirname),
      env: {
        DATA_BASE_PATH: '/var/www/help.koro.si/data',
      }
    },
    limit: 0,
    limitPerPath: 1,
    index: [
      'index.js'
    ]
  },
};
