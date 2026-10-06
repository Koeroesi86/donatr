import {type ChildProcess, execSync, spawn} from 'node:child_process';
import path from 'node:path';
import webpack from 'webpack';

process.env.NODE_ENV = 'development';
process.env.NODE_OPTIONS = '--enable-source-maps';
process.env.PUBLIC_URL = 'http://localhost:3000/';

process.on('unhandledRejection', (err) => {
  throw err;
});

const {default: config} = await import('../webpack.config.mts');

const compiler = webpack(config);
let instance: ChildProcess | undefined;

const killInstance = () => {
  if (!instance) return;

  if (process.platform === 'win32') {
    execSync(`taskkill /PID ${instance.pid} /T /F`);
  } else {
    instance.kill();
  }
};

compiler.watch({ aggregateTimeout: 300 }, (err, stats) => {
  killInstance();

  if (err || !stats) {
    console.error(err);
    return;
  }

  console.log(stats.toString());
  instance = spawn(
    'npx',
    [
      'nws-cli',
      '--config',
      path.resolve(import.meta.dirname, '../serverConfig.local.js')
    ],
    { shell: true, stdio: 'inherit' }
  );
});
