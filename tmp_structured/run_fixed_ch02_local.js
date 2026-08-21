const fs = require('fs');
let source = fs.readFileSync(__dirname + '/generate_audit_ch02.js', 'utf8');
source = source.replaceAll('\\\\`', '\\`');
// Keep the audited chapter's E: reports directory and retain the summary block.
fs.writeFileSync(__dirname + '/transformed2.js', source, 'utf8');
eval(source);

