const axios = require('axios');
const cheerio = require('cheerio');

async function check() {
  const p75 = await axios.get('https://stoffverkauf-weber.de/products?page=75');
  const p76 = await axios.get('https://stoffverkauf-weber.de/products?page=76');
  
  let $ = cheerio.load(p75.data);
  console.log('Page 75 items:', $('.view-collection-products a, .node-product a').length);
  
  $ = cheerio.load(p76.data);
  console.log('Page 76 items:', $('.view-collection-products a, .node-product a').length);
}
check();
