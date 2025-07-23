#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load environment variables
require('dotenv').config();

// Create temporary migration config with SSL
const sslCertPath = path.join(__dirname, '../config/global-bundle.pem');
let sslConfig = false;

if (fs.existsSync(sslCertPath)) {
  try {
    const cert = fs.readFileSync(sslCertPath, 'utf8');
    sslConfig = {
      ca: cert,
      rejectUnauthorized: false
    };
  } catch (error) {
    console.warn('Warning: Could not read SSL certificate, using basic SSL');
    sslConfig = { rejectUnauthorized: false };
  }
} else {
  console.warn('Warning: SSL certificate file not found, using basic SSL');
  sslConfig = { rejectUnauthorized: false };
}

const config = {
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: sslConfig
};

// Create temporary config file
const tempConfigPath = path.join(__dirname, '../config/temp-migration-config.json');
fs.writeFileSync(tempConfigPath, JSON.stringify(config, null, 2));

try {
  // Get migration command arguments
  const args = process.argv.slice(2);
  const command = `node-pg-migrate -f ${tempConfigPath} ${args.join(' ')}`;
  
  console.log('Running migration with SSL configuration...');
  console.log(`Command: ${command}`);
  
  // Execute migration
  execSync(command, { stdio: 'inherit' });
  
} catch (error) {
  console.error('Migration failed:', error.message);
  process.exit(1);
} finally {
  // Clean up temporary config file
  if (fs.existsSync(tempConfigPath)) {
    fs.unlinkSync(tempConfigPath);
  }
}