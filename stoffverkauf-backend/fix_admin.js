const mongoose = require('mongoose');
const User = require('./Modals/RegisterUser/register_user');
const dotenv = require('dotenv');

dotenv.config();

const bcrypt = require('bcryptjs');

mongoose.connect(process.env.URL || 'mongodb://localhost:27017/stoffverkauf')
  .then(async () => {
    console.log('Connected to DB');
    const email = 'test@example.com';
    const user = await User.findOne({ email });
    if (user) {
      user.role = 'admin';
      user.password = await bcrypt.hash('password123', 10);
      await user.save();
      console.log(`Updated ${email} to admin and reset password.`);
    } else {
      console.log(`User ${email} not found.`);
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
