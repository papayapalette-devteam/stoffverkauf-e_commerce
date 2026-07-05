const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const connectDb = require('./connectdb');
const Product = require('./Modals/AddProducts/add_products');

async function syncProducts() {
  await connectDb();

  const dataFile = path.join(__dirname, '..', 'products_data.json');
  if (!fs.existsSync(dataFile)) {
    console.error('products_data.json not found! Cannot sync.');
    process.exit(1);
  }

  const oldProducts = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  console.log(`Loaded ${oldProducts.length} products from old site data.`);

  if (oldProducts.length < 2000) {
    console.error('SAFETY ABORT: Only found ' + oldProducts.length + ' products in JSON. Expected around 2144. Aborting to prevent accidental mass deletion.');
    process.exit(1);
  }

  const newProducts = await Product.find({}, 'sku');
  console.log(`Found ${newProducts.length} products in new site database.`);

  const oldSkus = new Set(oldProducts.map(p => p.sku));
  const newSkus = new Set(newProducts.map(p => p.sku));

  let toDelete = [];
  let toAdd = [];

  for (const p of newProducts) {
    if (!oldSkus.has(p.sku)) {
      toDelete.push(p.sku);
    }
  }

  for (const p of oldProducts) {
    if (!newSkus.has(p.sku)) {
      toAdd.push(p);
    }
  }

  console.log(`Products to delete from new site: ${toDelete.length}`);
  console.log(`Products to add to new site: ${toAdd.length}`);

  if (toDelete.length > 0) {
    const res = await Product.deleteMany({ sku: { $in: toDelete } });
    console.log(`Deleted ${res.deletedCount} products.`);
  }

  if (toAdd.length > 0) {
    console.log('Downloading images for missing products...');
    const outDir = path.join(__dirname, '..', 'all-images');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const productsToInsert = [];
    for (let i = 0; i < toAdd.length; i++) {
      const p = toAdd[i];
      let filename = null;
      if (p.imgUrl) {
        try {
          console.log(`[${i+1}/${toAdd.length}] Downloading image for SKU ${p.sku}...`);
          const imgRes = await axios.get(p.imgUrl, { responseType: 'arraybuffer', timeout: 15000 });
          const ext = path.extname(new URL(p.imgUrl).pathname) || '.jpg';
          filename = `${p.sku}${ext}`;
          fs.writeFileSync(path.join(outDir, filename), imgRes.data);
        } catch (e) {
          console.error(`Failed to download image for ${p.sku}: ${e.message}`);
        }
      }

      let numericPrice = 0;
      if (p.price) {
         const clean = p.price.replace(/[^0-9,.]/g, '').replace(',', '.');
         numericPrice = parseFloat(clean) || 0;
      }
      
      productsToInsert.push({
        name: p.title || 'Untitled',
        sku: p.sku,
        price: numericPrice,
        category: 'Uncategorized',
        description: p.description,
        images: filename ? [filename] : [],
        inStock: true
      });
    }

    const res = await Product.insertMany(productsToInsert);
    console.log(`Inserted ${res.length} new products.`);
  }

  console.log('Sync complete.');
  process.exit(0);
}

syncProducts().catch(err => {
  console.error(err);
  process.exit(1);
});
