const axios = require('axios');
require('dotenv').config();

const checkCompat = async () => {
  try {
    const response = await axios.get('https://panel.sendcloud.sc/api/v3/compat/shipping-options?shipping_method_id=341', {
      auth: {
        username: process.env.SENDCLOUD_PUBLIC,
        password: process.env.SENDCLOUD_SECRET
      }
    });
    console.log(JSON.stringify(response.data, null, 2));
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
};

checkCompat();
