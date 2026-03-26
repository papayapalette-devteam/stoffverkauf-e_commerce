const axios = require('axios');

async function testLogin() {
  try {
    const res = await axios.post('http://localhost:5000/api/user/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('Login successful:', res.data.success);
    console.log('User Role:', res.data.user.role);
  } catch (err) {
    console.error('Login failed:', err.response?.data || err.message);
  }
}

testLogin();
