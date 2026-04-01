const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('../db');

const app = express();

app.use(cors());
app.use(express.json());

// Serve static frontend files (When running locally)
app.use(express.static(path.join(__dirname, '../public')));

// ─── SAREE API ──────────────────────────────────────────────────

// GET all sarees
app.get('/api/sarees', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM sarees WHERE in_stock = TRUE ORDER BY id ASC');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single saree
app.get('/api/sarees/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM sarees WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Saree not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── CART API ───────────────────────────────────────────────────

app.get('/api/cart', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.id AS cart_id, c.saree_id, c.quantity, c.added_at,
             s.name, s.price, s.image_url, s.category
      FROM cart c
      JOIN sarees s ON c.saree_id = s.id
      ORDER BY c.added_at DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/cart', async (req, res) => {
  const { saree_id, quantity = 1 } = req.body;
  if (!saree_id) return res.status(400).json({ success: false, message: 'saree_id is required' });
  try {
    const [existing] = await pool.query('SELECT * FROM cart WHERE saree_id = ?', [saree_id]);
    if (existing.length > 0) {
      await pool.query('UPDATE cart SET quantity = quantity + ? WHERE saree_id = ?', [quantity, saree_id]);
      return res.json({ success: true, message: 'Cart updated' });
    }
    await pool.query('INSERT INTO cart (saree_id, quantity) VALUES (?, ?)', [saree_id, quantity]);
    res.json({ success: true, message: 'Added to cart' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/cart/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM cart WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Removed from cart' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/cart', async (req, res) => {
  try {
    await pool.query('DELETE FROM cart');
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Vercel serverless export
module.exports = app;

// Local entry point
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`\n✅ Amrutha Saree Collection server running at http://localhost:${port}\n`);
  });
}
