const axios = require('axios');
require('dotenv').config();

const listOptions = async () => {
  try {
    // Try api.sendcloud.sc instead of panel.sendcloud.sc
    const response = await axios.get('https://api.sendcloud.sc/v3/shipping-options', {
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

listOptions();
