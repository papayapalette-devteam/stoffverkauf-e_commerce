const axios = require('axios');
require('dotenv').config();

const listOptions = async () => {
  try {
    const response = await axios.get('https://panel.sendcloud.sc/api/v3/shipping-options?to_country=DE&from_country=DE', {
      auth: {
        username: process.env.SENDCLOUD_PUBLIC,
        password: process.env.SENDCLOUD_SECRET
      }
    });
    console.log(JSON.stringify(response.data.data.slice(0, 5), null, 2));
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
};

listOptions();
