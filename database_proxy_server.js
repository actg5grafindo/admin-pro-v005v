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
  max: 20,  // Jumlah maksimum koneksi dalam pool
  idleTimeoutMillis: 30000,  // Waktu tunggu koneksi idle
  connectionTimeoutMillis: 2000,  // Waktu tunggu untuk membuat koneksi
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
    // Buat pool koneksi
    const pool = new Pool(config);

    // Jalankan query
    const result = await pool.query(query, params);

    // Tutup pool setelah selesai
    await pool.end();

    // Kirim respons
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
      details: {
        query,
        params
      }
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

// Tangani kesalahan yang tidak tertangani
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Jalankan server
const server = app.listen(port, () => {
  console.log(`Database proxy server running on http://localhost:${port}`);
});

// Tangani penutupan server dengan baik
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing HTTP server.');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});

module.exports = app;
