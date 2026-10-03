'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const files = ['engine.js', 'data.js', 'plugin.js'];
const version = require(path.join(root, 'package.json')).version;
const content = '/* Lampac Personal Recommendations ' + version + ' | MIT | uses current profile history */\n' +
  files.map(file => fs.readFileSync(path.join(root, 'src', file), 'utf8').trim()).join('\n;\n') + '\n';
new vm.Script(content, {filename:'recommendations.js'});
fs.mkdirSync(path.join(root, 'dist'), {recursive:true});
fs.writeFileSync(path.join(root, 'dist/recommendations.js'), content);
console.log('Built dist/recommendations.js (' + Buffer.byteLength(content) + ' bytes)');
