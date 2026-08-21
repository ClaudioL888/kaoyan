const fs=require('fs');
const root='E:/桌面/学习/考研/knowledge_base_v041_text_first_retry/math2/ch02_sequence_limit';
const source='src.math2.textbook_ch02';
function read(name){const p=root+'/'+name;return fs.existsSync(p)?fs.readFileSync(p,'utf8').split(/\r?\n/).filter(Boolean).map(JSON.parse):[]}
function write(name,rows){fs.writeFileSync(root+'/'+name,rows.map(x=>JSON.stringify(x)).join('\n')+'\n','utf8')}
function appendUnique(name,items){const rows=read(name), ids=new Set(rows.map(x=>x.id)); for(const x of items) if(!ids.has(x.id)){rows.push(x);ids.add(x.id)} write(name,rows)}
const defs=[
 {id:'def.subsequence',entity_kind:'definition',title:'子列定义',text:'从原数列 {a_n} 中选取无穷多项，并按原来的先后顺序组成新数列 {a_{n_k}}，其中 n_1<n_2<… 为正整数，该新数列称为原数列的子列。',source_id:source,source_pages:[83],confirmation:'source_page_confirmed'},
 {id:'def.arithmetic_sequence',entity_kind:'definition',title:'等差数列定义',text:'首项为 a_1、公差为 d(d≠0) 的数列 a_1,a_1+d,a_1+2d,…,a_1+(n-1)d,… 称为等差数列。',source_id:source,source_pages:[84],confirmation:'source_page_confirmed'},
 {id:'def.geometric_sequence',entity_kind:'definition',title:'等比数列定义',text:'首项为 a_1、公比为 r(r≠0) 的数列 a_1,a_1r,a_1r^2,…,a_1r^{n-1},… 称为等比数列。',source_id:source,source_pages:[84],confirmation:'source_page_confirmed'},
 {id:'def.monotone_sequence',entity_kind:'definition',title:'单调数列定义',text:'若对所有正整数 n，有 a_{n+1}≥a_n（或 a_{n+1}≤a_n），则称数列为单调不减（或单调不增）；严格不等号对应单调增加或单调减少。',source_id:source,source_pages:[84],confirmation:'source_page_confirmed'},
 {id:'def.bounded_sequence',entity_kind:'definition',title:'有界数列定义',text:'若对所有正整数 n，存在正实数 M，使 |a_n|≤M，则称数列 {a_n} 有界。',source_id:source,source_pages:[84],confirmation:'source_page_confirmed'}
];
appendUnique('knowledge_points.jsonl',defs);
appendUnique('conclusions.jsonl',[
 {id:'con.heine',entity_kind:'conclusion',title:'海涅定理',text:'函数极限存在且等于 A 的充要条件是：对定义域内任意趋于 a 的数列 {x_n}（x_n≠a），相应函数值序列 f(x_n) 都趋于 A。',source_id:source,source_pages:[89,90],confirmation:'source_page_confirmed'},
 {id:'con.contraction_principle',entity_kind:'conclusion',title:'压缩映射原理',text:'若 |x_{n+1}-a|≤k|x_n-a| 且 0<k<1，则 x_n→a；若 x_{n+1}=f(x_n)、f 可导、a 是唯一不动点且 |f′(x)|≤k<1，则同样收敛于 a。',source_id:source,source_pages:[93],confirmation:'source_page_confirmed'},
 {id:'con.root_max',entity_kind:'conclusion',title:'有限项 n 次方根取最大值',text:'对非负常数 a_1,…,a_m，有 lim_{n→∞}(a_1^n+…+a_m^n)^{1/n}=max{a_1,…,a_m}。',source_id:source,source_pages:[94],confirmation:'source_page_confirmed'},
 {id:'con.root_sin_cos',entity_kind:'conclusion',title:'正弦余弦 n 次方根',text:'当 0≤x≤π/2 时，lim_{n→∞}(sin^n x+cos^n x)^{1/n}=cos x（0≤x≤π/4），sin x（π/4≤x≤π/2）。',source_id:source,source_pages:[94],confirmation:'source_page_confirmed'},
 {id:'con.root_abs_power',entity_kind:'conclusion',title:'绝对值幂 n 次方根',text:'lim_{n→∞}(1+|x|^{3n})^{1/n}=1（|x|≤1），|x|^3（|x|>1）。',source_id:source,source_pages:[94],confirmation:'source_page_confirmed'}
]);
appendUnique('knowledge_points.jsonl',[
 {id:'note.subsequence_nonconverse',entity_kind:'note',title:'子列逆命题注意',text:'一个数列存在收敛的子列，并不能推出原数列收敛。',source_id:source,source_pages:[87],confirmation:'source_page_confirmed'},
 {id:'note.abs_reverse',entity_kind:'note',title:'绝对值极限逆命题注意',text:'lim|a_n|=|A| 一般不能推出 lim a_n=A；当 A=0 时 lim a_n=0 与 lim|a_n|=0 等价。',source_id:source,source_pages:[87],confirmation:'source_page_confirmed'},
 {id:'note.extreme_value',entity_kind:'note',title:'数列最值注意',text:'数列的最大值和最小值必须通过逐项比较确认；只观察尾项或极限不能直接得到最值。',source_id:source,source_pages:[88],confirmation:'source_page_confirmed'},
 {id:'note.sum_limit_not_individual',entity_kind:'note',title:'和的极限逆命题注意',text:'a_n+b_n 有极限并不能推出 a_n、b_n 各自有极限。',source_id:source,source_pages:[89],confirmation:'source_page_confirmed'},
 {id:'note.squeeze_scaling',entity_kind:'note',title:'放缩法注意',text:'使用夹逼定理时必须构造同趋的上下界；分母、项数和符号条件需同时核对。',source_id:source,source_pages:[91],confirmation:'source_page_confirmed'},
 {id:'note.bounded_methods',entity_kind:'note',title:'证明有界的常用方法',text:'教材列出找 M、放缩法、找最值、基本不等式法四种证明数列有界的方法。',source_id:source,source_pages:[84],confirmation:'source_page_confirmed'},
 {id:'note.speed_not_reverse',entity_kind:'note',title:'收敛速度命题注意',text:'收敛速度比较中的充分条件不能不加条件地反向套用；需按教材给出的极限比值定义判断。',source_id:source,source_pages:[102],confirmation:'source_page_confirmed'}
]);
const extraF=[
 {id:'f.amgm.two',entity_kind:'formula',title:'二元均值不等式',text:'\u221a(ab)≤(a+b)/2≤\u221a((a^2+b^2)/2)',applicability_conditions:'a,b≥0',source_id:source,source_pages:[92],confirmation:'source_page_confirmed'},
 {id:'f.amgm.three',entity_kind:'formula',title:'三元均值不等式',text:'\u221b(abc)≤(a+b+c)/3≤\u221a((a^2+b^2+c^2)/3)',applicability_conditions:'a,b,c≥0',source_id:source,source_pages:[92],confirmation:'source_page_confirmed'},
 {id:'f.power.monotonic',entity_kind:'formula',title:'幂函数比较',text:'a>b>0 时，m>0⇒a^m>b^m；m<0⇒a^m<b^m',applicability_conditions:'a>b>0，m 为实数',source_id:source,source_pages:[92],confirmation:'source_page_confirmed'},
 {id:'f.ratio.inequality',entity_kind:'formula',title:'比例不等式',text:'0<a<x<b，0<c<y<d⇒c/b<y/x<d/a',applicability_conditions:'所有分母与被比较量为正',source_id:source,source_pages:[92],confirmation:'source_page_confirmed'},
 {id:'f.trig.bounds',entity_kind:'formula',title:'三角函数放缩',text:'sin x<x<tan x (0<x<π/2)，且 sin x<x (x>0)',applicability_conditions:'按括号内区间使用',source_id:source,source_pages:[92],confirmation:'source_page_confirmed'},
 {id:'f.inverse_trig_bounds',entity_kind:'formula',title:'反三角函数不等式',text:'arctan x≤x≤arcsin x (0≤x≤1)',applicability_conditions:'0≤x≤1',source_id:source,source_pages:[93],confirmation:'source_page_confirmed'},
 {id:'f.exp_log_bounds',entity_kind:'formula',title:'指数对数不等式',text:'e^x≥x+1；x−1≥ln x (x>0)；1/(1+x)<ln(1+1/x)<1/x (x>0)',applicability_conditions:'分别满足对应 x 的实数或正数条件',source_id:source,source_pages:[93],confirmation:'source_page_confirmed'},
 {id:'f.root.max',entity_kind:'formula',title:'有限项根式最大值',text:'max(a_i)≤(a_1^n+…+a_m^n)^{1/n}≤max(a_i)m^{1/n}',applicability_conditions:'a_i≥0，m 为固定正整数',source_id:source,source_pages:[94],confirmation:'source_page_confirmed'}
];
appendUnique('formulas.jsonl',extraF);
const conditions={
 'f.arithmetic.general':'n∈N+，d 为固定实数', 'f.arithmetic.sum':'n∈N+，d 为固定实数', 'f.geometric.general':'n∈N+，r≠0', 'f.geometric.sum':'n∈N+；r=1 或 r≠1 分情况', 'f.sum.k':'n∈N+', 'f.sum.k2':'n∈N+', 'f.sum.telescoping':'n∈N+', 'f.limit.definition':'n∈N+，ε>0', 'f.abs_limit':'a_n 收敛且极限 A 为有限实数', 'f.limit.operations':'两序列极限均存在；商式还需 b≠0 且分母最终非零', 'f.squeeze':'不等式对充分大的 n 成立且两端极限相同', 'f.squeeze.sum_bounds':'u_i 非负且上下界对所有项统一有效', 'f.contraction':'对所有 n 成立，0<k<1 且 a 为目标不动点', 'f.speed_ratio':'分母序列最终非零且两误差均按极限定义比较', 'f.common_ineq':'根式部分 a,b≥0；绝对值部分 a,b 为实数', 'f.trig_small':'x→0'};
