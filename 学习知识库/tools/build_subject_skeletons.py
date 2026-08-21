from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
NOW = "2026-08-19T20:30:00+08:00"
FRAMEWORK_TEMPLATE_UPDATED_AT = "2026-08-20T12:18:18+08:00"


FRAMEWORK_OBSERVATIONS = {
    "408.data-structures": [
        "ADT 与具体存储实现的分层",
        "数组、指针、栈、队列、树和图的中间状态",
        "伪代码下标、哨兵、前驱、递归返回值及副作用约定",
        "循环/递归不变量、终止性与正确性依据",
        "最好/平均/最坏复杂度、辅助空间、稳定性与原地性",
        "比较表中的已定位、连通、关键字互异等隐含前提",
    ],
    "408.computer-organization": [
        "位、字节、字、字长、存储字和地址空间的单位层级",
        "公式推导、量纲、平均/峰值口径与成立前提",
        "数据通路、控制信号、并行部件和关键路径",
        "指令/地址/Cache/页表/浮点格式的字段依据",
        "时序、周期数、流水线冒险及解决代价",
        "ISA—CPU—Cache—主存—I/O 的跨章数据链",
    ],
    "408.operating-systems": [
        "状态转换的触发事件、执行主体与不可能转换",
        "用户态/内核态、进程/线程、逻辑/物理地址的视角边界",
        "系统调用—异常—中断—调度—阻塞/唤醒事件链",
        "调度抢占、并列规则、时间片与到达时刻口径",
        "PV/管程不变量、公平性、死锁与饥饿验证",
        "TLB—页表—缺页—Cache—主存访问链及文件块访问链",
    ],
    "408.computer-networks": [
        "协议层次、通信实体、服务对象、作用范围及不负责事项",
        "报文字段的产生方、消费方、单位和逐跳/端到端变化",
        "主机、交换机、路由器、NAT 和服务器的不同视角",
        "ARP/交换/路由/NAT 表及 TCP 状态的建立、更新和失效",
        "消息方向、定时器、状态机、重传与失败路径",
        "协议版本、历史机制、公式模型和拓扑缺失信息边界",
    ],
}


def unit(chapter_id, module, number, title, slug, aliases=(), keywords=()):
    return {
        "chapter_id": chapter_id,
        "module": module,
        "number": number,
        "title": title,
        "slug": slug,
        "aliases": list(aliases),
        "keywords": list(keywords),
    }


