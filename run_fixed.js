const fs = require('fs');
let source = fs.readFileSync(__dirname + '/generate_audit.js', 'utf8');
source = source.replaceAll('\\\\`', '\\`');
source = source.replace("const outDir = path.join(root, 'reports');", "const outDir = 'C:/Users/ClaudioL/Documents/Codex/2026-08-18/chapter2-sol-audit/outputs';");
source = source.slice(0, source.indexOf('const md ='));
fs.writeFileSync(__dirname + '/transformed2.js', source, 'utf8');
eval(source);
