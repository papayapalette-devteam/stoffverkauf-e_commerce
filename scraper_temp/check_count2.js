const axios = require('axios');
const cheerio = require('cheerio');

async function check() {
  const pLast = await axios.get('https://stoffverkauf-weber.de/products?page=89');
  const $ = cheerio.load(pLast.data);
  let items = $('.views-row');
  console.log('Total .views-row on page 89:', items.length);
  items.each((i, el) => {
    const title = $(el).find('h2').text().trim();
    if (title) {
       console.log(i, title);
    }
  });
}
check().catch(console.error);
