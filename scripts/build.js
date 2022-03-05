const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const webpack = require('webpack');

process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';
process.env.PUBLIC_URL = 'https://help.koro.si/';
const config = require('../webpack.config');

process.on('unhandledRejection', err => {
  throw err;
});

config.forEach(c => fs.emptyDirSync(c.output.path));

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

  execSync('yarn install --prod --frozen-lockfile', { cwd: path.resolve('./build') });
});