MATH = [
    unit("math2.calculus.ch01", "calculus", 1, "函数、极限与连续", "ch01-functions-limits-continuity", ["高数第一章", "函数极限与连续"], ["函数", "极限", "无穷小", "连续", "间断点"]),
    unit("math2.calculus.ch02", "calculus", 2, "数列极限", "ch02-sequence-limits", ["高数第二章", "数列极限"], ["单调有界", "夹逼", "递推数列", "Stolz"]),
    unit("math2.calculus.ch03", "calculus", 3, "一元函数微分学的概念", "ch03-differential-concepts", ["高数第三章", "导数与微分概念"], ["导数定义", "可导", "微分", "几何意义"]),
    unit("math2.calculus.ch04", "calculus", 4, "一元函数微分学的计算", "ch04-differential-calculation", ["高数第四章", "导数计算"], ["复合函数", "隐函数", "参数方程", "高阶导数"]),
    unit("math2.calculus.ch05", "calculus", 5, "一元函数微分学的应用（一）——几何应用", "ch05-differential-geometric-applications", ["高数第五章", "微分学几何应用"], ["单调性", "极值", "凹凸性", "渐近线", "最值"]),
    unit("math2.calculus.ch06", "calculus", 6, "一元函数微分学的应用（二）——中值定理、微分等式与微分不等式", "ch06-mean-value-theorems", ["高数第六章", "中值定理"], ["罗尔定理", "拉格朗日中值定理", "柯西中值定理", "泰勒定理", "微分不等式"]),
    unit("math2.calculus.ch07", "calculus", 7, "一元函数微分学的应用（三）——物理应用与经济应用", "ch07-differential-physical-economic-applications", ["高数第七章", "相关变化率与经济应用"], ["相关变化率", "弹性", "边际", "经济应用"]),
    unit("math2.calculus.ch08", "calculus", 8, "一元函数积分学的概念与性质", "ch08-integral-concepts-properties", ["高数第八章", "积分概念与性质"], ["原函数", "不定积分", "定积分", "变限积分", "反常积分"]),
    unit("math2.calculus.ch09", "calculus", 9, "一元函数积分学的计算", "ch09-integral-calculation", ["高数第九章", "积分计算"], ["换元积分", "分部积分", "有理函数积分", "反常积分计算"]),
    unit("math2.calculus.ch10", "calculus", 10, "一元函数积分学的应用（一）——几何应用", "ch10-integral-geometric-applications", ["高数第十章", "积分几何应用"], ["面积", "旋转体体积", "弧长", "平均值"]),
    unit("math2.calculus.ch11", "calculus", 11, "一元函数积分学的应用（二）——积分等式与积分不等式", "ch11-integral-equalities-inequalities", ["高数第十一章", "积分等式与不等式"], ["积分等式", "积分不等式", "积分中值定理"]),
    unit("math2.calculus.ch12", "calculus", 12, "一元函数积分学的应用（三）——物理应用与经济应用", "ch12-integral-physical-economic-applications", ["高数第十二章", "积分物理经济应用"], ["变力做功", "液体压力", "质心", "经济应用"]),
    unit("math2.calculus.ch13", "calculus", 13, "多元函数微分学", "ch13-multivariable-differentiation", ["高数第十三章", "多元微分"], ["偏导数", "全微分", "复合函数", "隐函数", "多元极值"]),
    unit("math2.calculus.ch14", "calculus", 14, "二重积分", "ch14-double-integrals", ["高数第十四章", "二重积分"], ["直角坐标", "极坐标", "对称性", "换序"]),
    unit("math2.calculus.ch15", "calculus", 15, "微分方程", "ch15-differential-equations", ["高数第十五章", "微分方程"], ["可分离变量", "一阶线性", "伯努利", "高阶常系数", "应用题"]),
    unit("math2.linear-algebra.ch00", "linear-algebra", 0, "零基础课——线性代数入门", "ch00-linear-algebra-prerequisites", ["线代第零章", "线性代数入门"], ["线性方程", "向量", "线性变换", "预备知识"]),
    unit("math2.linear-algebra.ch01", "linear-algebra", 1, "行列式", "ch01-determinants", ["线代第一章", "行列式"], ["行列式性质", "展开定理", "克拉默法则"]),
    unit("math2.linear-algebra.ch02", "linear-algebra", 2, "矩阵", "ch02-matrices", ["线代第二章", "矩阵"], ["矩阵运算", "逆矩阵", "秩", "初等变换", "分块矩阵"]),
    unit("math2.linear-algebra.ch03", "linear-algebra", 3, "向量组", "ch03-vector-systems", ["线代第三章", "向量组"], ["线性相关", "线性无关", "极大无关组", "向量空间"]),
    unit("math2.linear-algebra.ch04", "linear-algebra", 4, "线性方程组", "ch04-linear-equations", ["线代第四章", "线性方程组"], ["齐次方程组", "非齐次方程组", "基础解系", "公共解"]),
    unit("math2.linear-algebra.ch05", "linear-algebra", 5, "特征值与特征向量", "ch05-eigenvalues-eigenvectors", ["线代第五章", "特征值与特征向量"], ["相似", "对角化", "实对称矩阵", "正交变换"]),
    unit("math2.linear-algebra.ch06", "linear-algebra", 6, "二次型", "ch06-quadratic-forms", ["线代第六章", "二次型"], ["标准形", "规范形", "合同", "正定"]),
]


