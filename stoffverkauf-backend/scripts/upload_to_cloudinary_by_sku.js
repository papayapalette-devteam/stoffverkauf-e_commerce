require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const Product = require('../Modals/AddProducts/add_products'); // adjust path if needed

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const IMAGES_DIR = path.join(__dirname, '../../all-images');

async function uploadImages() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.URL);
    console.log('Connected to DB!');

    const files = fs.readdirSync(IMAGES_DIR);
    console.log(`Found ${files.length} images to process.`);

    let successCount = 0;
    let notFoundCount = 0;
    let errorCount = 0;

    // Process sequentially or with small concurrency to avoid rate limits
    for (const file of files) {
      if (!file.match(/\.(jpg|jpeg|png)$/i)) continue;
      
      const sku = path.parse(file).name; // Filename without extension
      const filePath = path.join(IMAGES_DIR, file);

      try {
        // Find product by SKU
        const product = await Product.findOne({ sku: sku });
        
        if (!product) {
          console.log(`⚠️ SKU ${sku} not found in database. Skipping.`);
          notFoundCount++;
          continue;
        }

        // Check if image already uploaded? 
        // Optional: If product already has images, you can choose to skip or append.
        // We will append it if it's not already in the array, or just set it.
        // For now, let's just upload and set it as the first image or add to array.
        
        console.log(`⏳ Uploading image for SKU ${sku}...`);
        const result = await cloudinary.uploader.upload(filePath, {
          folder: 'stoffverkauf_products',
          public_id: sku,
          use_filename: true,
          unique_filename: false,
          overwrite: true
        });

        const imageUrl = result.secure_url;
        
        // Filter out local filenames saved by sync scripts
        product.images = product.images ? product.images.filter(img => img.startsWith('http')) : [];
        
        if (!product.images.includes(imageUrl)) {
             product.images.unshift(imageUrl); 
        }
        
        await product.save();
        console.log(`✅ Uploaded and linked: ${sku} -> ${imageUrl}`);
        successCount++;

      } catch (err) {
        console.error(`❌ Error processing SKU ${sku}:`, err.message);
        errorCount++;
      }
    }

    console.log('\n🎉 Finished processing all images!');
    console.log(`Success: ${successCount}`);
    console.log(`SKUs not found in DB: ${notFoundCount}`);
    console.log(`Errors: ${errorCount}`);
    
    process.exit(0);

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

uploadImages();
