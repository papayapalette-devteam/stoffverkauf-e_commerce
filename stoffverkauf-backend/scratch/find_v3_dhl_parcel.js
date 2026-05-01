const axios = require('axios');
require('dotenv').config();

const findDHLParcel = async () => {
  try {
    const response = await axios.post('https://panel.sendcloud.sc/api/v3/shipping-options', {
      to_country: 'DE',
      from_country: 'DE',
      weight: { value: 1.0, unit: 'kg' }
    }, {
      auth: {
        username: process.env.SENDCLOUD_PUBLIC,
        password: process.env.SENDCLOUD_SECRET
      }
    });
    const dhl = response.data.data.find(opt => opt.carrier.code === 'dhl_de' && opt.name.includes('Paket') && !opt.name.includes('Klein'));
    console.log(JSON.stringify(dhl, null, 2));
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
};

findDHLParcel();
