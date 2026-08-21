const fs = require('fs');
const path = require('path');

const root = 'E:/桌面/学习/考研/knowledge_base_v041_text_first_retry/math2/ch02_sequence_limit';
const outDir = path.join(root, 'reports');
fs.mkdirSync(outDir, { recursive: true });
const readJsonl = (p) => fs.readFileSync(p, 'utf8').trim().split(/\r?\n/).filter(Boolean).map(JSON.parse);
const q = readJsonl(path.join(root, 'questions.jsonl'));
const ex = readJsonl(path.join(root, 'examples.jsonl'));
const cov = readJsonl(path.join(root, 'textbook_core_coverage.jsonl'));
const formulas = readJsonl(path.join(root, 'formulas.jsonl'));

const rows = [];
const qRow = (x) => {
  const isQ3 = x.question_id === 'q.c02.advanced.003';
  return {
    item_id: x.question_id,
    item_kind: '1000_question',
    audit_status: isQ3 ? 'needs_correction' : 'pass',
    source_pages_checked: {
      question_file: x.question_source_file,
      question_pdf_pages: x.question_source_pages,
      solution_file: x.solution_source_file,
      solution_pdf_pages: x.solution_source_pages
    },
    answer_match: 'pass',
    mapping_match: 'pass',
    formula_match: 'pass',
    issue_severity: isQ3 ? 'medium' : 'none',
    correction: isQ3 ? '将 question_figure_presence 从 true 改为 false；保留 solution_figure_presence=true。解析册 PDF p173 的 y=xe^x 图不在试题册 PDF p67 题面。' : '',
    evidence_note: isQ3
      ? '视觉核对试题册 PDF p67 与解析册 PDF p173；答案(C)及函数图位置正确。ai_review 中迁移边界属于 agent_derived，不能当教材原句。'
      : `视觉核对试题册 PDF p${x.question_source_pages.join(',')} 与解析册 PDF p${x.solution_source_pages.join(',')}；官方答案/全部输出与解析一致。${x.solution_source_pages.length > 1 ? '跨页解析已核对。' : ''} ai_review 的迁移边界属于 agent_derived。`
  };
};
q.forEach(x => rows.push(qRow(x)));

const exRow = (x) => {
  const bad = x.id === 'ex.ch02.2.5';
  const figure = ['ex.ch02.2.13', 'ex.ch02.2.14', 'ex.ch02.2.15'].includes(x.id);
  return {
    item_id: x.id,
    item_kind: x.category === 'textbook_example' ? 'textbook_example' : 'textbook_exercise',
    audit_status: bad ? 'error' : (figure ? 'needs_correction' : 'pass'),
    source_pages_checked: {
      question_file: x.question_source_file,
      question_pdf_pages: x.question_source_pages,
      solution_file: x.solution_source_file,
      solution_pdf_pages: x.solution_source_pages
    },
    answer_match: bad ? 'fail' : 'pass',
    mapping_match: 'pass',
    formula_match: 'pass',
    issue_severity: bad ? 'high' : (figure ? 'medium' : 'none'),
    correction: bad
      ? '将 official_answer_text_or_katex 改为“最大值为2，最小值为1/2，选A”；题面 a_n=1-(-1)^n/n，a_1=2、a_2=1/2。'
      : (figure ? '将 solution_figure_presence 改为 true；例2.13解析页 PDF p97、例2.14解析页 PDF p98、例2.15解析页 PDF p100 各有教材迭代示意图。' : ''),
    evidence_note: bad
      ? '视觉核对例题册 PDF p29 与教材正文官方解答 PDF p88：选项 A 只说明有最大/最小值，原记录把最大值误写为1；最大值实际为2。'
      : `视觉核对例题册 PDF p${x.question_source_pages.join(',')} 与教材正文 PDF p${x.solution_source_pages.join(',')}；最终结果和必要条件一致。${figure ? '解析页含图而记录声明为false。' : ''} ai_review 的迁移句属于 agent_derived。`
  };
};
ex.forEach(x => rows.push(exRow(x)));

