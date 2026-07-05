const axios = require('axios');
const cheerio = require('cheerio');

async function check() {
  const p0 = await axios.get('https://stoffverkauf-weber.de/products');
  let $ = cheerio.load(p0.data);
  const itemsPerPage = $('.views-row').length;
  console.log('Items per page:', itemsPerPage);

  const pLast = await axios.get('https://stoffverkauf-weber.de/products?page=89');
  $ = cheerio.load(pLast.data);
  const itemsOnLastPage = $('.views-row').length;
  console.log('Items on last page:', itemsOnLastPage);

  const total = (89 * itemsPerPage) + itemsOnLastPage;
  console.log('Estimated Total Products:', total);
}
check().catch(console.error);
