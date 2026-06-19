import xml.etree.ElementTree as ET
from flask import Flask, jsonify, render_template
import requests

app = Flask(__name__)

FEED_URL = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"

ATOM_NS = "http://www.w3.org/2005/Atom"


def parse_feed(xml_text):
    root = ET.fromstring(xml_text)

    entries = []
    for entry in root.findall(f"{{{ATOM_NS}}}entry"):
        title_el = entry.find(f"{{{ATOM_NS}}}title")
        summary_el = entry.find(f"{{{ATOM_NS}}}summary")
        content_el = entry.find(f"{{{ATOM_NS}}}content")
        updated_el = entry.find(f"{{{ATOM_NS}}}updated")
        link_el = entry.find(f"{{{ATOM_NS}}}link")
        id_el = entry.find(f"{{{ATOM_NS}}}id")

        title = title_el.text if title_el is not None else "No title"
        body = ""
        if content_el is not None and content_el.text:
            body = content_el.text
        elif summary_el is not None and summary_el.text:
            body = summary_el.text

        updated = updated_el.text if updated_el is not None else ""
        link = link_el.get("href") if link_el is not None else "#"
        entry_id = id_el.text if id_el is not None else ""

        entries.append(
            {
                "id": entry_id,
                "title": title,
                "body": body,
                "updated": updated,
                "link": link,
            }
        )

    return entries


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/release-notes")
def release_notes():
    try:
        resp = requests.get(FEED_URL, timeout=15)
        resp.raise_for_status()
        entries = parse_feed(resp.text)
        return jsonify({"success": True, "entries": entries})
    except requests.RequestException as e:
        return jsonify({"success": False, "error": str(e)}), 502
    except ET.ParseError as e:
        return jsonify({"success": False, "error": f"XML parse error: {e}"}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
