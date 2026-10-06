import {execSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import webpack from 'webpack';

process.env.NODE_ENV = 'production';
process.env.PUBLIC_URL = 'https://donatr.eu/';

process.on('unhandledRejection', (err) => {
  throw err;
});

const {default: config} = await import('../webpack.config.mts');

config
  .flatMap((c) => c.output?.path ? [c.output.path] : [])
  .forEach((outputPath) => {
    fs.rmSync(outputPath, { recursive: true, force: true });
    fs.mkdirSync(outputPath, { recursive: true });
  });

const compiler = webpack(config);

compiler.run((err, stats) => {
  if (err || !stats) {
    console.error(err);
    console.error('Failed to compile.\n');
    process.exit(1);
  }

  console.log(stats.toString({ colors: true }));
  console.log(stats.hasWarnings() ? 'Compiled with warnings.\n' : 'Compiled successfully.\n');

  execSync('npm ci --omit=dev', { cwd: path.resolve('./build') });
});
