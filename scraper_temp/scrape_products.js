const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const baseUrl = 'https://stoffverkauf-weber.de';
const dataFile = path.join(__dirname, '..', 'products_data.json');

let products = [];
if (fs.existsSync(dataFile)) {
  try {
    products = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  } catch(e) {}
}

const downloadedSkus = new Set(products.map(p => p.sku));

async function scrapeAll() {
  console.log('Starting fast SKU crawler...');
  let productLinks = new Set();
  
  // 1. Get all product links from all 90 pages
  console.log('Fetching all product links from pagination...');
  for (let i = 0; i <= 89; i++) {
    try {
      const url = `${baseUrl}/products?page=${i}`;
      console.log(`Fetching page ${i}...`);
      const res = await axios.get(url, { timeout: 10000 });
      const $ = cheerio.load(res.data);
      $('.views-row').each((idx, el) => {
        const href = $(el).find('h2 a').attr('href');
        if (href) {
          productLinks.add(href.startsWith('/') ? baseUrl + href : href);
        }
      });
    } catch (err) {
      console.error(`Error on page ${i}: ${err.message}`);
    }
  }

  const linksArray = Array.from(productLinks);
  console.log(`Found ${linksArray.length} product links. Starting extraction without image download...`);

  // 2. Fetch each product link
  for (let i = 0; i < linksArray.length; i++) {
    const url = linksArray[i];
    try {
      if (i % 20 === 0) console.log(`[${linksArray.length - i} left] Visiting: ${url}`);
      const res = await axios.get(url, { timeout: 10000 });
      const $ = cheerio.load(res.data);

      const skuEl = $('.commerce-product-sku').first();
      const fallbackSkuEl = $('[itemprop="sku"]').first();
      let rawSku = skuEl.text().trim() || fallbackSkuEl.text().trim();
      let sku = rawSku.replace('SKU:', '').replace('Artikelnummer:', '').trim();

      if (sku) {
        sku = sku.replace(/[^a-zA-Z0-9_-]/g, '_');
        if (sku.startsWith('SKU_')) sku = sku.replace('SKU_', '');
        if (sku.startsWith('Art_Nr_')) sku = sku.replace('Art_Nr_', '');

        if (!downloadedSkus.has(sku)) {
          let title = $('title').text().split('|')[0].trim();
          let price = $('.commerce-product-price').first().text().replace(/\s+/g, ' ').trim() || $('.commerce-price-savings-formatter-price').first().text().replace(/\s+/g, ' ').trim() || $('.field-name-commerce-price').first().text().replace(/\s+/g, ' ').trim();
          let description = $('.field-name-body').text().trim() || $('[itemprop="description"]').text().trim();
          
          let imgUrl = null;
          const imgEl = $('.field-name-field-image img, .product-image img, .main-image img').first();
          if (imgEl.length > 0) {
            imgUrl = imgEl.attr('src');
          } else {
            imgUrl = $('img').filter((i, el) => {
              const src = $(el).attr('src');
              return src && src.includes('/files/') && !src.includes('logo');
            }).first().attr('src');
          }
          
          if (imgUrl) {
            if (imgUrl.startsWith('/')) imgUrl = baseUrl + imgUrl;
            imgUrl = imgUrl.replace(/\/styles\/[^\/]+\/public\//, '/'); 
          }
          
          const productData = {
            sku: sku,
            title: title,
            price: price,
            description: description,
            imgUrl: imgUrl, // just save URL, do not download
            originalUrl: url
          };
          products.push(productData);
          downloadedSkus.add(sku);
          
          fs.writeFileSync(dataFile, JSON.stringify(products, null, 2));
          console.log(`✅ Saved product data: ${sku}`);
        }
      }
    } catch (err) {
      console.error(`⚠️ Error visiting ${url}: ${err.message}`);
    }
  }
  
  console.log(`\n🎉 Crawler finished! Total products scraped: ${products.length}`);
}

scrapeAll();