const coreIssues = {
  82: ['needs_correction','medium','将 con.discrete_function 从 conclusion 改为普通页摘要或补充与本页目标/重难点对应的来源属性；p82 未见遗漏公式。'],
  83: ['needs_correction','high','补充“子列”定义及其注（从原数列按原顺序抽取无穷项），并将“数列一定有无穷多项”和“数列是正整数自变量函数”拆成原子记录。'],
  84: ['needs_correction','high','补充等差/等比数列定义、单调数列与有界数列定义、证明有界的四种方法及等比和适用条件；当前仅7个公式实体不足以覆盖蓝框核心。'],
  85: ['pass','none','视觉核对：重要数列结论、极限定义及定义注意均有实体；普通说明可保留摘要。'],
  86: ['pass','none','视觉核对：无遗漏的定义/公式/结论；绝对值极限与子列性质已记录。'],
  87: ['needs_correction','high','补充绝对值极限逆命题不成立、A=0时等价命题、子列收敛不推出原列收敛等蓝框注；当前0项不合格。'],
  88: ['needs_correction','high','补充保号性完整条件、四则运算公式在 coverage 页的实体引用，以及“最值由比较得到/尾项资格”注意；当前只列3个结论。'],
  89: ['needs_correction','high','补充四则运算规则、存在性组合规则及“a_n+b_n有极限不推出两者各自有极限”的注；当前仅海涅定理实体。'],
  90: ['needs_correction','high','补充海涅定理三种常用取法（x_n=1/n、x_n=n、x_n→a）及p90蓝框注意；当前0项不合格。'],
  91: ['needs_correction','high','补充“放缩常用方法”注意和(1+1/n)^n-e的一阶等价提示；夹逼公式虽有，但页级核心未全捕获。'],
  92: ['needs_correction','high','补充和式夹逼的符号条件、三项AM-GM/平方和不等式、幂函数单调、比例不等式、sin x<x<tan x等逐项公式；当前仅2个公式。'],
  93: ['needs_correction','high','补充arctan/ arcsin不等式、e^x与ln(1+x)不等式、压缩映射原理一/二及相关注意；当前0项。'],
  94: ['needs_correction','high','补充n次根极限取最大值、分段的(sin^n x+cos^n x)^{1/n}与(1+|x|^{3n})^{1/n}结论及根号条件；当前仅等价无穷小。'],
  95: ['needs_correction','medium','将单调有界准则拆成“递增有上界/递减有下界”两个适用分支，并补充证明单调的a/b方法条件；当前摘要过泛。'],
  96: ['needs_correction','high','补充单调性方法c/d/e（不等式、同号差分、迭代函数单调性）及适用条件；当前0项。'],
  97: ['pass','none','视觉核对固定点迭代公式/结论已覆盖；例2.12和例2.13另有逐题记录。'],
  98: ['needs_correction','medium','补充例2.14解答旁的图示注意/迭代方向说明，或明确作为普通文本摘要并标agent_derived部分。'],
  99: ['pass','none','视觉核对为例2.15官方证明页，核心实体无新增遗漏。'],
  100: ['pass','none','速度比定义及I=0、有限非零、无穷三种解释已记录；图示属于例题解答。'],
  101: ['pass','none','ε-N不表达收敛速度的注意已记录；其余为例题官方解答。'],
  102: ['needs_correction','high','补充“不能反向套用速度命题/做与不做几乎无差异”的教材注意事项；当前0项。'],
  103: ['pass','none','本页为练习题与解答入口，题目已在examples.jsonl单独覆盖；无遗漏的教材核心实体。'],
  104: ['pass','none','本页为练习2.6/2.7/2.8官方解答，题目及答案已在examples.jsonl覆盖。']
};
cov.forEach(c => {
  const [status, sev, correction] = coreIssues[c.pdf_page];
  rows.push({
    item_id: `textbook_core_page.${c.pdf_page}`,
    item_kind: 'textbook_core_page',
    audit_status: status,
    source_pages_checked: { file: '27张宇基础30讲（高数）_新书签.pdf', pdf_pages: [c.pdf_page] },
    answer_match: 'not_applicable',
    mapping_match: 'pass',
    formula_match: status === 'pass' ? 'pass' : 'needs_correction',
    issue_severity: sev,
    correction,
    evidence_note: `已视觉查看教材原页 PDF p${c.pdf_page}；现有覆盖计数=${JSON.stringify(c.core_item_counts)}，实体=${(c.captured_entity_ids||[]).join(',')||'∅'}。`
  });
});

