const mongoose = require('mongoose');
const connectDb = require('./connectdb');
const Product = require('./Modals/AddProducts/add_products');
const Category = require('./Modals/AddCategory/category');

async function syncCategories() {
  await connectDb();

  // Get all unique categories from products
  const uniqueCategories = await Product.distinct("category");
  console.log(`Found ${uniqueCategories.length} unique categories in products:`);
  console.log(uniqueCategories);

  let addedCount = 0;

  for (const catName of uniqueCategories) {
    if (!catName || catName.trim() === '') continue;
    
    // Create slug
    const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check if category already exists
    const existing = await Category.findOne({ 
      $or: [
        { name: new RegExp(`^${catName}$`, 'i') },
        { slug: slug }
      ]
    });

    if (!existing) {
      console.log(`Adding new category: ${catName}`);
      await Category.create({
        name: catName,
        slug: slug,
        description: `Imported category ${catName}`,
        enabled: true
      });
      addedCount++;
    }
  }

  console.log(`\nCategory sync complete! Added ${addedCount} new categories.`);
  process.exit(0);
}

syncCategories().catch(console.error);
