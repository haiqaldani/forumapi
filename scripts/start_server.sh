#!/bin/bash
cd /home/ubuntu/forumapi
npm ci --production
npm run migrate up
pm2 start src/app.js --name forumapi --update-env || pm2 restart forumapi
pm2 save