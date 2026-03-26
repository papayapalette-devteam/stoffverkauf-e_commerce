const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./Modals/RegisterUser/register_user');
const Category = require('./Modals/AddCategory/category');
const Product = require('./Modals/AddProducts/add_products');
const Integration = require('./Modals/Integration/integration');

const seed = async () => {
  try {
    await mongoose.connect(process.env.URL);
    console.log("Connected to MongoDB for seeding...");

    // 1. Create Admin User
    const adminEmail = "admin@example.com";
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      const admin = new User({
        firstName: "Admin",
        lastName: "User",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        agreed: true
      });
      await admin.save();
      console.log("Admin user created: admin@example.com / admin123");
    }

    // 2. Create Categories
    const categories = ["Cotton", "Linen", "Silk", "Wool"];
    for (const name of categories) {
      let cat = await Category.findOne({ name });
      if (!cat) {
        cat = new Category({ name, description: `${name} fabrics`, slug: name.toLowerCase() });
        await cat.save();
      }
    }
    console.log("Categories seeded");

    // 3. Create Products
    const products = [
      {
        name: "Premium Blue Cotton",
        price: 15.90,
        salePrice: 12.90,
        category: "Cotton",
        badge: "new",
        width: "140cm",
        composition: "100% Cotton",
        description: "High quality premium blue cotton fabric for shirts.",
        images: ["https://images.unsplash.com/photo-1584184854125-5162181799b8?q=80&w=600"],
        stockQty: "100",
        rating: 4.5,
        reviews: 10,
        inStock: true
      },
      {
        name: "Eco-Friendly Linen",
        price: 24.50,
        salePrice: 22.00,
        category: "Linen",
        badge: "sale",
        width: "150cm",
        composition: "100% Linen",
        description: "Breathable eco-friendly linen fabric.",
        images: ["https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600"],
        stockQty: "50",
        rating: 4.8,
        reviews: 5,
        inStock: true
      }
    ];

    for (const p of products) {
      const existingProduct = await Product.findOne({ name: p.name });
      if (!existingProduct) {
        const product = new Product(p);
        await product.save();
      }
    }
    console.log("Products seeded");

    // 4. Create Integration
    const integrationData = [
      { 
        key: 'paypal', 
        name: 'PayPal', 
        data: { 
          paypalUsername: 'support_api1.1xinternet.de', 
          paypalPassword: 'M6BG6FZR9CMHREV4', 
          paypalSignature: 'AiPC9BjkCyDFQXbSkoZcgqH3hpacAaw2QFtP6kEaB3LwDEfGSBmBap0z',
          paypalMode: 'sandbox' 
        }, 
        isActive: true 
      },
      { key: 'stripe', name: 'Stripe', data: { publishableKey: 'pk_test', secretKey: 'sk_test' }, isActive: false }
    ];

    for (const i of integrationData) {
      const existing = await Integration.findOne({ key: i.key });
      if (!existing) {
        const integration = new Integration(i);
        await integration.save();
      }
    }
    console.log("Integrations seeded");

    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
};

seed();
