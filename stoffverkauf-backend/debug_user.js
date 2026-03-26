const mongoose = require('mongoose');
const User = require('./Modals/RegisterUser/register_user');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.URL || 'mongodb://localhost:27017/stoffverkauf')
  .then(async () => {
    const email = 'test@example.com';
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
    } else {
      console.log('User found:', user.email, 'Role:', user.role);
      const isMatch = await bcrypt.compare('password123', user.password);
      console.log('Password "password123" matches?', isMatch);
    }
    process.exit(0);
  });
