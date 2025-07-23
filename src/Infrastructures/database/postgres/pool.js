/* istanbul ignore file */

const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const testConfig = {
  host: process.env.PGHOST_TEST,
  port: process.env.PGPORT_TEST,
  user: process.env.PGUSER_TEST,
  password: process.env.PGPASSWORD_TEST,
  database: process.env.PGDATABASE_TEST,
};

const devConfig = {
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
};

// SSL configuration for production
let sslConfig = false;
const certPath = path.join(__dirname, "../../../config/global-bundle.pem");

if (process.env.NODE_ENV === "production" && fs.existsSync(certPath)) {
  try {
    sslConfig = {
      ca: fs.readFileSync(certPath).toString(),
      rejectUnauthorized: false,
    };
  } catch (error) {
    console.warn("Warning: Could not read SSL certificate file:", error.message);
    sslConfig = { rejectUnauthorized: false };
  }
} else if (process.env.NODE_ENV === "production") {
  // Use basic SSL if certificate file doesn't exist
  sslConfig = { rejectUnauthorized: false };
}

const prodConfig = {
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: sslConfig,
};

let pool;

if (process.env.NODE_ENV === "test") {
  pool = new Pool(testConfig);
} else if (process.env.NODE_ENV === "production") {
  pool = new Pool(prodConfig);
} else {
  // development environment
  pool = new Pool(devConfig);
}

module.exports = pool;
