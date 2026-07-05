require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const cheerio = require('cheerio');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');
const connectDb = require('./connectdb');
const Product = require('./Modals/AddProducts/add_products');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

async function fixMissing() {
  await connectDb();

  const dataFile = path.join(__dirname, '..', 'products_data.json');
  const allData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  const skuToUrl = {};
  for (const p of allData) {
    skuToUrl[p.sku] = p.originalUrl;
  }

  const missingProds = await Product.find({ images: { $size: 0 } });
  console.log(`Found ${missingProds.length} products missing images.`);

  let successCount = 0;
  for (let i = 0; i < missingProds.length; i++) {
    const p = missingProds[i];
    const origUrl = skuToUrl[p.sku];
    if (!origUrl) {
      console.log(`[${i+1}/${missingProds.length}] No original URL for SKU ${p.sku}. Skipping.`);
      continue;
    }

    try {
      console.log(`[${i+1}/${missingProds.length}] Fetching HTML for ${p.sku}...`);
      const htmlRes = await axios.get(origUrl, { timeout: 15000 });
      const $ = cheerio.load(htmlRes.data);
      let imgUrl = $('.cloud-zoom img').attr('src') || $('.product-info img').attr('src') || $('.field-name-field-image img').attr('src');
      
      if (!imgUrl) {
        console.log(`  -> No image found in HTML for ${p.sku}`);
        continue;
      }

      console.log(`  -> Found image URL: ${imgUrl}. Downloading...`);
      const imgRes = await axios.get(imgUrl, { responseType: 'arraybuffer', timeout: 15000 });
      
      const tmpPath = path.join(__dirname, '..', 'all-images', `${p.sku}.jpg`);
      fs.writeFileSync(tmpPath, imgRes.data);

      console.log(`  -> Uploading to Cloudinary...`);
      const result = await cloudinary.uploader.upload(tmpPath, {
        folder: 'stoffverkauf_products',
        public_id: p.sku,
        use_filename: true,
        unique_filename: false,
        overwrite: true
      });

      p.images = [result.secure_url];
      await p.save();
      
      console.log(`✅ Fixed SKU ${p.sku}: ${result.secure_url}`);
      successCount++;
    } catch (err) {
      console.error(`❌ Error fixing SKU ${p.sku}:`, err.message);
    }
  }

  console.log(`\nProcess completed. Fixed ${successCount} products.`);
  process.exit(0);
}

fixMissing().catch(console.error);
