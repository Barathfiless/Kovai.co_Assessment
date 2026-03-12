# Document360 Content Migration Tool

Migrates a Microsoft Word `.docx` file → clean HTML → Document360 knowledge base article via API.

---

## Project Structure

```
d360-migration/
├── migrate.py          # Entry point — orchestrates the full pipeline
├── parser.py           # .docx → HTML converter (pure python-docx + lxml)
├── uploader.py         # Document360 REST API client
├── output.html         # Generated HTML output (produced on run)
└── README.md
```

---

## Approach

The pipeline runs in three stages:

### Stage 1 — Parse `.docx`
`parser.py` walks the document's raw XML body **in document order** (not paragraph-list order) so tables appear in the correct position relative to surrounding text. For each element:

| Word XML element | Detection method | HTML output |
|---|---|---|
| Heading 1–6 | `para.style.name` starts with `"Heading"` | `<h1>`–`<h6>` |
| Paragraph | `Normal` style + non-empty text | `<p>` |
| Bullet list | `List Bullet` / `List Bullet 2` style | `<ul><li>` (nested via indent stack) |
| Numbered list | `List Number` / `List Number 2` style | `<ol><li>` (nested via indent stack) |
| Table | `<w:tbl>` body child | `<table class="doc-table">` with `<thead>`/`<tbody>` |
| Hyperlink | `<w:hyperlink r:id=…>` → resolved via `doc.part.rels` | `<a href="…" target="_blank">` |
| Code block | First run uses `Courier New` font | `<pre><code>` (line breaks from `<w:br>`) |
| Image | `<w:drawing>` → `a:blip r:embed` → rel lookup → base64 | `<img src="data:…">` |
| Caption | `Caption` style | `<p class="caption">` |
| Bold / Italic / Underline | `<w:b>` `<w:i>` `<w:u>` in run `<w:rPr>` | `<strong>` `<em>` `<u>` |

**Nested list handling:** A stack tracks `(tag, indent_level)`. When a deeper indent is encountered a new `<ul>` or `<ol>` is opened; when indent decreases the stack is unwound and appropriate closing tags are emitted.

### Stage 2 — Wrap & Save HTML
The HTML body is embedded into a full page template with clean CSS (responsive, dark code blocks, styled tables).

### Stage 3 — Upload to Document360
`uploader.py` sends a single `POST /v2/articles` request with `api_token` in the header and the HTML as the body. The full response is logged.

---

## Language & Tools

| Component | Choice | Why |
|---|---|---|
| Language | Python 3.10+ | Fast iteration, excellent XML + HTTP libraries |
| DOCX parsing | `python-docx` + `lxml` | Direct XML access for accurate structure |
| HTTP | `requests` | Clean, reliable REST client |
| Logging | stdlib `logging` | Zero-dependency, structured output |

---

## Installation

```bash
pip install python-docx requests lxml
```

---

## Configuration

Set these environment variables (or edit the constants at the top of `migrate.py`):

| Variable | Required | Description |
|---|---|---|
| `D360_API_KEY` | ✅ | Your Document360 API token |
| `D360_PROJECT_ID` | ✅ | Target project version ID |
| `D360_CATEGORY_ID` | ❌ | Optional category to place the article under |
| `DOCX_PATH` | ❌ | Path to `.docx` file (default: `docx_migration_test_file.docx`) |
| `ARTICLE_TITLE` | ❌ | Article title override |

```bash
export D360_API_KEY="your_api_token_here"
export D360_PROJECT_ID="your_project_version_id_here"
```

---

## Running

```bash
# Full pipeline (parse + upload)
python migrate.py

# Dry run — parse and save HTML only, skip upload
python migrate.py --dry-run

# Custom docx path
python migrate.py --docx /path/to/your/document.docx

# All options
python migrate.py --docx doc.docx --output result.html --title "My Article" --dry-run
```

---

## HTML Element Mapping

| Word | HTML |
|---|---|
| `Heading 1` | `<h1>` |
| `Heading 2` | `<h2>` |
| `Heading 3` | `<h3>` |
| `Heading 4` | `<h4>` |
| `Normal` paragraph | `<p>` |
| `List Bullet` | `<ul><li>` |
| `List Bullet 2` | `<ul><ul><li>` (nested) |
| `List Number` | `<ol><li>` |
| `List Number 2` | `<ol><ol><li>` (nested) |
| Table | `<table class="doc-table">` |
| Hyperlink | `<a href="…" target="_blank">` |
| Courier New font | `<pre><code>` |
| Embedded image | `<img src="data:image/…;base64,…">` |
| Bold run | `<strong>` |
| Italic run | `<em>` |
| Underline run | `<u>` |

---

## Notes

- If the API call fails (e.g. network/credential issues), `output.html` is still generated and saved.
- Images are embedded as base64 directly in the HTML — no external hosting required.
- The `--dry-run` flag is useful for verifying HTML output before uploading.



PS C:\Users\BARATH MARUTHAVEL\OneDrive\Desktop\Kovai\migration-task> Invoke-RestMethod -Uri "https://apihub.document360.io/v2/projectversions" -Headers @{ "api_token" = "TvrDSpEEHxJVgfim9Gbqpw9ZZ5Vz2XwCFnPFqQ2DMFBl/A+ZI4PAfRO9qOGyG14nflFJ5n/8HuMsM2wiNzlBmT0QTuT1ktlNh0ueEqCKaRaSwygmVAbl3u5oKyyt3IYcKTLXz8XbxfYcXyG36rCFvA=="} -Method GET