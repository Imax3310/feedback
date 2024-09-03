const express = require('express');
const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'feedback_db',
  password: '1234',
  port: 5432,
});

pool.connect((err) => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err);
  } else {
    console.log('Connected to PostgreSQL');
  }
});

app.get('/api/getFeedback', (req, res) => {
  pool.query('SELECT * FROM feedback_tb ORDER BY id DESC LIMIT 1;', (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(result.rows);
    }
  });
});

app.post('/api/sendFeedback', (req, res) => {
  const { name, phone, email, message, topic } = req.body;

  if (!name || !phone || !email || !message || !topic) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  pool.query(
    'INSERT INTO feedback_tb (name, phone, email, message, topic) VALUES ($1, $2, $3, $4, $5);',
    [name, phone, email, message, topic],
    (err, result) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      res.status(201).json(result.rows[0]);
    }
  );
});

