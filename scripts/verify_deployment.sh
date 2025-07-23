#!/bin/bash

echo "=== Forum API Deployment Verification ==="
echo

# Check PM2 status
echo "1. PM2 Status:"
pm2 status

echo
echo "2. Checking port 5000:"
if netstat -tlnp | grep :5000; then
    echo "✅ Port 5000 is listening"
else
    echo "❌ Port 5000 is not listening"
fi

echo
echo "3. Testing local API endpoint:"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/hello | grep -q "200"; then
    echo "✅ Hello endpoint responds with 200"
    echo "Response: $(curl -s http://localhost:5000/hello)"
else
    echo "❌ Hello endpoint not responding correctly"
    echo "Response code: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/hello)"
fi

echo
echo "4. PM2 Logs (last 20 lines):"
pm2 logs forumapi --lines 20 --nostream

echo
echo "5. Environment check:"
if [ -f .env ]; then
    echo "✅ .env file exists"
    echo ".env file contents (excluding secrets):"
    grep -E "^(HOST|PORT|NODE_ENV)=" .env || echo "Basic environment variables not found in .env"
else
    echo "❌ .env file not found"
    echo "Please create .env file based on .env.example"
fi

echo
echo "=== Verification Complete ==="