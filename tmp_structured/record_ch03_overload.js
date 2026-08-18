const fs=require('fs');
const root='E:/桌面/学习/考研/knowledge_base_v041_text_first_retry/math2/ch03_derivative_concept';
const ch=JSON.parse(fs.readFileSync(root+'/chapter.json','utf8'));
ch.status='overload_test_partial_failed';
ch.test_result={
  ch02_sol_concurrent:true,
  terra_a:{status:'partial_output_then_system_error',questions_completed:37,basic_questions:15,strong_questions:22,error:'503 Service Unavailable: auth_unavailable'},
  terra_b:{status:'scope_freeze_only_then_system_error',textbook_pages_frozen:20,example_pages_frozen:3,error:'503 Service Unavailable: auth_unavailable'},
  observed_429:false,
  observed_503:true,
  conclusion:'在Sol high活跃时强行并行两个Terra high，两个新会话均遭遇503/auth_unavailable；并发不能作为稳定生产模式。'
};
ch.next_step='等待服务稳定并完成第2章修正后，再按单章节双Terra流程重试第3章；不得把Terra A部分产物当作第3章完成。';
fs.writeFileSync(root+'/chapter.json',JSON.stringify(ch,null,2)+'\n','utf8');
const report=`# 第3章并发边界测试报告\n\n测试目的：在第2章 Sol high 审计仍运行时，启动第3章双 Terra high，观察忽略429启动约束后的实际边界。\n\n## 实际结果\n\n- 第3章教材候选范围：正文 PDF p105–124（20页），教材例题册 p69–71（3页）。\n- Terra A：冻结1000题基础15题、强化22题；完成37道题面/解析记录、页映射和题目包，随后在写入/继续阶段遭遇 503 Service Unavailable: auth_unavailable，状态失败，不代表第3章完成。\n- Terra B：完成规则读取和第3章教材范围冻结，尚未完成教材核心/例题识别；随后遭遇同样的 503 Service Unavailable: auth_unavailable。\n- 第2章 Sol high：同时运行并最终完成90条审计台账。\n- 本次没有观测到429，但两个第3章会话都出现503认证服务错误。\n\n## 结论\n\n忽略429启动约束并同时运行“上一章 Sol high + 下一章双 Terra high”不可作为稳定生产方案。实际瓶颈不仅是429，还包括共享认证服务的503/auth_unavailable；Terra A虽能留下部分真实产物，Terra B未能进入正式内容生成。后续章节应等待当前Sol结束、处理上一章审计并冻结后，再启动下一章双Terra。\n\n第3章正式状态：overload_test_partial_failed。\n`;
fs.writeFileSync(root+'/reports/overload_test_report.md',report,'utf8');
