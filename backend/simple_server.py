import http.server
import socketserver
import json

PORT = 8001

class SimpleHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {
                'status': 'ok',
                'message': 'Simple server is running'
            }
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {
                'status': 'error',
                'message': 'Not found'
            }
            self.wfile.write(json.dumps(response).encode())

print(f"Starting simple HTTP server on http://localhost:{PORT}")
with socketserver.TCPServer(("", PORT), SimpleHTTPRequestHandler) as httpd:
    print("Server started. Press Ctrl+C to stop.")
    httpd.serve_forever() 