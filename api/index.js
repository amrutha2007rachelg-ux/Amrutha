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

// GET all sarees (with high-quality fallback if DB fails)
app.get('/api/sarees', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM sarees WHERE in_stock = TRUE ORDER BY id ASC');
    res.json({ success: true, data: rows });
  } catch (err) {
    console.warn('Database connection failed, serving fallback data:', err.message);
    
    // ─── BEAUTIFUL FALLBACK DATA (Mock Items) ────────────────────────
    const fallbackSarees = [
      {
        id: 101, name: 'Royal Kanjivaram Silk', category: 'Silk', price: 12999,
        description: 'Exquisite pure Kanjivaram silk with rich gold zari. A timeless wedding piece.',
        image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80'
      },
      {
        id: 102, name: 'Banarasi Brocade', category: 'Banarasi', price: 9499,
        description: 'Opulent Banarasi brocade woven with intricate floral patterns in gold threads.',
        image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80'
      },
      {
        id: 103, name: 'Chanderi Cotton Silk', category: 'Cotton', price: 3499,
        description: 'Lightweight Chanderi cotton-silk with delicate zari checks, perfect for festivals.',
        image_url: 'https://images.unsplash.com/photo-1617627143233-4df547e5e1c9?w=600&q=80'
      },
      {
        id: 104, name: 'Mysore Crepe Silk', category: 'Silk', price: 7299,
        description: 'Elegant Mysore crepe silk in peacock blue with hand-painted floral motifs.',
        image_url: 'https://images.unsplash.com/photo-1585944285353-5e3f03c1f97b?w=600&q=80'
      },
      {
        id: 105, name: 'Ikkat Pochampally', category: 'Ikkat', price: 4799,
        description: 'Handwoven Pochampally Ikkat with geometric tie-dye patterns from Telangana.',
        image_url: 'https://images.unsplash.com/photo-1614701655600-9c544fdca5a0?w=600&q=80'
      },
      {
        id: 106, name: 'Embroidered Georgette', category: 'Georgette', price: 5999,
        description: 'Stunning georgette with heavy sequin and thread embroidery for evening events.',
        image_url: 'https://images.unsplash.com/photo-1592762696942-8a0d0c4e34c4?w=600&q=80'
      },
      {
        id: 107, name: 'Linen Handloom Saree', category: 'Linen', price: 2799,
        description: 'Breathable linen handloom saree with natural texture and minimalist block-print design.',
        image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80'
      },
      {
        id: 108, name: 'Patola Pure Silk Saree', category: 'Silk', price: 18499,
        description: 'Rare double Patola silk saree from Patan, Gujarat. Features vivid double ikat weave.',
        image_url: 'https://images.unsplash.com/photo-1606218810523-8b531b69aef0?w=600&q=80'
      }
    ];

    res.json({ success: true, data: fallbackSarees, note: 'fallback_active' });
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

// ─── CART API (with local memory fallback) ───────────────────────
let mockCart = []; // Local memory storage for when DB is down

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
    console.warn('Cart retrieval failed, serving mock cart:', err.message);
    res.json({ success: true, data: mockCart, note: 'fallback_active' });
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
    console.warn('Cart submission failed, using mock cart:', err.message);
    
    // Fallback Mock Logic
    const existingIndex = mockCart.findIndex(item => item.saree_id === saree_id);
    if (existingIndex > 0) {
        mockCart[existingIndex].quantity += quantity;
    } else {
        // We need the saree details for the UI
        // In fallback mode, we assume the saree exists in the fallback list
        const fallbackSarees = [
            { id: 101, name: 'Royal Kanjivaram Silk', category: 'Silk', price: 12999, image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80' },
            { id: 102, name: 'Banarasi Brocade', category: 'Banarasi', price: 9499, image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80' },
            { id: 103, name: 'Chanderi Cotton Silk', category: 'Cotton', price: 3499, image_url: 'https://images.unsplash.com/photo-1617627143233-4df547e5e1c9?w=600&q=80' },
            { id: 104, name: 'Mysore Crepe Silk', category: 'Silk', price: 7299, image_url: 'https://images.unsplash.com/photo-1585944285353-5e3f03c1f97b?w=600&q=80' },
            { id: 105, name: 'Ikkat Pochampally', category: 'Ikkat', price: 4799, image_url: 'https://images.unsplash.com/photo-1614701655600-9c544fdca5a0?w=600&q=80' },
            { id: 106, name: 'Embroidered Georgette', category: 'Georgette', price: 5999, image_url: 'https://images.unsplash.com/photo-1592762696942-8a0d0c4e34c4?w=600&q=80' },
            { id: 107, name: 'Linen Handloom Saree', category: 'Linen', price: 2799, image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80' },
            { id: 108, name: 'Patola Pure Silk Saree', category: 'Silk', price: 18499, image_url: 'https://images.unsplash.com/photo-1606218810523-8b531b69aef0?w=600&q=80' }
        ];
        
        const saree = fallbackSarees.find(s => s.id === saree_id);
        if (saree) {
            mockCart.push({
                cart_id: Date.now(),
                saree_id: saree.id,
                quantity: quantity,
                name: saree.name,
                price: saree.price,
                image_url: saree.image_url,
                category: saree.category
            });
        }
    }
    res.json({ success: true, message: 'Added to cart (Fallback)' });
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
