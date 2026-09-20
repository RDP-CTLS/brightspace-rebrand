"""Tiny static server for the headless test harness: serves a folder and accepts POST /result."""
import http.server, os, sys, urllib.parse
ROOT, OUT = sys.argv[1], sys.argv[2]
os.chdir(ROOT)
class H(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        body = self.rfile.read(int(self.headers.get('Content-Length', 0)))
        # POST /save/<name> keeps a file a test built (e.g. an exported zip) in SAVE_DIR; anything else is the result
        save = os.environ.get('SAVE_DIR')
        if self.path.startswith('/save/') and save:
            open(os.path.join(save, os.path.basename(urllib.parse.unquote(self.path[6:]))), 'wb').write(body)
        else:
            open(OUT, 'wb').write(body)
        self.send_response(204); self.end_headers()
    def log_message(self, *a): pass
http.server.ThreadingHTTPServer(('127.0.0.1', int(sys.argv[3]) if len(sys.argv) > 3 else 8765), H).serve_forever()
