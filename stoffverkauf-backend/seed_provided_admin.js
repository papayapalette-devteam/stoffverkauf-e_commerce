const mongoose = require('mongoose');
const User = require('./Modals/RegisterUser/register_user');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.URL || 'mongodb://localhost:27017/stoffverkauf')
  .then(async () => {
    const email = 'info@stoffverkauf-weber.de';
    const password = 'Admin@123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await User.findOneAndUpdate(
      { email },
      { 
        firstName: 'Weber', 
        lastName: 'Admin', 
        email, 
        password: hashedPassword, 
        role: 'admin',
        agreed: true
      },
      { upsert: true, new: true }
    );
    
    console.log('Admin account created/updated with provided credentials.');
    process.exit(0);
  });
