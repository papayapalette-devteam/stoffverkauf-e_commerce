const mongoose = require('mongoose');
const connectDb = require('./connectdb');
const Product = require('./Modals/AddProducts/add_products');

async function check() {
  await connectDb();
  
  // Find products with no images
  const noImages = await Product.find({ images: { $size: 0 } }, 'sku category');
  console.log(`Products with NO images (size 0): ${noImages.length}`);
  
  // Find products where images array doesn't start with http
  const invalidImages = await Product.find({ 
    images: { $elemMatch: { $not: /^http/ } } 
  }, 'sku images category');
  console.log(`Products with non-HTTP images: ${invalidImages.length}`);
  
  if (noImages.length > 0) {
    console.log('Sample no images:', noImages.slice(0, 5));
  }
  
  if (invalidImages.length > 0) {
    console.log('Sample invalid images:', invalidImages.slice(0, 5));
  }

  process.exit(0);
}

check().catch(console.error);
