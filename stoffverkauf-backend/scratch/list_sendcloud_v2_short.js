const axios = require('axios');
require('dotenv').config();

const listOptions = async () => {
  try {
    const response = await axios.get('https://panel.sendcloud.sc/api/v2/shipping_methods', {
      auth: {
        username: process.env.SENDCLOUD_PUBLIC,
        password: process.env.SENDCLOUD_SECRET
      }
    });
    const methods = response.data.shipping_methods;
    console.log(JSON.stringify(methods.slice(0, 10), null, 2));
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
};

listOptions();
