import http.server
import socketserver
import socket
import os
import sys

PORT = 8080

def get_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable caching and CORS
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

if __name__ == '__main__':
    web_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(web_dir)
    local_ip = get_ip()

    print("=" * 60)
    print("   ChronoSense - Mobile Time & Habit Audit Server")
    print("=" * 60)
    print(f"[*] Local PC Browser:   http://localhost:{PORT}")
    print(f"[*] Mobile Phone (Wi-Fi): http://{local_ip}:{PORT}")
    print("=" * 60)
    print("Instructions for Mobile Phone:")
    print(f" 1. Connect phone to same Wi-Fi as PC.")
    print(f" 2. Open Chrome/Safari and visit: http://{local_ip}:{PORT}")
    print(" 3. Tap Menu (or Share) -> 'Add to Home Screen'.")
    print(" 4. It installs as a real app icon on your phone!")
    print("=" * 60)
    print("Press Ctrl+C to stop the server.\n")

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
