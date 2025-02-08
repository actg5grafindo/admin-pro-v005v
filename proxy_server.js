const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// Konfigurasi koneksi database
const POSTGRES_CONFIG = {
  host: 'localhost',
  port: 5432,
  database: 'adminpro_db',
  user: 'adminpro_user',
  password: '7OQYXHccuGsD5@R',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Middleware
app.use(cors());
app.use(express.json());

// Middleware untuk log permintaan
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Endpoint untuk eksekusi query
app.post('/query', async (req, res) => {
  const { query, params, config = POSTGRES_CONFIG } = req.body;

  try {
    const pool = new Pool(config);
    const result = await pool.query(query, params);
    await pool.end();

    res.json({
      success: true,
      rows: result.rows,
      rowCount: result.rowCount
    });
  } catch (error) {
    console.error('Database Query Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Database query failed',
      details: { query, params }
    });
  }
});

// Endpoint status server
app.get('/status', (req, res) => {
  res.json({
    status: 'running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Jalankan server
const server = app.listen(port, () => {
  console.log(`Database proxy server running on http://localhost:${port}`);
});

// Tangani penutupan server
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing HTTP server.');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});

module.exports = app;
