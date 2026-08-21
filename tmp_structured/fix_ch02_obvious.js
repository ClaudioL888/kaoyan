const fs=require('fs');
const root='E:/桌面/学习/考研/knowledge_base_v041_text_first_retry/math2/ch02_sequence_limit';
function read(name){return fs.readFileSync(root+'/'+name,'utf8').split(/\r?\n/).filter(Boolean).map(JSON.parse)}
function write(name,rows){fs.writeFileSync(root+'/'+name,rows.map(x=>JSON.stringify(x)).join('\n')+'\n','utf8')}
const ex=read('examples.jsonl');
for(const x of ex){
  if(x.id==='ex.ch02.2.5'){
    x.official_answer_text_or_katex='最大值为2，最小值为1/2，选A';
    x.ai_review='先计算 a_1=2、a_2=1/2，再证明 n≥3 时 1/2<a_n<2；因此最大值为2、最小值为1/2，选A。陷阱是把 a_1=1-(-1) 误算成1。';
    x.item_specific_analysis=x.ai_review;
  }
}
write('examples.jsonl',ex);
const q=read('questions.jsonl');
for(const x of q) if(x.question_id==='q.c02.advanced.003') x.question_figure_presence=false;
write('questions.jsonl',q);
const ch=JSON.parse(fs.readFileSync(root+'/chapter.json','utf8'));
ch.status='audit_failed_needs_correction';
ch.audit_summary={audit_rows:90,pass:52,needs_correction:37,error:1,unresolved:0,obvious_corrections_applied:['ex.ch02.2.5 official answer and review','q.c02.advanced.003 question figure presence'],remaining_high_priority:'textbook_core_coverage omissions; formula applicability metadata; source_id and page mapping consistency'};
fs.writeFileSync(root+'/chapter.json',JSON.stringify(ch,null,2)+'\n','utf8');
const report=`# 第2章主 Agent 验收报告（Sol 审计后）\n\n最终状态：**audit_failed_needs_correction**。本章尚未通过 V0.4.1，不能标记 first_draft_accepted。\n\n- 固定分母：1000题23（基础12、强化11）；教材例题/习题25；教材正文23页。\n- Terra A/B 已合并；Sol high 逐条审计台账共90条：pass 52、needs_correction 37、error 1、unresolved 0。\n- 1000题答案与页级映射：23/23通过；强化题3题面配图声明已按Sol意见修正为false（解析页配图保留）。\n- 教材例题2.5已修正为最大值2、最小值1/2，选A。\n- KaTeX实际编译：118个候选公式编译无失败；Sol确认16条教材公式可编译，但公式记录仍缺独立适用条件字段。\n- 仍未解决：教材正文p83、p84、p87-p94、p96、p102核心实体/蓝框注漏项；公式适用条件元数据；教材source_id统一；部分跨页/来源元数据复核。\n- 审计原始台账：reports/sol_audit.jsonl；汇总：reports/sol_audit_summary.md。\n\n下一步必须补齐上述教材核心与公式条件，再由主Agent执行Gate 9机械及语义复验；本报告不将needs_correction视为通过。\n`;
fs.writeFileSync(root+'/reports/acceptance_report.md',report,'utf8');
