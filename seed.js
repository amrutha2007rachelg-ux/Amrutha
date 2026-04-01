const mysql = require('mysql2/promise');
require('dotenv').config();

async function seedDatabase() {
  const dbUrl = process.env.DATABASE_URL;
  let connection;

  if (dbUrl) {
    connection = await mysql.createConnection(dbUrl + '?multipleStatements=true');
    console.log('Connected to Railway/Cloud MySQL...');
  } else {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });
    console.log('Connected to Local MySQL...');
  }

  // Create/Use tables
  if (dbUrl) {
    // If using a URL, the database name is typically already in the URL
    // Just ensure we are using the connection we have
  } else {
    await connection.query('CREATE DATABASE IF NOT EXISTS amrutha_sarees;');
    await connection.query('USE amrutha_sarees;');
  }

  await connection.query(`
    CREATE TABLE IF NOT EXISTS sarees (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL,
      image_url VARCHAR(600) NOT NULL,
      category VARCHAR(80),
      in_stock BOOLEAN DEFAULT TRUE
    );

    CREATE TABLE IF NOT EXISTS cart (
      id INT AUTO_INCREMENT PRIMARY KEY,
      saree_id INT NOT NULL,
      quantity INT DEFAULT 1,
      added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (saree_id) REFERENCES sarees(id) ON DELETE CASCADE
    );
  `);

  console.log('Tables created...');

  // Clear existing data
  if (dbUrl) {
    await connection.query('DELETE FROM cart; DELETE FROM sarees; ALTER TABLE sarees AUTO_INCREMENT = 1;');
  } else {
    await connection.query('USE amrutha_sarees; DELETE FROM cart; DELETE FROM sarees; ALTER TABLE sarees AUTO_INCREMENT = 1;');
  }

  const sarees = [
    {
      name: 'Royal Kanjivaram Silk Saree',
      description: 'Exquisite pure Kanjivaram silk saree with rich gold zari border and traditional temple motifs. A timeless piece for weddings.',
      price: 12999.00,
      image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80',
      category: 'Silk'
    },
    {
      name: 'Banarasi Brocade Saree',
      description: 'Opulent Banarasi brocade saree woven with intricate floral patterns in gold and silver threads on a deep maroon base.',
      price: 9499.00,
      image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80',
      category: 'Banarasi'
    },
    {
      name: 'Chanderi Cotton Silk Saree',
      description: 'Lightweight Chanderi cotton-silk saree with delicate zari checks, perfect for festivals and casual occasions.',
      price: 3499.00,
      image_url: 'https://images.unsplash.com/photo-1617627143233-4df547e5e1c9?w=600&q=80',
      category: 'Cotton'
    },
    {
      name: 'Mysore Crepe Silk Saree',
      description: 'Elegant Mysore crepe silk saree in a stunning peacock blue with hand-painted floral motifs along the border.',
      price: 7299.00,
      image_url: 'https://images.unsplash.com/photo-1585944285353-5e3f03c1f97b?w=600&q=80',
      category: 'Silk'
    },
    {
      name: 'Ikkat Pochampally Saree',
      description: 'Traditional Pochampally Ikkat saree with geometric tie-dye patterns. Handwoven by skilled artisans of Telangana.',
      price: 4799.00,
      image_url: 'https://images.unsplash.com/photo-1614701655600-9c544fdca5a0?w=600&q=80',
      category: 'Ikkat'
    },
    {
      name: 'Embroidered Georgette Party Saree',
      description: 'Stunning georgette saree with heavy sequin and thread embroidery, designed for parties and evening events.',
      price: 5999.00,
      image_url: 'https://images.unsplash.com/photo-1592762696942-8a0d0c4e34c4?w=600&q=80',
      category: 'Georgette'
    },
    {
      name: 'Linen Handloom Saree',
      description: 'Breathable linen handloom saree with natural texture and minimalist block-print design. Ideal for summer wear.',
      price: 2799.00,
      image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80',
      category: 'Linen'
    },
    {
      name: 'Patola Pure Silk Saree',
      description: 'Rare double Patola silk saree from Patan, Gujarat. Features vivid double ikat weave – a UNESCO-recognized craft.',
      price: 18499.00,
      image_url: 'https://images.unsplash.com/photo-1606218810523-8b531b69aef0?w=600&q=80',
      category: 'Silk'
    },
    {
      name: 'Chiffon Floral Print Saree',
      description: 'Soft chiffon saree with an all-over floral print, complemented by a contrast satin border. Light and effortlessly stylish.',
      price: 1999.00,
      image_url: 'https://images.unsplash.com/photo-1647891573734-b3f19e6fb2a1?w=600&q=80',
      category: 'Chiffon'
    },
    {
      name: 'Kasavu Kerala Saree',
      description: 'Classic off-white Kerala kasavu saree with pure gold zari border. Perfect for Onam, Vishu and traditional ceremonies.',
      price: 4299.00,
      image_url: 'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?w=600&q=80',
      category: 'Cotton'
    }
  ];

  for (const saree of sarees) {
    await connection.query(
      'INSERT INTO sarees (name, description, price, image_url, category) VALUES (?, ?, ?, ?, ?)',
      [saree.name, saree.description, saree.price, saree.image_url, saree.category]
    );
  }

  console.log('✅ Database seeded with 10 sarees successfully!');
  await connection.end();
}

seedDatabase().catch(err => {
  console.error('❌ Seeding failed:', err.message);
  process.exit(1);
});
