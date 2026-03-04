import json
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

from .chatbot import answer_question
from .db import fetch_store_diagnosis, init_db

STATIC_DIR = Path(__file__).resolve().parent / "static"


class DashboardHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(STATIC_DIR), **kwargs)

    def _send_json(self, status_code: int, payload: dict):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/api/diagnosis":
            self._send_json(200, {"stores": fetch_store_diagnosis()})
            return

        if path in ["/", "/index.html"]:
            self.path = "/index.html"

        super().do_GET()

    def do_POST(self):
        path = urlparse(self.path).path
        if path != "/api/chat":
            self._send_json(404, {"error": "Not found"})
            return

        content_length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(content_length)

        try:
            data = json.loads(raw.decode("utf-8"))
            message = data.get("message", "")
        except (json.JSONDecodeError, UnicodeDecodeError, AttributeError):
            self._send_json(400, {"error": "Invalid JSON payload"})
            return

        answer = answer_question(message)
        self._send_json(200, {"answer": answer})


def run(host: str = "0.0.0.0", port: int = 8000):
    init_db()
    server = ThreadingHTTPServer((host, port), DashboardHandler)
    print(f"Store dashboard started: http://{host}:{port}")
    server.serve_forever()


if __name__ == "__main__":
    run()