DS = [
    unit("408.data-structures.ch01", "data-structures", 1, "绪论", "ch01-introduction", ["数据结构第一章"], ["数据结构", "算法评价", "时间复杂度", "空间复杂度"]),
    unit("408.data-structures.ch02", "data-structures", 2, "线性表", "ch02-linear-lists", ["数据结构第二章"], ["顺序表", "单链表", "双链表", "循环链表"]),
    unit("408.data-structures.ch03", "data-structures", 3, "栈、队列和数组", "ch03-stacks-queues-arrays", ["数据结构第三章"], ["栈", "队列", "数组", "稀疏矩阵", "表达式"]),
    unit("408.data-structures.ch04", "data-structures", 4, "串", "ch04-strings", ["数据结构第四章"], ["字符串", "模式匹配", "KMP", "next数组"]),
    unit("408.data-structures.ch05", "data-structures", 5, "树与二叉树", "ch05-trees-binary-trees", ["数据结构第五章"], ["二叉树", "遍历", "线索二叉树", "森林", "哈夫曼树", "并查集"]),
    unit("408.data-structures.ch06", "data-structures", 6, "图", "ch06-graphs", ["数据结构第六章"], ["邻接矩阵", "邻接表", "DFS", "BFS", "最小生成树", "最短路径", "拓扑排序", "关键路径"]),
    unit("408.data-structures.ch07", "data-structures", 7, "查找", "ch07-searching", ["数据结构第七章"], ["顺序查找", "折半查找", "二叉排序树", "平衡二叉树", "红黑树", "B树", "散列"]),
    unit("408.data-structures.ch08", "data-structures", 8, "排序", "ch08-sorting", ["数据结构第八章"], ["插入排序", "交换排序", "选择排序", "归并排序", "基数排序", "外部排序"]),
]


CO = [
    unit("408.computer-organization.ch01", "computer-organization", 1, "计算机系统概述", "ch01-system-overview", ["计组第一章"], ["计算机系统", "层次结构", "性能指标"]),
    unit("408.computer-organization.ch02", "computer-organization", 2, "数据的表示和运算", "ch02-data-representation-arithmetic", ["计组第二章"], ["数制", "定点数", "浮点数", "补码", "运算电路"]),
    unit("408.computer-organization.ch03", "computer-organization", 3, "存储系统", "ch03-memory-system", ["计组第三章"], ["主存", "Cache", "虚拟存储器", "存储器层次"]),
    unit("408.computer-organization.ch04", "computer-organization", 4, "指令系统", "ch04-instruction-set", ["计组第四章"], ["指令格式", "寻址方式", "机器级代码", "CISC", "RISC"]),
    unit("408.computer-organization.ch05", "computer-organization", 5, "中央处理器", "ch05-cpu", ["计组第五章"], ["数据通路", "控制器", "指令周期", "中断", "流水线", "多处理器"]),
    unit("408.computer-organization.ch06", "computer-organization", 6, "总线", "ch06-bus", ["计组第六章"], ["总线结构", "总线事务", "总线定时"]),
    unit("408.computer-organization.ch07", "computer-organization", 7, "输入/输出系统", "ch07-io-system", ["计组第七章"], ["I/O接口", "程序查询", "程序中断", "DMA"]),
]


OS = [
    unit("408.operating-systems.ch01", "operating-systems", 1, "计算机系统概述", "ch01-system-overview", ["操作系统第一章"], ["操作系统概念", "运行环境", "系统调用", "虚拟机"]),
    unit("408.operating-systems.ch02", "operating-systems", 2, "进程与线程", "ch02-processes-threads", ["操作系统第二章"], ["进程", "线程", "调度", "同步互斥", "信号量", "死锁"]),
    unit("408.operating-systems.ch03", "operating-systems", 3, "内存管理", "ch03-memory-management", ["操作系统第三章"], ["分页", "分段", "虚拟内存", "页面置换", "地址转换"]),
    unit("408.operating-systems.ch04", "operating-systems", 4, "文件管理", "ch04-file-management", ["操作系统第四章"], ["文件系统", "目录", "文件分配", "空闲空间"]),
    unit("408.operating-systems.ch05", "operating-systems", 5, "输入/输出管理", "ch05-io-management", ["操作系统第五章"], ["I/O管理", "设备独立性", "磁盘", "固态硬盘"]),
]


NET = [
    unit("408.computer-networks.ch01", "computer-networks", 1, "计算机网络体系结构", "ch01-network-architecture", ["计网第一章"], ["分层", "协议", "OSI", "TCP/IP", "性能指标"]),
    unit("408.computer-networks.ch02", "computer-networks", 2, "物理层", "ch02-physical-layer", ["计网第二章"], ["通信基础", "编码", "复用", "传输介质", "物理层设备"]),
    unit("408.computer-networks.ch03", "computer-networks", 3, "数据链路层", "ch03-data-link-layer", ["计网第三章"], ["组帧", "差错控制", "可靠传输", "介质访问", "局域网", "交换机"]),
    unit("408.computer-networks.ch04", "computer-networks", 4, "网络层", "ch04-network-layer", ["计网第四章"], ["IPv4", "IPv6", "子网划分", "路由协议", "IP多播", "路由器"]),
    unit("408.computer-networks.ch05", "computer-networks", 5, "传输层", "ch05-transport-layer", ["计网第五章"], ["UDP", "TCP", "可靠传输", "流量控制", "拥塞控制"]),
    unit("408.computer-networks.ch06", "computer-networks", 6, "应用层", "ch06-application-layer", ["计网第六章"], ["DNS", "FTP", "电子邮件", "HTTP", "万维网"]),
]


