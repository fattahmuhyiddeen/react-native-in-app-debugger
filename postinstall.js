const fs = require('fs');
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf-8'));
const parentDependencies = fs.openSync('./parentDependencies.js', 'w');
fs.writeSync(parentDependencies, '{');
for (const d in read('../../package.json').dependencies) {
  try {
    fs.writeSync(parentDependencies, `"${d}":"${read(`../${d}/package.json`).version}",`);
  } catch (e) {}
}
fs.writeSync(parentDependencies, '}');
