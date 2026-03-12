"""
uploader.py — Document360 Article Creation via REST API
POST /v2/articles  (apihub.document360.io)
"""

import json
import logging
import requests

log = logging.getLogger(__name__)

D360_BASE_URL = "https://apihub.document360.io/v2"


def create_article(
    html_body: str,
    title: str,
    api_key: str,
    project_version_id: str,
    user_id: str = None,
    category_id: str = None,
    article_status: int = 2,       # 2 = Published
    content_type: int = 2,         # 2 = HTML
) -> dict:
    """
    Upload an article to Document360.

    Args:
        html_body:          The HTML content string.
        title:              Article title.
        api_key:            Document360 API token.
        project_version_id: Target project version ID.
        category_id:        Optional category to place the article in.
        article_status:     1=Draft, 2=Published.
        content_type:       2=HTML editor.

    Returns:
        Parsed JSON response dict.
    """
    url = f"{D360_BASE_URL}/articles"

    headers = {
        "api_token": api_key,
        "Content-Type": "application/json",
    }

    payload = {
        "title":              title,
        "content":            html_body,
        "content_type":       content_type,
        "project_version_id": project_version_id,
        "article_status":     article_status,
    }

    if user_id:
        payload["user_id"] = user_id

    if category_id:
        payload["category_id"] = category_id

    log.info("──────────────────────────────────────────")
    log.info(f"  POST  {url}")
    log.info(f"  Title: {title}")
    log.info(f"  Content length: {len(html_body):,} characters")
    log.info("──────────────────────────────────────────")

    response = requests.post(url, headers=headers, json=payload, timeout=30)

    log.info(f"  HTTP {response.status_code}")

    try:
        data = response.json()
    except Exception:
        data = {"raw": response.text}

    log.info(f"  Response:\n{json.dumps(data, indent=2)}")

    if response.status_code in (200, 201):
        log.info("  ✅  Article created successfully!")
    else:
        log.warning(f"  ⚠️   API error {response.status_code}. Verify API key and project_version_id.")

    return data
