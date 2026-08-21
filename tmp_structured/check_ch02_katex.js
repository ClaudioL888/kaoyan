const fs = require('fs');
const path = require('path');
const katex = require('E:/桌面/学习/考研/katex-runtime/node_modules/katex');
const root = 'E:/桌面/学习/考研/knowledge_base_v041_text_first_retry/math2/ch02_sequence_limit';
const files = [
  'questions.jsonl','examples.jsonl','formulas.jsonl','conclusions.jsonl',
  'staging/recognized_question_pages.jsonl','staging/recognized_solution_pages.jsonl'
];
const formulas=[];
function add(expr,src){ if(typeof expr==='string' && expr.trim()) formulas.push({expr,src}); }
for(const rel of files){
  const p=path.join(root,rel); if(!fs.existsSync(p)) continue;
  for(const line of fs.readFileSync(p,'utf8').split(/\r?\n/)){
    if(!line.trim()) continue;
    let o; try{o=JSON.parse(line)}catch(e){continue;}
    function walk(v,k=''){
      if(Array.isArray(v)){ for(const x of v) walk(x,k); return; }
      if(v && typeof v==='object'){ for(const [kk,x] of Object.entries(v)) walk(x,kk); return; }
      if(typeof v==='string' && ['katex_formulas','formulas','official_answer_text_or_katex'].includes(k)) add(v,rel+':'+k);
      if(rel==='formulas.jsonl' && k==='text') add(v,rel+':text');
    }
    walk(o);
  }
}
let failures=[];
for(const [i,{expr,src}] of formulas.entries()){
  try{katex.renderToString(expr,{throwOnError:true,displayMode:false});}
  catch(e){failures.push({index:i,source:src,expr,error:String(e.message||e)});}
}
const out={checked:formulas.length,failures:failures.length,failures};
fs.writeFileSync(path.join(root,'reports','katex_check.json'),JSON.stringify(out,null,2));
console.log(JSON.stringify({checked:out.checked,failures:out.failures}));
if(failures.length) process.exitCode=1;
