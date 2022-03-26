const {execSync} = require('child_process');

const buildName = `build.${Date.now()}`;
const remoteFolder = '/var/www/help.koro.si';

execSync(`rm -rf ./.cache/*.tar`);

console.log(`Compressing ${buildName}`);
execSync(`tar -cvf ./.cache/${buildName}.tar ./build`);

console.log(`Uploading ${buildName}`);
execSync(`scp -C -B ./.cache/${buildName}.tar vps:${remoteFolder}/${buildName}.tar`);

console.log(`Unpacking compressed archive on remote`);
execSync(`ssh vps "cd ${remoteFolder} && tar -xvf ./${buildName}.tar -C /tmp && mv /tmp/build ./${buildName}`);

console.log(`Clean up compressed archive`);
execSync(`rm -rf ./.cache/*.tar`);
execSync(`ssh vps "cd ${remoteFolder} && rm -rf ./${buildName}.tar`);

// TODO: The engine "node" is incompatible with this module. Expected version ">= 12.20.0".
// console.log(`Install prod dependencies on remote`);
// execSync(`ssh vps "cd ${remoteFolder}/${buildName} && yarn install --production --frozen-lockfile`);

console.log(`Fix remote file permissions`);
execSync(`ssh vps "sudo chown -R www-data:www-data /var/www`);

console.log(`Replacing symlink`);
execSync(`ssh vps "cd ${remoteFolder} && rm -rf build && ln -s ${buildName} build"`);
