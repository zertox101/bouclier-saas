#!/bin/bash
echo "🔍 Testing AI Gateway from Backend Container..."
echo ""

echo "1. Health Check:"
curl -s http://ai-gateway:8200/health | python3 -m json.tool
echo ""

echo "2. AI Generation Test:"
curl -s -X POST http://ai-gateway:8200/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"What is a firewall?","stream":false}' \
  | python3 -m json.tool | head -20

echo ""
echo "✅ Test complete"
