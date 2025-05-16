const fs = require('fs');
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf-8'));
const parentDependencies = fs.openSync('./parentDependencies.js', 'w');
fs.writeSync(parentDependencies, 'export default {');
for (const d in read('../../package.json').dependencies) {
  try {
    fs.writeSync(parentDependencies, `"${d}":"${read(`../${d}/package.json`).version}",`);
  } catch (e) {}
}
fs.writeSync(parentDependencies, '}');
fs.closeSync(parentDependencies);

const isRNVersionGTE0780 = (v) => v.split('.').map(Number)[1] < 78;

if (isRNVersionGTE0780(read('../react-native/package.json').version)) {
  try {
    const filePath = './useApiInterceptor.js';
    const regex = new RegExp('react-native/src/private/inspector/XHRInterceptor.js', 'g');
    const fileContent = fs.readFileSync(filePath, 'utf8').replace(regex, 'react-native/Libraries/Network/XHRInterceptor.js');
    fs.writeFileSync(filePath, fileContent, 'utf8');
  } catch (err) {
    console.error('Error while replacing strings in file:', err);
  }
}
