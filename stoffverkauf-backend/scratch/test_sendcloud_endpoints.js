const axios = require('axios');
require('dotenv').config();

const testEndpoints = async () => {
  const endpoints = [
    'https://panel.sendcloud.sc/api/v3/shipping-options',
    'https://panel.sendcloud.sc/api/v3/shipping_options',
    'https://panel.sendcloud.sc/api/v3/shipping-methods',
    'https://panel.sendcloud.sc/api/v3/shipping_methods/1',
  ];

  for (const url of endpoints) {
    try {
      console.log(`Testing ${url}...`);
      const response = await axios.get(url, {
        auth: {
          username: process.env.SENDCLOUD_PUBLIC,
          password: process.env.SENDCLOUD_SECRET
        }
      });
      console.log(`Success: ${url}`);
      console.log(JSON.stringify(response.data, null, 2).slice(0, 500));
      break;
    } catch (err) {
      console.log(`Failed: ${url} - ${err.response?.status} ${err.response?.statusText}`);
    }
  }
};

testEndpoints();
