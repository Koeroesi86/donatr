const serverConfig = require('./build/serverConfig');
const path = require("path");

module.exports = {
  protocol: 'http',
  portHttp: 3000,
  servers: [
    {
      ...serverConfig,
      serverOptions: {
        ...serverConfig.serverOptions,
        hostname: 'localhost',
      },
      workerOptions: {
        ...serverConfig.workerOptions,
        root: path.resolve(__dirname, './build/public'),
        options:{
          ...serverConfig.workerOptions.options,
          env: {
            ...serverConfig.workerOptions.options.env,
            DATA_BASE_PATH: path.resolve(__dirname, './.data/')
          }
        }
      }
    }
  ],
};
