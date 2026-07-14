#!/bin/bash
set -e
echo "Building RedHound PRO..."
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
mkdir -p scans/reports templates
cp dashboard.html templates/ 2>/dev/null || true
echo "Done! Run: source venv/bin/activate && python3 app.py"
