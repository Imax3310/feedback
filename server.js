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
  pool.query(
    `SELECT
      f.id,
      c.name AS contact_name,
      c.phone AS contact_phone,
      c.email AS contact_email,
      t.name AS topic_name,
      f.message
    FROM
      feedback_tb f
      JOIN contacts c ON f.contact_id = c.id
      JOIN topics t ON f.topic_id = t.id
    ORDER BY f.id DESC
    LIMIT 1;`,
    (err, result) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        res.json(result.rows);
      }
    }
  );
});

app.post('/api/sendFeedback', (req, res) => {
  const { name, phone, email, message, topicId } = req.body;

  if (!name || !phone || !email || !message || !topicId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  pool.query(
    'SELECT id FROM contacts WHERE name = $1 AND phone = $2 AND email = $3;',
    [name, phone, email],
    (err, result) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      let contactId;

      if (result.rows.length > 0) {
        contactId = result.rows[0].id;
        insertFeedback(contactId);
      } else {
        pool.query(
          'INSERT INTO contacts (name, phone, email) VALUES ($1, $2, $3) RETURNING id;',
          [name, phone, email],
          (err, result) => {
            if (err) {
              console.error('Error executing query:', err);
              return res.status(500).json({ error: 'Internal Server Error' });
            }
            contactId = result.rows[0].id;
            insertFeedback(contactId);
          }
        );
      }
    }
  );

  const insertFeedback = (contactId) => {
    pool.query(
      'INSERT INTO feedback_tb (contact_id, message, topic_id) VALUES ($1, $2, $3);',
      [contactId, message, topicId],
      (err, result) => {
        if (err) {
          console.error('Error executing query:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.status(201).json({ message: 'Feedback successfully added' });
      }
    );
  };
});


