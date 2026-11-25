// Run once after adding/removing .glb files:  node make-models.js
// Makes model/models.js so the game also finds your cars when index.html is opened by double click (no server).
const fs = require('fs'), path = require('path'), dir = path.join(__dirname, 'model'), out = {};
(function walk(d, rel) { for (const it of fs.readdirSync(d, { withFileTypes:true })) { const r = rel + '/' + it.name;
  if (it.isDirectory()) walk(path.join(d, it.name), r); else if (/\.glb$/i.test(it.name)) out[r] = fs.readFileSync(path.join(d, it.name)).toString('base64'); } })(dir, 'model');
fs.writeFileSync(path.join(dir, 'models.js'), 'window.DRIFTX_EMBED=' + JSON.stringify(out) + ';');
console.log('models.js ready:', Object.keys(out).join(', ') || '(no .glb found)');
