$ErrorActionPreference = 'Stop'
$root = (Resolve-Path 'knowledge_base_v041_text_first_retry\math2\ch02_sequence_limit').Path
$a = Join-Path $root 'lanes\terra_a_questions'
$b = Join-Path $root 'lanes\terra_b_textbook'
$staging = Join-Path $root 'staging'
$qp = Join-Path $root 'question_packages'
$ep = Join-Path $root 'example_packages'
New-Item -ItemType Directory -Force $staging,$qp,$ep,(Join-Path $root 'reports') | Out-Null

Copy-Item (Join-Path $a 'questions.jsonl') (Join-Path $root 'questions.jsonl') -Force
Copy-Item (Join-Path $b 'examples.jsonl') (Join-Path $root 'examples.jsonl') -Force
Copy-Item (Join-Path $b 'textbook_core_coverage.jsonl') (Join-Path $root 'textbook_core_coverage.jsonl') -Force
Copy-Item (Join-Path $b 'knowledge_points.jsonl') (Join-Path $root 'knowledge_points.jsonl') -Force
Copy-Item (Join-Path $b 'formulas.jsonl') (Join-Path $root 'formulas.jsonl') -Force
Copy-Item (Join-Path $b 'conclusions.jsonl') (Join-Path $root 'conclusions.jsonl') -Force
Copy-Item (Join-Path $b 'outline_nodes.jsonl') (Join-Path $root 'outline_nodes.jsonl') -Force
Copy-Item (Join-Path $b 'problem_types.jsonl') (Join-Path $root 'problem_types.jsonl') -Force
Copy-Item (Join-Path $b 'method_pool.jsonl') (Join-Path $root 'method_pool.jsonl') -Force
Copy-Item (Join-Path $b 'relations.jsonl') (Join-Path $root 'relations.jsonl') -Force
Copy-Item (Join-Path $b 'weak_points.jsonl') (Join-Path $root 'weak_points.jsonl') -Force
Copy-Item (Join-Path $b 'assets_manifest.jsonl') (Join-Path $root 'assets_manifest.jsonl') -Force

@('question_registry.jsonl','page_mappings.jsonl') | ForEach-Object {
  $rows = @(Get-Content (Join-Path $a $_)) + @(Get-Content (Join-Path $b $_))
  $rows | Set-Content (Join-Path $root $_) -Encoding utf8
}
@('recognized_question_pages.jsonl','recognized_solution_pages.jsonl') | ForEach-Object {
  $rows = @(Get-Content (Join-Path $a "staging\$_")) + @(Get-Content (Join-Path $b "staging\$_"))
  $rows | Set-Content (Join-Path $staging $_) -Encoding utf8
}

Copy-Item (Join-Path $a 'question_packages\*') $qp -Force
Copy-Item (Join-Path $b 'question_packages\*') $qp -Force
Copy-Item (Join-Path $b 'example_packages\*') $ep -Force

$scopes = @(
  [ordered]@{scope_id='scope.textbook.core.ch02';source_id='src.math2.textbook_ch02';role='textbook_exposition';file='数二/27张宇基础30讲（高数）_新书签.pdf';sha256='B13F13B1E299DD60D6BD48BF3ED7A3534E1E33876B62B45A2CDF81DFA141B539';pdf_pages=@(82,104);page_count=23;boundary='p104 ends Chapter 2; p105 starts 第3讲';confidence='high'},
  [ordered]@{scope_id='scope.textbook.examples.ch02';source_id='src.math2.textbook_examples_ch02';role='textbook_example_question';file='数二/张宇30讲高数例题.pdf';sha256='70C4752E04DF1E095116558AD794C686286B2ED2221954D9942904ABC8A875E4';pdf_pages=@(28,39);item_range='例题2.1-2.18；第二讲习题2.1-2.7';item_count=25;boundary='p40 starts Chapter 3';confidence='high'},
  [ordered]@{scope_id='scope.1000.questions.ch02';source_id='src.math2.1000_questions';role='1000_question_book';file='数二/27张宇1000题数二【试题册】.pdf';sha256='73D293F7BD54120E17704795E466683F89AE14E4BA777011D32D3A881C17667A';pdf_pages=@(13,67,68);item_count=23;boundary='p14 and p69 start Chapter 3';confidence='high'},
  [ordered]@{scope_id='scope.1000.solutions.ch02';source_id='src.math2.1000_solutions';role='1000_official_solution_book';file='数二/27张宇1000题数二【解析册】-带书签.pdf';sha256='729C656C0EEFDE7DF47708F93EF223BA2375EE41BC602FE61B49FE38652F994C';pdf_pages=@(18,19,20,173,174,175,176);item_count=23;boundary='p21 starts Chapter 3; p177 starts Chapter 3';confidence='high'}
)
$scopes | ForEach-Object { ($_ | ConvertTo-Json -Compress -Depth 6) } | Set-Content (Join-Path $root 'source_scopes.jsonl') -Encoding utf8

$chapter = Get-Content (Join-Path $root 'chapter.json') -Raw | ConvertFrom-Json
$chapter.status = 'merged_pending_sol'
$chapter.denominators = [ordered]@{ '1000_basic_questions'=12; '1000_strengthened_questions'=11; 'textbook_examples'=25; 'textbook_core_pages'=23; 'total_1000_questions'=23 }
$chapter | Add-Member -NotePropertyName lanes -NotePropertyValue @('terra_a_questions','terra_b_textbook') -Force
$chapter | Add-Member -NotePropertyName merged_at -NotePropertyValue ((Get-Date).ToString('o')) -Force
$chapter | Add-Member -NotePropertyName acceptance_gate -NotePropertyValue 'pending_sol_high_and_main_agent_acceptance' -Force
$chapter | ConvertTo-Json -Depth 10 | Set-Content (Join-Path $root 'chapter.json') -Encoding utf8
