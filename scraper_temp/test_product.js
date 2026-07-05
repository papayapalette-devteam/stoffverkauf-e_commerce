const axios = require('axios');
const cheerio = require('cheerio');

axios.get('https://stoffverkauf-weber.de/stoffe/designer-jersey-kaufen').then(res => {
  const $ = cheerio.load(res.data);
  console.log('Title (page-title):', $('#page-title').text().trim());
  console.log('Title (title):', $('title').text().trim());
}).catch(console.error);
