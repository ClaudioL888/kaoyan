# Knowledge-base migration scope

This repository contains the structured knowledge-base code, data, reports, prompts, and text/JSON staging artifacts migrated from the local study workspace.

Included:

- `knowledge-base/` foundation code, schema, tests, and implementation documentation (kept at repository root where applicable);
- `knowledge_base_v041_text_first_retry/` structured Math II chapter data and reports;
- structured JSON/text staging and audit artifacts under `staging/` and `tmp_structured/`;
- knowledge-base prompts, acceptance notes, and helper scripts from the workspace root;
- the imported Linear Algebra Chapter 5 review under `imports/`.

Excluded by design:

- PDF, PNG, JPG, JPEG, JP2, WEBP, GIF, BMP, TIF/TIFF, font, OCR-model, and Python bytecode files;
- raw textbook/question-book source files and rendered page evidence;
- transient dependency directories and repository metadata from the local workspace.
