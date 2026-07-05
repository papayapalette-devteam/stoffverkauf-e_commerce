const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const connectDb = require('./connectdb');
const Product = require('./Modals/AddProducts/add_products');

async function fixImages() {
  await connectDb();

  const dataFile = path.join(__dirname, '..', 'products_data.json');
  if (!fs.existsSync(dataFile)) {
    console.error('products_data.json not found!');
    process.exit(1);
  }

  const oldProducts = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  const oldProductMap = {};
  for (const p of oldProducts) {
    oldProductMap[p.sku] = p;
  }

  // Find products that have no images or empty images array
  const productsMissingImages = await Product.find({
    $or: [
      { images: { $size: 0 } },
      { images: { $exists: false } }
    ]
  });

  console.log(`Found ${productsMissingImages.length} products in DB that are missing images.`);

  if (productsMissingImages.length === 0) {
    console.log("No missing images found! Exiting.");
    process.exit(0);
  }

  const outDir = path.join(__dirname, '..', 'all-images');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  let fixedCount = 0;

  for (let i = 0; i < productsMissingImages.length; i++) {
    const p = productsMissingImages[i];
    const oldData = oldProductMap[p.sku];

    if (oldData && oldData.imgUrl) {
      try {
        console.log(`[${i+1}/${productsMissingImages.length}] Downloading image for existing SKU ${p.sku}...`);
        const imgRes = await axios.get(oldData.imgUrl, { responseType: 'arraybuffer', timeout: 15000 });
        const ext = path.extname(new URL(oldData.imgUrl).pathname) || '.jpg';
        const filename = `${p.sku}${ext}`;
        
        fs.writeFileSync(path.join(outDir, filename), imgRes.data);

        // Update DB
        p.images = [filename];
        await p.save();
        fixedCount++;
      } catch (e) {
        console.error(`Failed to download image for ${p.sku}: ${e.message}`);
      }
    } else {
      console.log(`No image URL found in old site data for SKU ${p.sku}`);
    }
  }

  console.log(`Successfully fixed images for ${fixedCount} products.`);
  process.exit(0);
}

fixImages().catch(console.error);