const formulaFix = {
  'f.arithmetic.general':'补充适用条件 n∈N+、d为常数（教材定义处注明d≠0）。',
  'f.arithmetic.sum':'补充 n∈N+、等差项条件和S_n定义。',
  'f.geometric.general':'补充 r为常数且教材定义要求 r≠0。',
  'f.geometric.sum':'补充 n∈N+、r=1与r≠1分支适用条件。',
  'f.sum.k':'补充 n∈N+。',
  'f.sum.k2':'补充 n∈N+。',
  'f.sum.telescoping':'补充 k∈N+、n∈N+及裂项适用范围。',
  'f.limit.definition':'补充 x_n为数列、a为常数以及“n>N”的尾部条件。',
  'f.abs_limit':'补充前提 lim x_n=A存在。',
  'f.limit.operations':'补充两序列极限存在及商式分母极限 b≠0。',
  'f.squeeze':'补充从某个N起 y_n≤x_n≤z_n及两端极限相同。',
  'f.squeeze.sum_bounds':'补充每项满足 u_min≤u_i≤u_max 的条件；必要时拆分正项/负项版本。',
  'f.contraction':'补充a为不动点、n∈N+及0<k<1。',
  'f.speed_ratio':'补充x_n,y_n均趋a且分母误差最终非零。',
  'f.common_ineq':'补充a,b≥0（AM-GM）并拆出反三角不等式 ||a|-|b||≤|a-b|；当前±式不等于教材全部条目。',
  'f.trig_small':'补充x→0条件及等价无穷小语义。'
};
formulas.forEach(f => rows.push({
  item_id: f.id,
  item_kind: 'textbook_formula',
  audit_status: 'needs_correction',
  source_pages_checked: { file: '27张宇基础30讲（高数）_新书签.pdf', pdf_pages: f.source_pages },
  answer_match: 'not_applicable',
  mapping_match: 'pass',
  formula_match: 'needs_correction',
  issue_severity: 'medium',
  correction: formulaFix[f.id] || '补充公式适用条件字段。',
  evidence_note: `KaTeX视觉/语义核对通过，且本地 KaTeX 0.16.47 实际编译通过；当前记录缺少独立 conditions/applicability 字段。源页 p${f.source_pages.join(',')}。`
}));

