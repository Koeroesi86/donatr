const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const webpack = require('webpack');

process.env.NODE_ENV = 'production';
process.env.PUBLIC_URL = 'https://donatr.eu/';
const config = require('../webpack.config');

process.on('unhandledRejection', err => {
  throw err;
});

config.forEach(c => {
  fs.rmSync(c.output.path, { recursive: true, force: true });
  fs.mkdirSync(c.output.path, { recursive: true });
});

const compiler = webpack(config);

compiler.run((err, stats) => {
  if (err) {
    console.error(err);
    console.error('Failed to compile.\n');
    process.exit(1);
  }

  if (stats.hasWarnings()) {
    console.warn(stats.toString({
      colors: true
    }));
    console.warn('Compiled with warnings.\n');
  }

  if (!stats.hasWarnings()) {
    console.log(stats.toString({
      colors: true
    }));
    console.log('Compiled successfully.\n');
  }

  execSync('npm ci --omit=dev', { cwd: path.resolve('./build') });
});
