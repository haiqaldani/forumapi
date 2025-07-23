#!/bin/bash
sudo apt update -y
curl -sL https://rpm.nodesource.com/setup_18.x | bash -
sudo apt install -y nodejs
npm install pm2 -g