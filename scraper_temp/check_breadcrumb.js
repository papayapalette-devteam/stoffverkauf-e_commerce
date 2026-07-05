const axios = require('axios');
const cheerio = require('cheerio');

axios.get('https://stoffverkauf-weber.de/stoffe/ital-schurwolle-mischung-kaufen-0')
  .then(res => {
    const $ = cheerio.load(res.data);
    console.log('Breadcrumb HTML:\n', $('.breadcrumb').html());
  })
  .catch(console.error);
