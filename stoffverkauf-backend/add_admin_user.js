const mongoose = require('mongoose');
const User = require('./Modals/RegisterUser/register_user');
const dotenv = require('dotenv');

dotenv.config();

const adminData = {
  email: "info@stoffverkauf-weber.de",
  firstName: "Weber",
  lastName: "Admin",
  password: "$2b$10$E7fjwskpO0NhvsJ/KG.2q.dEYvfTGFmdujskp7Jlm0JTDldigUya6",
  role: "admin",
  agreed: true
};

mongoose.connect(process.env.URL)
  .then(async () => {
    console.log('Connected to DB');
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: adminData.email });
    
    if (existingUser) {
      console.log('User already exists, updating password and role...');
      existingUser.firstName = adminData.firstName;
      existingUser.lastName = adminData.lastName;
      existingUser.password = adminData.password;
      existingUser.role = adminData.role;
      existingUser.agreed = adminData.agreed;
      await existingUser.save();
      console.log('User updated successfully');
    } else {
      const newUser = new User(adminData);
      await newUser.save();
      console.log('Admin user created successfully');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
