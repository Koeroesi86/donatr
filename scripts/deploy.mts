import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const buildName = `build.${Date.now()}`;
const remoteFolder = '/var/www/donatr.eu';
const cacheFolder = './.cache';
const archive = path.join(cacheFolder, `${buildName}.tar`);

const run = (command: string, args: string[]) => execFileSync(command, args, { stdio: 'inherit' });
// the remote command is a single argument, so only the remote shell parses it
const remote = (command: string) => run('ssh', ['vps', command]);

const removeLocalArchives = () => fs.readdirSync(cacheFolder)
  .filter((file) => file.endsWith('.tar'))
  .forEach((file) => fs.rmSync(path.join(cacheFolder, file), { force: true }));

fs.mkdirSync(cacheFolder, { recursive: true });
removeLocalArchives();

console.log(`Compressing ${buildName}`);
run('tar', ['-cvf', archive, './build']);

console.log(`Uploading ${buildName}`);
run('scp', ['-C', '-B', archive, `vps:${remoteFolder}/${buildName}.tar`]);

console.log(`Unpacking compressed archive on remote`);
remote(`cd ${remoteFolder} && tar -xvf ./${buildName}.tar -C /tmp && mv /tmp/build ./${buildName}`);

console.log(`Clean up compressed archive`);
removeLocalArchives();
remote(`cd ${remoteFolder} && rm -rf ./${buildName}.tar`);

// TODO: The engine "node" is incompatible with this module. Expected version ">= 12.20.0".
// console.log(`Install prod dependencies on remote`);
// remote(`cd ${remoteFolder}/${buildName} && npm ci --omit=dev`);

console.log(`Fix remote file permissions`);
remote('sudo chown -R www-data:www-data /var/www');

console.log(`Replacing symlink`);
remote(`cd ${remoteFolder} && rm -rf build && ln -s ${buildName} build`);
