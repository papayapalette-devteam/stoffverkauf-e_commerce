const mongoose=require('mongoose');
const seed = require('./seed_content');

require('dotenv').config()

const connect = async () => {
  try {
    await mongoose.connect(process.env.URL);
    console.log('database connect successfully');
    await seed();
    console.log('Seeding process finished');
  } catch (error) {
    console.error('Database connection error:', error);
  }
};

module.exports = connect;