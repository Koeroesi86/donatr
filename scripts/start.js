const { spawn, execSync } = require('child_process');
const webpack = require('webpack');

process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

process.on('unhandledRejection', err => {
  throw err;
});

const config = require('../webpack.config');
const path = require("path");

const compiler = webpack(config);
let instance;

const killInstance = () => {
  if (!instance) return;

  if (process.platform === "win32") {
    execSync(`taskkill /PID ${instance.pid} /T /F`)
  } else {
    instance.kill();
  }
};

compiler.watch({
  aggregateTimeout: 300,
  poll: undefined
}, async (err, stats) => {
  killInstance();

  if (err) {
    return console.error(err);
  }
  console.log(stats.toString());
  instance = spawn(
    'yarn',
    [
      'nws-cli',
      '--config',
      path.resolve(__dirname, '../serverConfig.local.js')
    ],
    { shell: true, stdio: 'inherit' }
  );
});
