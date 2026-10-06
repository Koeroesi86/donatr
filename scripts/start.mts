import {type ChildProcess, execSync, spawn} from 'node:child_process';
import path from 'node:path';
import webpack from 'webpack';
import createConfig from '../webpack.config.mts';

process.env.NODE_ENV = 'development';
process.env.NODE_OPTIONS = '--enable-source-maps';

process.on('unhandledRejection', (err) => {
  throw err;
});

const compiler = webpack(createConfig(undefined, { mode: 'development' }));
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
