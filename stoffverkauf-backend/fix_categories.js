const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const connectDb = require('./connectdb');
const Product = require('./Modals/AddProducts/add_products');

const categoryMap = {
  'stoffe': 'Stoffe',
  'kurzwaren': 'Kurzwaren',
  'reststoffe': 'Reststoffe',
  'schnittmuster': 'Schnittmuster',
  'stofferapporte': 'Stoffe (Rapporte)'
};

async function fixCategories() {
  await connectDb();

  const dataFile = path.join(__dirname, '..', 'products_data.json');
  if (!fs.existsSync(dataFile)) {
    console.error('products_data.json not found!');
    process.exit(1);
  }

  const allProducts = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  const skuToCategory = {};

  for (const p of allProducts) {
    try {
      const urlPath = new URL(p.originalUrl).pathname.split('/')[1];
      if (categoryMap[urlPath]) {
        skuToCategory[p.sku] = categoryMap[urlPath];
      }
    } catch (e) {}
  }

  const productsInDb = await Product.find({ category: 'Uncategorized' });
  console.log(`Found ${productsInDb.length} uncategorized products in DB.`);

  let fixedCount = 0;

  for (const prod of productsInDb) {
    if (skuToCategory[prod.sku]) {
      prod.category = skuToCategory[prod.sku];
      await prod.save();
      fixedCount++;
    }
  }

  console.log(`Fixed category for ${fixedCount} products!`);
  process.exit(0);
}

fixCategories().catch(console.error);
