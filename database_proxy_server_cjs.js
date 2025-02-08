const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

app.post('/query', async (req, res) => {
  const { query, params, config } = req.body;

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
      message: error.message || 'Database query failed'
    });
  }
});

app.listen(port, () => {
  console.log(`Database proxy server running on http://localhost:${port}`);
});

module.exports = app;
