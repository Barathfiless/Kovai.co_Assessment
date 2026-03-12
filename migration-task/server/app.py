"""
app.py — Document360 Migration Web App
Live upload .docx → HTML → Document360 with real-time SSE streaming.
"""

import json
import os
import queue
import threading
import time
import uuid
import requests

from flask import Flask, Response, jsonify, request, stream_with_context
from flask_cors import CORS

# Import existing pipeline modules
from parser   import docx_to_html
from uploader import create_article

app = Flask(__name__)
CORS(app) # Enable CORS for all routes
app.config["MAX_CONTENT_LENGTH"] = 32 * 1024 * 1024  # 32 MB

# ── Config ────────────────────────────────────────────────────────────────────
DEFAULT_API_KEY    = "TvrDSpEEHxJVgfim9Gbqpw9ZZ5Vz2XwCFnPFqQ2DMFBl/A+ZI4PAfRO9qOGyG14nflFJ5n/8HuMsM2wiNzlBmT0QTuT1ktlNh0ueEqCKaRaSwygmVAbl3u5oKyyt3IYcKTLXz8XbxfYcXyG36rCFvA=="
DEFAULT_PROJECT_ID = "8de99e99-94af-4315-9047-8fd5f90b2f8d"
DEFAULT_USER_ID    = "9bc90a13-4c7a-45e6-b51d-839bc3a5a209"

# ── In-memory job store ───────────────────────────────────────────────────────
jobs: dict[str, queue.Queue] = {}

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


def sse_event(kind: str, **data) -> str:
    """Format a Server-Sent Event string."""
    payload = json.dumps({"type": kind, **data})
    return f"data: {payload}\n\n"


def run_pipeline(job_id: str, docx_path: str, title: str,
                 api_key: str, project_id: str, user_id: str,
                 dry_run: bool):
    """Run the full migration pipeline in a background thread, pushing SSE events."""
    q = jobs[job_id]

    def emit(kind, **kw):
        q.put(sse_event(kind, **kw))

    try:
        # ── Step 1: Parse ─────────────────────────────────────────────────────
        emit("step", step=1, status="active", message="Parsing Word document…")
        time.sleep(0.3)

        images_dir = os.path.dirname(docx_path)
        body_html  = docx_to_html(docx_path, images_dir=images_dir)
        elem_count = body_html.count("<") // 2

        emit("step", step=1, status="done",
             message=f"Parsed {elem_count} HTML elements from document")

        # ── Step 2: Save HTML ─────────────────────────────────────────────────
        emit("step", step=2, status="active", message="Generating HTML output…")
        time.sleep(0.2)

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
  </style>
</head>
<body>
{body}
</body>
</html>"""

        full_html  = HTML_TEMPLATE.format(title=title, body=body_html)
        html_bytes = len(full_html.encode("utf-8"))

        # Save HTML file
        html_path = os.path.join(UPLOAD_DIR, f"{job_id}_output.html")
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(full_html)

        emit("step", step=2, status="done",
             message=f"HTML generated — {html_bytes:,} bytes")
        emit("html_preview", html=body_html)   # send full HTML for preview

        # ── Step 3: Upload ────────────────────────────────────────────────────
        if dry_run:
            emit("step", step=3, status="skipped", message="Dry-run mode — upload skipped")
            emit("done", success=True, dry_run=True,
                 html_size=html_bytes, article_id=None, slug=None)
        else:
            emit("step", step=3, status="active", message="Uploading to Document360…")

            url     = "https://apihub.document360.io/v2/articles"
            headers = {"api_token": api_key, "Content-Type": "application/json"}
            payload = {
                "title":              title,
                "content":            full_html,
                "content_type":       2,
                "project_version_id": project_id,
                "article_status":     2,
                "user_id":            user_id,
            }

            resp = requests.post(url, headers=headers, json=payload, timeout=30)
            data = resp.json()

            if data.get("success") and data.get("data"):
                art = data["data"]
                emit("step", step=3, status="done",
                     message=f"Article uploaded — ID: {art.get('id', '')[:8]}…")
                emit("done",
                     success=True,
                     dry_run=False,
                     http_status=resp.status_code,
                     article_id=art.get("id"),
                     title=art.get("title"),
                     slug=art.get("slug"),
                     version=art.get("latest_version"),
                     modified_at=art.get("modified_at"),
                     html_size=html_bytes,
                     response=data)
            else:
                errors = [e.get("description", "Unknown error") for e in data.get("errors", [])]
                emit("step", step=3, status="error",
                     message=f"Upload failed: {'; '.join(errors)}")
                emit("done", success=False, dry_run=False,
                     http_status=resp.status_code,
                     errors=errors, response=data)

    except Exception as exc:
        jobs[job_id].put(sse_event("error", message=str(exc)))

    finally:
        # Signal stream end
        jobs[job_id].put(None)
        # Clean up uploaded docx
        try:
            os.remove(docx_path)
        except Exception:
            pass


# ── Routes ────────────────────────────────────────────────────────────────────

@app.route("/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/upload", methods=["POST"])
def upload():
    """Receive the .docx + config, start a background job, return job_id."""
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    f = request.files["file"]
    if not f.filename.endswith(".docx"):
        return jsonify({"error": "Only .docx files are supported"}), 400

    job_id  = str(uuid.uuid4())
    docx_path = os.path.join(UPLOAD_DIR, f"{job_id}_{f.filename}")
    f.save(docx_path)

    title      = request.form.get("title", "Untitled Document")
    api_key    = request.form.get("api_key",    DEFAULT_API_KEY)
    project_id = request.form.get("project_id", DEFAULT_PROJECT_ID)
    user_id    = request.form.get("user_id",    DEFAULT_USER_ID)
    dry_run    = request.form.get("dry_run", "false").lower() == "true"

    jobs[job_id] = queue.Queue()

    thread = threading.Thread(
        target=run_pipeline,
        args=(job_id, docx_path, title, api_key, project_id, user_id, dry_run),
        daemon=True,
    )
    thread.start()

    return jsonify({"job_id": job_id})


@app.route("/stream/<job_id>")
def stream(job_id):
    """SSE endpoint — streams pipeline events for the given job."""
    if job_id not in jobs:
        return Response("data: {\"type\":\"error\",\"message\":\"Job not found\"}\n\n",
                        mimetype="text/event-stream")

    def generate():
        q = jobs[job_id]
        while True:
            try:
                event = q.get(timeout=60)
                if event is None:
                    break
                yield event
            except queue.Empty:
                yield ": keep-alive\n\n"
        del jobs[job_id]

    return Response(
        stream_with_context(generate()),
        mimetype="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@app.route("/download/<job_id>")
def download_html(job_id):
    """Download the generated HTML file."""
    html_path = os.path.join(UPLOAD_DIR, f"{job_id}_output.html")
    if not os.path.exists(html_path):
        return "File not found", 404
    with open(html_path, "r", encoding="utf-8") as f:
        content = f.read()
    return Response(
        content,
        mimetype="text/html",
        headers={"Content-Disposition": f"attachment; filename=output.html"},
    )


if __name__ == "__main__":
    app.run(debug=True, port=5000, threaded=True)
