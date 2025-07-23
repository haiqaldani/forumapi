#!/bin/bash

# After Install Script
# This script runs after the application files have been copied

echo "Starting after install process..."

# Set proper ownership and permissions
chown -R ubuntu:ubuntu /home/ubuntu/forumapi
chmod -R 755 /home/ubuntu/forumapi

# Set executable permissions for scripts
chmod +x /home/ubuntu/forumapi/scripts/*.sh

echo "After install completed successfully"