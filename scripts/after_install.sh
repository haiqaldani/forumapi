#!/bin/bash

# After Install Script
# This script runs after the application files have been copied

echo "Starting after install process..."

# Set proper ownership and permissions
chown -R ubuntu:ubuntu /home/ubuntu/forumapi
chmod -R 755 /home/ubuntu/forumapi

# Set executable permissions for scripts
chmod +x /home/ubuntu/forumapi/scripts/*.sh

# Set proper ownership for .env file
chown ubuntu:ubuntu /home/ubuntu/forumapi/.env
chmod 600 /home/ubuntu/forumapi/.env

# Setup nginx configuration
echo "Setting up nginx configuration..."

# Add rate limiting zones to main nginx.conf if not already present
if ! grep -q "zone=api:10m" /etc/nginx/nginx.conf; then
    sed -i '/http {/a\\tlimit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;\n\tlimit_req_zone $binary_remote_addr zone=threads:10m rate=90r/m;' /etc/nginx/nginx.conf
fi

# Copy site configuration
cp /home/ubuntu/forumapi/nginx/forumapi /etc/nginx/sites-available/forumapi
ln -sf /etc/nginx/sites-available/forumapi /etc/nginx/sites-enabled/forumapi

# Remove default nginx site
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
nginx -t

# Reload nginx
systemctl reload nginx

echo "After install completed successfully"