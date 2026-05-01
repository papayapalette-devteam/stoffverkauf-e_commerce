const axios = require('axios');
require('dotenv').config();

const getOptions = async () => {
  try {
    const response = await axios.post('https://panel.sendcloud.sc/api/v3/shipping-options', {
      to_country: 'DE',
      from_country: 'DE',
      weight: {
        value: 1.0,
        unit: 'kg'
      }
    }, {
      auth: {
        username: process.env.SENDCLOUD_PUBLIC,
        password: process.env.SENDCLOUD_SECRET
      }
    });
    console.log(JSON.stringify(response.data.data.slice(0, 5), null, 2));
  } catch (err) {
    console.error(JSON.stringify(err.response?.data, null, 2));
  }
};

getOptions();