ENGLISH = [
    ("english2.vocabulary", "vocabulary", "词汇与真题词", ["单词", "真题词汇"], ["词义", "熟词僻义", "搭配", "词形"]),
    ("english2.grammar", "grammar-long-sentences", "语法与长难句", ["长难句", "句法"], ["主干", "从句", "非谓语", "指代", "逻辑关系"]),
    ("english2.cloze", "cloze", "完形填空", ["英语二完形", "Section I"], ["搭配", "语义", "篇章逻辑", "复现"]),
    ("english2.reading-a", "reading-a", "阅读理解 Part A", ["传统阅读", "阅读A"], ["细节题", "推理题", "主旨题", "态度题", "词义题", "例证题"]),
    ("english2.new-type", "new-type", "阅读理解 Part B（新题型）", ["新题型", "阅读B"], ["锚点", "同义对应", "段落逻辑"]),
    ("english2.translation", "translation", "英译汉", ["翻译", "英语二翻译"], ["主干", "修饰", "逻辑", "中文重组"]),
    ("english2.writing-a", "writing-a", "写作 Part A（小作文）", ["小作文", "应用文"], ["体裁", "身份", "任务点", "语域"]),
    ("english2.writing-b", "writing-b", "写作 Part B（大作文）", ["大作文", "图表作文"], ["图表描述", "数据边界", "原因分析", "建议"]),
]


POLITICS = [
    ("politics.marxism", "marxism", "马克思主义基本原理", ["马原"], ["哲学", "政治经济学", "科学社会主义"]),
    ("politics.mao-socialism", "mao-thought-socialism", "毛泽东思想和中国特色社会主义理论体系概论", ["毛中特"], ["毛泽东思想", "社会主义改造", "中国特色社会主义理论体系"]),
    ("politics.xi-thought", "xi-thought", "习近平新时代中国特色社会主义思想概论", ["新思想", "习概"], ["地位词", "主体", "目标", "任务", "保障"]),
    ("politics.modern-history", "modern-history", "中国近现代史纲要", ["史纲"], ["时间线", "主体", "性质", "意义", "因果链"]),
    ("politics.ethics-law", "ethics-law", "思想道德与法治", ["思修法基"], ["定义", "分类", "道德", "法治", "法律术语"]),
    ("politics.current-affairs", "current-affairs", "形势与政策以及当代世界经济与政治", ["时政", "当代"], ["年度时政", "形势与政策", "世界经济与政治"]),
]


SOURCE_BASIS = {
    "math2.calculus": {"path": "数二/27张宇基础30讲（高数）_新书签.pdf", "basis": "PDF 书签目录核验；仅创建数学二范围第1—15讲"},
    "math2.linear-algebra": {"path": "数二/27张宇基础30讲线代_新书签.pdf", "basis": "PDF 书签目录核验；第0—6讲"},
    "408.data-structures": {"path": "408/2027数据结构_高清带书签版.pdf", "basis": "PDF 目录页视觉核验；第1—8章"},
    "408.computer-organization": {"path": "408/2027计算机组成原理_高清带书签版.pdf", "basis": "PDF 目录页视觉核验；第1—7章"},
    "408.operating-systems": {"path": "408/操作系统.pdf", "basis": "PDF 书签目录核验；第1—5章"},
    "408.computer-networks": {"path": "408/2027计算机网络_高清带书签版.pdf", "basis": "PDF 书签目录核验；第1—6章"},
    "english2": {"path": "英二/01_英语二备考计划_资料与作答指南.md", "basis": "按真题题型与基础能力模块建立，不伪造教材章号"},
    "politics": {"path": "政治/01_2027考研政治备考计划_资料与作答指南_v1.0暑期初稿.md", "basis": "按学科模块建立；年度大纲和时政另行核验"},
}


