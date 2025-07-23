#!/bin/bash

# After Install Script
# This script runs after the application files have been copied

echo "Starting after install process..."

# Set proper ownership and permissions
chown -R ubuntu:ubuntu /home/ubuntu/forumapi
chmod -R 755 /home/ubuntu/forumapi

# Set executable permissions for scripts
chmod +x /home/ubuntu/forumapi/scripts/*.sh

# Set proper ownership for .env file if it exists
if [ -f /home/ubuntu/forumapi/.env ]; then
    chown ubuntu:ubuntu /home/ubuntu/forumapi/.env
    chmod 600 /home/ubuntu/forumapi/.env
fi

echo "After install completed successfully"