const fs0=read('formulas.jsonl'); for(const x of fs0) if(!x.applicability_conditions && conditions[x.id]) x.applicability_conditions=conditions[x.id]; write('formulas.jsonl',fs0);
const cov=read('textbook_core_coverage.jsonl');
const additions={83:{ids:['def.subsequence','note.subsequence_nonconverse'],definitions:1,notes:1},84:{ids:['def.arithmetic_sequence','def.geometric_sequence','def.monotone_sequence','def.bounded_sequence','note.bounded_methods'],definitions:4,notes:1},87:{ids:['note.abs_reverse','note.subsequence_nonconverse'],notes:2},88:{ids:['note.extreme_value','f.limit.operations'],notes:1,formulas:1},89:{ids:['con.heine','note.sum_limit_not_individual'],conclusions:1,notes:1},90:{ids:['con.heine'],conclusions:1},91:{ids:['note.squeeze_scaling'],notes:1},92:{ids:['f.amgm.two','f.amgm.three','f.power.monotonic','f.ratio.inequality','f.trig.bounds'],formulas:5},93:{ids:['f.inverse_trig_bounds','f.exp_log_bounds','con.contraction_principle'],formulas:2,conclusions:1},94:{ids:['f.root.max','con.root_max','con.root_sin_cos','con.root_abs_power'],formulas:1,conclusions:3},96:{ids:['con.contraction_principle'],conclusions:1},102:{ids:['note.speed_not_reverse'],notes:1}};
for(const row of cov){const a=additions[row.pdf_page]; if(!a)continue; row.captured_entity_ids=[...new Set([...(row.captured_entity_ids||[]),...a.ids])]; for(const k of ['definitions','formulas','conclusions','notes']) if(a[k]) row.core_item_counts[k]=(row.core_item_counts[k]||0)+a[k]; row.status='complete';}
write('textbook_core_coverage.jsonl',cov);
const ch=JSON.parse(fs.readFileSync(root+'/chapter.json','utf8')); for(const s of ch.source_files||[]) {if(s.source_id==='src.textbook')s.source_id=source;if(s.source_id==='src.example_questions')s.source_id='src.math2.textbook_examples_ch02';} ch.core_augmentation={added_definitions:5,added_formulas:8,added_notes:7,added_conclusions:5,conditions_added:true,source_page_visual_basis:'Sol audit rendered pages p83,p84,p87-p94,p96,p102'}; fs.writeFileSync(root+'/chapter.json',JSON.stringify(ch,null,2)+'\n','utf8');