def load_json(path: Path, fallback: dict) -> dict:
    if not path.exists():
        return fallback
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_if_missing(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        path.write_text(text, encoding="utf-8")


def chapter_framework_text(title: str, subject: str) -> str:
    observations = "\n".join(f"- [ ] {item}（待具体复习本章时核对）" for item in FRAMEWORK_OBSERVATIONS[subject])
    return f"""# {title}：章节预留框架

> 框架预留时间：2026-08-20 12:18:18 +08:00
> 状态：本文件仅预留结构（reserved-empty），尚未向这些新栏目填充内容；章节既有复盘状态以 `chapter.json` 和 `reviews/` 为准，本文件本身不代表已掌握、已复习或已完成。
> 填充规则：日后明确复习本章时核对实际栏目；阶段一先输出完整成品，用户验收并授权后再写入。

## 1. 章首导学

### 1.1 教材实际栏目名与页码

| 教材实际栏目名 | 功能归类 | 印刷页/PDF页 | 来源状态 |
|---|---|---|---|
| 待具体复习本章时核对 | 待定 | 待定 | 未读取 |

### 1.2 考纲内容/考试要求

待具体复习本章时补充。

### 1.3 知识框架/知识地图

待具体复习本章时补充。

### 1.4 复习提示/学习目标/重难点

待具体复习本章时补充。

### 1.5 章首问题台账

| 问题摘要 | 提出位置 | 正文对应位置 | 章末是否明确回答 | 最终回答与来源身份 |
|---|---|---|---|---|
| 待具体复习本章时核对 | 待定 | 待定 | 待定 | 待定 |

## 2. 正文提示与高价值细节

### 2.1 注意/提示/说明/辨析/易错/补充/拓展框

| 教材实际栏目名 | 位置 | 功能类型 | 内容摘要 | 条件/例外/边界 | 关联题型 |
|---|---|---|---|---|---|
| 待具体复习本章时核对 | 待定 | 待定 | 待定 | 待定 | 待定 |

### 2.2 二级结论、隐藏重点与比较表

待具体复习本章时补充。

### 2.3 教材图表、算法、时序或典型案例

待具体复习本章时补充。

### 2.4 本科专项观察项

{observations}

## 3. 章末收束与回扣

### 3.1 本节/本章小结或归纳总结

待具体复习本章时补充。

### 3.2 疑难点/常见问题/自测题

待具体复习本章时补充。

### 3.3 思维拓展

待具体复习本章时核对。教材未给明确答案时，可在实际复盘中写“AI 分析”，但须标明假设、推理、反例/边界及与 408 考试的关系。

### 3.4 章首问题回扣表

| 章首问题 | 教材明确回答 | AI 分析（若需要） | 闭环状态 |
|---|---|---|---|
| 待具体复习本章时核对 | 待定 | 待定 | 未开始 |

## 4. 内容沉淀去向

- 教材知识与条件边界：`textbook_knowledge.md`
- 题型方法与迁移规则：`question_methods.md`
- 用户真实错误或疑难：`user_weaknesses.md`
- 用户接受的完整第一版：`reviews/`

## 5. 当前骨架状态

- 框架已预留；详细内容未填充。
- 本文件不构成课程新增，不登记活动日志。
- 未经具体章节复盘、用户验收和保存授权，不得将状态改为已整理。
"""


def chapter_files(base: Path, item: dict, subject: str, source_key: str) -> dict:
    chapter_dir = base / item["slug"]
    chapter_dir.mkdir(parents=True, exist_ok=True)
    chapter_path = chapter_dir / "chapter.json"
    existing = load_json(chapter_path, {})
    accepted = existing.get("accepted_reviews", [])
    status = "organized" if accepted else "skeleton"
    data = {
        **existing,
        "schema_version": "1.1",
        "chapter_id": item["chapter_id"],
        "subject": subject,
        "module": item["module"],
        "number": item["number"],
        "title": existing.get("title", item["title"]),
        "aliases": list(dict.fromkeys(existing.get("aliases", []) + item["aliases"])),
        "keywords": list(dict.fromkeys(existing.get("keywords", []) + item["keywords"])),
        "framework_status": "ready",
        "organization_status": status,
        "accepted_review_count": len(accepted),
        "confirmed_increment_count": existing.get("confirmed_increment_count", 0),
        "source_basis": SOURCE_BASIS[source_key],
        "skeleton_created_at": existing.get("skeleton_created_at", NOW),
        "updated_at": existing.get("updated_at", NOW) if accepted else NOW,
    }
    if subject.startswith("408."):
        data.update({
            "framework_file": "chapter_framework.md",
            "framework_template_version": "1.0",
            "framework_template_status": existing.get("framework_template_status", "reserved-empty"),
            "framework_template_updated_at": existing.get("framework_template_updated_at", FRAMEWORK_TEMPLATE_UPDATED_AT),
        })
    write_json(chapter_path, data)
    banner = f"> 状态：待整理骨架（skeleton）。这里只能写入用户已经确认准确且明确同意归档的增量；每条增量必须含记录时间并登记 activity_log.jsonl；当前不代表章节已完成。\n"
    write_if_missing(chapter_dir / "textbook_knowledge.md", f"# {data['title']}：教材知识\n\n{banner}\n## 已确认增量\n\n当前无。\n")
    write_if_missing(chapter_dir / "question_methods.md", f"# {data['title']}：题型方法\n\n{banner}\n## 已确认增量\n\n当前无。\n")
    write_if_missing(chapter_dir / "user_weaknesses.md", f"# {data['title']}：个人薄弱点\n\n{banner}\n## 已确认薄弱点\n\n当前无。\n")
    if subject.startswith("408."):
        write_if_missing(chapter_dir / "chapter_framework.md", chapter_framework_text(data["title"], subject))
    write_if_missing(chapter_dir / "reviews" / ".gitkeep", "")
    entry = {
        "chapter_id": data["chapter_id"],
        "module": data["module"],
        "number": data["number"],
        "title": data["title"],
        "aliases": data["aliases"],
        "keywords": data["keywords"],
        "path": chapter_dir.relative_to(base).as_posix(),
        "framework_status": "ready",
        "organization_status": status,
        "accepted_review_count": len(accepted),
        "source_basis": SOURCE_BASIS[source_key],
        "updated_at": data["updated_at"],
    }
    if subject.startswith("408."):
        entry.update({
            "framework_file": "chapter_framework.md",
            "framework_template_version": "1.0",
            "framework_template_status": data["framework_template_status"],
            "framework_template_updated_at": data["framework_template_updated_at"],
        })
    return entry


def build_math() -> tuple[int, int]:
    base = ROOT / "math2"
    entries = []
    for item in MATH:
        subbase = base / ("calculus" if item["module"] == "calculus" else "linear-algebra")
        source_key = "math2.calculus" if item["module"] == "calculus" else "math2.linear-algebra"
        entry = chapter_files(subbase, item, "math2", source_key)
        entry["path"] = f"{item['module']}/{entry['path']}"
        entries.append(entry)
    catalog = load_json(base / "catalog.json", {"schema_version": "1.1", "subject": "math2"})
    catalog.update({
        "schema_version": "1.1",
        "subject": "math2",
        "framework_status": "ready",
        "updated_at": NOW,
        "chapters": entries,
        "excluded_units": [
            {"title": "无穷级数", "reason": "当前讲义标注仅数学一、数学三，不属于数学二"},
            {"title": "多元函数积分学的预备知识", "reason": "当前讲义标注仅数学一，不属于数学二"},
            {"title": "多元函数积分学", "reason": "当前讲义标注仅数学一，不属于数学二"},
        ],
    })
    write_json(base / "catalog.json", catalog)
    return len(entries), sum(e["organization_status"] == "organized" for e in entries)


def build_408_subject(folder: str, subject: str, items: list[dict], source_key: str) -> tuple[int, int]:
    base = ROOT / "408" / folder
    entries = [chapter_files(base, item, subject, source_key) for item in items]
    catalog = load_json(base / "catalog.json", {"schema_version": "1.1", "subject": subject})
    catalog.update({"schema_version": "1.1", "subject": subject, "framework_status": "ready", "updated_at": NOW, "chapters": entries})
    write_json(base / "catalog.json", catalog)
    return len(entries), sum(e["organization_status"] == "organized" for e in entries)


def build_module_subject(subject: str, modules: list[tuple], kind: str) -> tuple[int, int]:
    base = ROOT / subject
    catalog = load_json(base / "catalog.json", {"schema_version": "1.1", "subject": subject})
    module_entries = []
    accepted_reviews = catalog.get("accepted_reviews", [])
    for module_id, slug, title, aliases, keywords in modules:
        module_dir = base / "modules" / slug
        module_dir.mkdir(parents=True, exist_ok=True)
        linked = []
        if subject == "english2" and accepted_reviews and slug not in {"vocabulary", "grammar-long-sentences"}:
            linked = [accepted_reviews[0]["review_id"]]
        status = "partially-organized" if linked else "skeleton"
        module_data = load_json(module_dir / "module.json", {})
        module_data.update({
            "schema_version": "1.1",
            "module_id": module_id,
            "subject": subject,
            "title": title,
            "aliases": aliases,
            "keywords": keywords,
            "framework_status": "ready",
            "organization_status": status,
            "accepted_review_refs": linked,
            "confirmed_increment_count": module_data.get("confirmed_increment_count", 0),
            "source_basis": SOURCE_BASIS[subject],
            "skeleton_created_at": module_data.get("skeleton_created_at", NOW),
            "updated_at": NOW,
        })
        write_json(module_dir / "module.json", module_data)
        banner = "> 状态：待整理骨架（skeleton）。仅保存用户双重确认后的内容；每条增量必须含记录时间并登记 activity_log.jsonl；骨架存在不等于模块已整理完成。\n"
        if kind == "english":
            write_if_missing(module_dir / "evidence_and_language.md", f"# {title}：原文证据与语言知识\n\n{banner}\n## 已确认增量\n\n当前无。\n")
            write_if_missing(module_dir / "answer_methods.md", f"# {title}：定位与作答方法\n\n{banner}\n## 已确认增量\n\n当前无。\n")
        else:
            write_if_missing(module_dir / "knowledge_cards.md", f"# {title}：知识卡\n\n{banner}\n## 已确认增量\n\n当前无。\n")
            write_if_missing(module_dir / "concept_boundaries.md", f"# {title}：概念边界\n\n{banner}\n## 已确认增量\n\n当前无。\n")
            write_if_missing(module_dir / "answer_methods.md", f"# {title}：答题方法\n\n{banner}\n## 已确认增量\n\n当前无。\n")
        write_if_missing(module_dir / "user_weaknesses.md", f"# {title}：个人薄弱点\n\n{banner}\n## 已确认薄弱点\n\n当前无。\n")
        write_if_missing(module_dir / "reviews" / ".gitkeep", "")
        module_entries.append({
            "module_id": module_id,
            "title": title,
            "aliases": aliases,
            "keywords": keywords,
            "path": f"modules/{slug}",
            "framework_status": "ready",
            "organization_status": status,
            "accepted_review_refs": linked,
            "source_basis": SOURCE_BASIS[subject],
            "updated_at": NOW,
        })
    catalog.update({"schema_version": "1.1", "subject": subject, "framework_status": "ready", "updated_at": NOW, "modules": module_entries})
    write_json(base / "catalog.json", catalog)
    return len(module_entries), sum(m["organization_status"] != "skeleton" for m in module_entries)


def main() -> None:
    counts = {}
    counts["math2"] = build_math()
    counts["408.data-structures"] = build_408_subject("data-structures", "408.data-structures", DS, "408.data-structures")
    counts["408.computer-organization"] = build_408_subject("computer-organization", "408.computer-organization", CO, "408.computer-organization")
    counts["408.operating-systems"] = build_408_subject("operating-systems", "408.operating-systems", OS, "408.operating-systems")
    counts["408.computer-networks"] = build_408_subject("computer-networks", "408.computer-networks", NET, "408.computer-networks")
    counts["english2"] = build_module_subject("english2", ENGLISH, "english")
    counts["politics"] = build_module_subject("politics", POLITICS, "politics")
    manifest = {
        "schema_version": "1.0",
        "created_at": NOW,
        "rule": "框架可预建；课程内容仅在用户确认归纳准确且明确同意归档后写入。skeleton 不得称为已整理或已完成。",
        "subjects": {
            key: {"unit_count": value[0], "organized_or_linked_count": value[1], "skeleton_count": value[0] - value[1]}
            for key, value in counts.items()
        },
        "totals": {
            "unit_count": sum(v[0] for v in counts.values()),
            "organized_or_linked_count": sum(v[1] for v in counts.values()),
            "skeleton_count": sum(v[0] - v[1] for v in counts.values()),
        },
    }
    write_json(ROOT / "framework_manifest.json", manifest)
    print(json.dumps(manifest, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
