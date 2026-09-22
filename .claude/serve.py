#!/usr/bin/env python3
"""Static file server for local preview.

Avoids `python3 -m http.server`, whose CLI builds an argparse default of
os.getcwd() at import time — this raises PermissionError under the
preview sandbox. Serving directory is hardcoded instead of derived from cwd.
"""
import functools
import http.server
import sys

# Hardcoded (not derived from __file__/os.getcwd()): the sandbox this script
# runs under denies the getcwd syscall, and abspath() on a relative path
# calls getcwd() internally, so any cwd-derived path crashes at startup.
ROOT = "/Users/asifaliyev/Desktop/Projects/icherisheher-home"
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 4173

handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
httpd = http.server.ThreadingHTTPServer(("", PORT), handler)
print(f"Serving {ROOT} at http://localhost:{PORT}")
httpd.serve_forever()
