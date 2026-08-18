const fs=require('fs'),path=require('path'),out=__dirname,root=path.join(out,'reports');
const v=JSON.parse(fs.readFileSync(path.join(root,'katex_validation.json'),'utf8'));
const c=fs.readFileSync(path.join(out,'textbook_core_coverage.jsonl'),'utf8').trim().split(/\r?\n/).map(JSON.parse);
const e=fs.readFileSync(path.join(out,'examples.jsonl'),'utf8').trim().split(/\r?\n/).map(JSON.parse);
const pk=fs.readdirSync(path.join(out,'question_packages')).filter(x=>x.endsWith('.json')).map(x=>JSON.parse(fs.readFileSync(path.join(out,'question_packages',x),'utf8')));
const result={katex_passed:v.status==='passed'&&v.failure_count===0,formal_formula_count:v.formal_formula_count,core_checked:c.filter(x=>x.page_checked).length,core_total:c.length,example_solutions:e.filter(x=>x.solution_text&&x.solution_source_pages).length,example_total:e.length,package_count:pk.length,package_reviewed:pk.filter(x=>x.package_status==='assembled_reviewed_source_page_confirmed').length,package_pending:pk.filter(x=>x.package_status==='assembled_pending_ai_review').length,acceptance_report_exists:fs.existsSync(path.join(root,'acceptance_report.md')),efficiency_report_exists:fs.existsSync(path.join(root,'efficiency_report.md'))};
fs.writeFileSync(path.join(root,'final_acceptance_check.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
