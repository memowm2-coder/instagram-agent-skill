// Bundles src/scenes.ts and prints the scene config as JSON (used by tools/clean_plates.py).
const {buildSync} = require('esbuild');
const path = require('path');
const out = buildSync({entryPoints: [path.join(__dirname, '../src/scenes.ts')], bundle: true, platform: 'node', format: 'cjs', write: false});
const m = {exports: {}};
new Function('module', 'exports', 'require', out.outputFiles[0].text)(m, m.exports, require);
process.stdout.write(JSON.stringify(m.exports.SCENES));
