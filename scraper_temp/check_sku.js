const axios = require('axios');
const cheerio = require('cheerio');
axios.get('https://stoffverkauf-weber.de/products').then(res => {
  const $ = cheerio.load(res.data);
  console.log($('.views-row').eq(1).html());
}).catch(console.error);
