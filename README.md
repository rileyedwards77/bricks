# bricks

This project provides a simple web server and interface to view and manage your BrickLink wanted list.

## Getting Started

### 1. Requirements
- Python 3.x (tested with Python 3.7+)

### 2. Install Dependencies
No external dependencies are required (uses Python's built-in `http.server`).

### 3. Start the Server
Open a terminal in this project directory and run:

```bash
python server.py
```

By default, the server will start on [http://localhost:8080](http://localhost:8080)

### 4. Open the Wanted List
1. After starting the server, open your web browser.
2. Go to: [http://localhost:8080](http://localhost:8080)
3. The Bricks Wanted List UI will load, displaying items from `wantedList.json`.

## Project Structure
- `server.py` — Python HTTP server for static files and JSON updates
- `index.html` — Main web interface
- `script.js` — Handles dynamic UI and data fetching
- `styles.css` — Basic styling
- `wantedList.json` — Your wanted list data (editable)

## Editing the Wanted List
- You can update the wanted list directly via the web interface (if enabled), or by editing `wantedList.json` manually.

---

If you encounter any issues or want to add features, feel free to update the code or ask for help!