rows.push({
  item_id: 'page_mappings.boundaries', item_kind: 'page_mapping_boundary', audit_status: 'pass',
  source_pages_checked: { solution_basic: [18,19,20], solution_advanced: [173,174,175,176], next_chapter: [21,177] },
  answer_match: 'not_applicable', mapping_match: 'pass', formula_match: 'not_applicable', issue_severity: 'none', correction: '',
  evidence_note: '视觉核对解析册 PDF p21进入第3章、p177进入第3章；基础解析真实边界为p20，强化解析为p173-176，符合冻结范围。'
});
rows.push({
  item_id: 'page_mappings.cross_page_flags', item_kind: 'page_mapping', audit_status: 'needs_correction',
  source_pages_checked: { cross_page_items: ['q.c02.basic.004', 'q.c02.advanced.005', 'q.c02.advanced.008', 'ex.ch02.2.6', 'ex.ch02.2.7', 'ex.ch02.2.9', 'ex.ch02.2.11', 'ex.ch02.2.12', 'ex.ch02.2.14', 'ex.ch02.2.15', 'ex.ch02.2.16', 'ex.ch02.2.18'] },
  answer_match: 'not_applicable', mapping_match: 'partial', formula_match: 'not_applicable', issue_severity: 'medium',
  correction: '为所有跨页映射增加显式 cross_page=true 与 continuation_of/starts_on_page 字段；当前仅靠页数组和evidence文字隐式标记。',
  evidence_note: '页码数组与视觉边界均正确；问题是Schema没有显式跨页标记，后续机械验收难以区分跨页与普通多页。'
});
rows.push({
  item_id: 'source_id.consistency', item_kind: 'mapping_metadata', audit_status: 'needs_correction',
  source_pages_checked: { files: ['chapter.json','source_scopes.jsonl','page_mappings.jsonl','formulas.jsonl','examples.jsonl'] },
  answer_match: 'not_applicable', mapping_match: 'partial', formula_match: 'not_applicable', issue_severity: 'medium',
  correction: '统一教材 source_id：chapter.json 使用 src.textbook，而其余台账使用 src.math2.textbook_ch02；应统一或提供别名映射。',
  evidence_note: '文件名和PDF页码视觉正确，但来源ID不一致会影响关系/资产机械断链检查。'
});

const jsonl = rows.map(r => JSON.stringify(r)).join('\n') + '\n';
fs.writeFileSync(path.join(outDir, 'sol_audit.jsonl'), jsonl, 'utf8');
const count = (s) => rows.filter(r => r.audit_status === s).length;
const high = rows.filter(r => r.issue_severity === 'high');
const passQ = rows.filter(r => r.item_kind === '1000_question' && r.answer_match === 'pass').length;
const passEx = rows.filter(r => ['textbook_example','textbook_exercise'].includes(r.item_kind) && r.answer_match === 'pass').length;
const md = `# 第2章“数列极限”Sol high 高风险准确性审计\n\n- 审计对象：合并目录 \`knowledge_base_v041_text_first_retry/math2/ch02_sequence_limit\`；仅核对四份白名单 PDF。\n- 视觉核对分母：1000题 23（基础12、强化11）；教材例题/习题 25；教材核心页 23（PDF p82–104）。\n- 记录总数：${rows.length}；pass ${count('pass')}；needs_correction ${count('needs_correction')}；error ${count('error')}；unresolved ${count('unresolved')}.\n- 1000题答案视觉匹配：${passQ}/23；教材例题/习题最终结果匹配：${passEx}/25（例2.5为 error）。\n- 教材核心逐页台账：23/23 页已实际查看，但 ${rows.filter(r=>r.item_kind==='textbook_core_page' && r.audit_status!=='pass').length} 页存在漏项或实体粒度问题。\n- 公式 KaTeX：16/16 条使用本地 KaTeX 0.16.47 实际编译通过；但全部公式记录缺少独立适用条件字段，故不能视为核心覆盖通过。\n- 重复评述：1000题与教材例题/习题的完整 ai_review/item_specific_analysis 无完全重复组。\n- 反向索引/来源元数据：发现教材 source_id 不一致（\`src.textbook\` vs \`src.math2.textbook_ch02\`），需统一后复验。\n\n## 必须优先修正\n\n${high.map(r=>`- **${r.item_id}**：${r.correction}`).join('\n')}\n\n## 结论\n\n本审计不通过章节发布。答案与页码主体可靠，但存在教材例题2.5答案错误、强化题3题面配图声明错误、教材核心覆盖多页漏项、公式适用条件元数据缺失、跨页标记与source_id一致性问题。修正后应重新运行主 Agent Gate 9；在这些问题消除前不得标记 \`first_draft_accepted\`。\n`;
fs.writeFileSync(path.join(outDir, 'sol_audit_summary.md'), md, 'utf8');
console.log(JSON.stringify({rows: rows.length, pass: count('pass'), needs_correction: count('needs_correction'), error: count('error'), high: high.length}, null, 2));
