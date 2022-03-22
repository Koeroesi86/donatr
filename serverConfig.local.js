const serverConfig = require('./build/serverConfig');
const path = require("path");

module.exports = {
  protocol: 'http',
  portHttp: 3000,
  servers: [
    {
      ...serverConfig,
      hostname: 'localhost',
      options: {
        ...serverConfig.options,
        root: path.resolve(__dirname, './build/public'),
        env: {
          ...serverConfig.options.env,
          DATA_BASE_PATH: path.resolve(__dirname, './.data/'),
          PUBLIC_URL: 'http://localhost:3000/',
        }
      }
    }
  ],
};
