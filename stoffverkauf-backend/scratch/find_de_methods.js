const axios = require('axios');
require('dotenv').config();

const findDE = async () => {
  try {
    const response = await axios.get('https://panel.sendcloud.sc/api/v2/shipping_methods', {
      auth: {
        username: process.env.SENDCLOUD_PUBLIC,
        password: process.env.SENDCLOUD_SECRET
      }
    });
    const methods = response.data.shipping_methods;
    const deMethods = methods.filter(m => m.countries.some(c => c.iso_2 === 'DE'));
    console.log(JSON.stringify(deMethods.map(m => ({ id: m.id, name: m.name, carrier: m.carrier })), null, 2));
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
};

findDE();
