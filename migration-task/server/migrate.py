"""
migrate.py — Document360 Content Migration Pipeline
=====================================================
Pipeline:
  1. Read .docx
  2. Parse → structured HTML body
  3. Save output.html
  4. POST to Document360 API

Usage:
  python migrate.py                        # uses .env / env vars
  python migrate.py --dry-run              # parse + save HTML, skip upload
  python migrate.py --docx path/to/file    # custom docx path
"""

import argparse
import logging
import os
import sys

from parser   import docx_to_html
from uploader import create_article

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level   = logging.INFO,
    format  = "%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt = "%H:%M:%S",
    stream  = sys.stdout,
)
log = logging.getLogger(__name__)

# ── Config (override via environment variables) ───────────────────────────────
DOCX_PATH          = os.getenv("DOCX_PATH",     "docx_migration_test_file.docx")
HTML_OUTPUT        = os.getenv("HTML_OUTPUT",   "output.html")
ARTICLE_TITLE      = os.getenv("ARTICLE_TITLE", "Sample Document for Migration Assessment")
D360_API_KEY       = "TvrDSpEEHxJVgfim9Gbqpw9ZZ5Vz2XwCFnPFqQ2DMFBl/A+ZI4PAfRO9qOGyG14nflFJ5n/8HuMsM2wiNzlBmT0QTuT1ktlNh0ueEqCKaRaSwygmVAbl3u5oKyyt3IYcKTLXz8XbxfYcXyG36rCFvA=="
D360_PROJECT_ID    = "8de99e99-94af-4315-9047-8fd5f90b2f8d"
D360_USER_ID       = "9bc90a13-4c7a-45e6-b51d-839bc3a5a209"
D360_CATEGORY_ID   = os.getenv("D360_CATEGORY_ID", "")   # optional

# ── HTML page wrapper ─────────────────────────────────────────────────────────
HTML_TEMPLATE = """\
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <style>
    *, *::before, *::after {{ box-sizing: border-box; }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
      font-size: 16px; line-height: 1.7; color: #1a1a2e;
      max-width: 900px; margin: 48px auto; padding: 0 24px;
    }}
    h1 {{ font-size: 2rem;   border-bottom: 3px solid #4361ee; padding-bottom: 10px; margin-bottom: 24px; }}
    h2 {{ font-size: 1.5rem; border-bottom: 1px solid #dee2e6; padding-bottom: 6px;  margin-top: 40px; color: #16213e; }}
    h3 {{ font-size: 1.2rem; color: #0f3460; margin-top: 28px; }}
    h4 {{ font-size: 1rem;   color: #495057; margin-top: 20px; }}
    p  {{ margin: 12px 0; }}
    a  {{ color: #4361ee; text-decoration: none; }}
    a:hover {{ text-decoration: underline; }}
    ul, ol {{ padding-left: 28px; margin: 10px 0; }}
    li {{ margin: 5px 0; line-height: 1.6; }}
    ul ul, ol ol, ul ol, ol ul {{ margin: 4px 0; }}
    table.doc-table {{
      border-collapse: collapse; width: 100%; margin: 20px 0;
      font-size: 0.95rem; box-shadow: 0 1px 3px rgba(0,0,0,.1);
    }}
    table.doc-table th {{
      background: #4361ee; color: #fff;
      padding: 10px 14px; text-align: left; font-weight: 600;
    }}
    table.doc-table td {{
      padding: 9px 14px; border-bottom: 1px solid #dee2e6;
    }}
    table.doc-table tr:last-child td {{ border-bottom: none; }}
    table.doc-table tr:nth-child(even) td {{ background: #f8f9fc; }}
    pre {{
      background: #1e1e2e; color: #cdd6f4;
      border-radius: 8px; padding: 20px; overflow-x: auto;
      font-family: "Courier New", monospace; font-size: 0.875rem;
      line-height: 1.6; margin: 20px 0;
      border-left: 4px solid #4361ee;
    }}
    code {{ font-family: "Courier New", monospace; font-size: 0.875em; }}
    img  {{ max-width: 100%; height: auto; border-radius: 6px; margin: 16px 0; }}
    p.caption {{ color: #6c757d; font-size: 0.85rem; text-align: center; margin-top: 4px; }}
  </style>
</head>
<body>
{body}
</body>
</html>
"""


def save_html(body: str, title: str, path: str):
    full = HTML_TEMPLATE.format(title=title, body=body)
    with open(path, "w", encoding="utf-8") as f:
        f.write(full)
    log.info(f"HTML saved → {path}  ({len(full):,} bytes)")
    return full


def main():
    parser = argparse.ArgumentParser(description="Migrate .docx → Document360")
    parser.add_argument("--docx",    default=DOCX_PATH,   help="Path to .docx file")
    parser.add_argument("--output",  default=HTML_OUTPUT, help="HTML output filename")
    parser.add_argument("--title",   default=ARTICLE_TITLE)
    parser.add_argument("--dry-run", action="store_true",  help="Skip API upload")
    args = parser.parse_args()

    log.info("══════════════════════════════════════════════")
    log.info("   Document360 Migration Pipeline  — START")
    log.info("══════════════════════════════════════════════")

    # ── Step 1: Parse ─────────────────────────────────────────────────────────
    log.info(f"[1/3]  Parsing  →  {args.docx}")
    if not os.path.exists(args.docx):
        log.error(f"File not found: {args.docx}")
        sys.exit(1)

    images_dir = os.path.dirname(os.path.abspath(args.docx))
    body_html  = docx_to_html(args.docx, images_dir=images_dir)
    log.info(f"       Parsed  {body_html.count('<')//2} elements into HTML")

    # ── Step 2: Save HTML ─────────────────────────────────────────────────────
    log.info(f"[2/3]  Saving  →  {args.output}")
    save_html(body_html, args.title, args.output)

    # ── Step 3: Upload ────────────────────────────────────────────────────────
    if args.dry_run:
        log.info("[3/3]  --dry-run: skipping Document360 upload")
    else:
        api_key    = D360_API_KEY    or os.getenv("D360_API_KEY", "")
        project_id = D360_PROJECT_ID or os.getenv("D360_PROJECT_ID", "")
        category_id = D360_CATEGORY_ID or os.getenv("D360_CATEGORY_ID", "")

        if not api_key or not project_id:
            log.error("D360_API_KEY and D360_PROJECT_ID must be set.")
            log.error("  export D360_API_KEY=your_key")
            log.error("  export D360_PROJECT_ID=your_project_version_id")
            sys.exit(1)

        log.info("[3/3]  Uploading  →  Document360")
        result = create_article(
            html_body          = body_html,
            title              = args.title,
            api_key            = api_key,
            project_version_id = project_id,
            user_id            = D360_USER_ID or os.getenv("D360_USER_ID", ""),
            category_id        = category_id or None,
        )

    log.info("══════════════════════════════════════════════")
    log.info("   Pipeline complete.")
    log.info("══════════════════════════════════════════════")


if __name__ == "__main__":
    main()
