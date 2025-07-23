#!/bin/bash
cd /home/ubuntu/forumapi

# Install production dependencies
npm ci --production

# Run database migrations
npm run migrate up

# Stop existing PM2 process if running
pm2 stop forumapi || true
pm2 delete forumapi || true

# Start application using dotenv (PM2 will automatically load .env file)
pm2 start src/app.js --name forumapi --update-env

# Save PM2 configuration
pm2 save

# Show PM2 status and logs
echo "PM2 Status:"
pm2 status
echo ""
echo "Recent logs:"
pm2 logs forumapi --lines 10 --nostream

# Verify the application is running on port 5000
echo ""
echo "Checking if application is running on port 5000:"
sleep 2
netstat -tlnp | grep :5000 || echo "Port 5000 not found in netstat"