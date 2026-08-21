# 第3章并发边界测试报告

测试目的：在第2章 Sol high 审计仍运行时，启动第3章双 Terra high，观察忽略429启动约束后的实际边界。

## 实际结果

- 第3章教材候选范围：正文 PDF p105–124（20页），教材例题册 p69–71（3页）。
- Terra A：冻结1000题基础15题、强化22题；完成37道题面/解析记录、页映射和题目包，随后在写入/继续阶段遭遇 503 Service Unavailable: auth_unavailable，状态失败，不代表第3章完成。
- Terra B：完成规则读取和第3章教材范围冻结，尚未完成教材核心/例题识别；随后遭遇同样的 503 Service Unavailable: auth_unavailable。
- 第2章 Sol high：同时运行并最终完成90条审计台账。
- 本次没有观测到429，但两个第3章会话都出现503认证服务错误。

## 结论

忽略429启动约束并同时运行“上一章 Sol high + 下一章双 Terra high”不可作为稳定生产方案。实际瓶颈不仅是429，还包括共享认证服务的503/auth_unavailable；Terra A虽能留下部分真实产物，Terra B未能进入正式内容生成。后续章节应等待当前Sol结束、处理上一章审计并冻结后，再启动下一章双Terra。

第3章正式状态：overload_test_partial_failed。
