import http.server
import socketserver
import json
import os
from urllib.parse import urlparse, parse_qs

# Define the path to the JSON file
JSON_FILE = 'wantedList.json'

class RequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Handle normal GET requests (serving static files)
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        return http.server.SimpleHTTPRequestHandler.do_GET(self)
    
    def do_OPTIONS(self):
        # Handle preflight CORS requests
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_POST(self):
        # Handle POST requests to update the JSON file
        if self.path == '/update_json':
            # Add CORS headers
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                # Parse the JSON data
                updated_items = json.loads(post_data.decode('utf-8'))
                
                # Load existing data to ensure we're not losing any items
                if os.path.exists(JSON_FILE):
                    with open(JSON_FILE, 'r') as f:
                        existing_items = json.load(f)
                    
                    # Create a dictionary of existing items by ID for quick lookup
                    existing_dict = {item['id']: item for item in existing_items}
                    
                    # Create a dictionary of updated items by ID for quick lookup
                    updated_dict = {item['id']: item for item in updated_items}
                    
                    # Ensure all existing items are preserved
                    for item_id, item in existing_dict.items():
                        if item_id not in updated_dict:
                            updated_items.append(item)
                
                # Write the updated data to the JSON file
                with open(JSON_FILE, 'w') as f:
                    json.dump(updated_items, f, indent=4)
                
                # Send a success response
                self.wfile.write(json.dumps({'success': True}).encode('utf-8'))
                print(f"Updated {JSON_FILE} successfully with {len(updated_items)} items")
            except Exception as e:
                # Send an error response
                self.wfile.write(json.dumps({'success': False, 'error': str(e)}).encode('utf-8'))
                print(f"Error updating {JSON_FILE}: {str(e)}")
        else:
            # For any other POST requests, return 404
            self.send_response(404)
            self.end_headers()

# Set up the server
PORT = 8080
Handler = RequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving at port {PORT}")
    httpd.serve_forever()
