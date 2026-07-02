const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const baseUrl = 'https://stoffverkauf-weber.de';
const outDir = path.join(__dirname, '..', 'all-images');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const visited = new Set();
const queue = [baseUrl];
const downloadedSkus = new Set();

async function scrapeAll() {
  console.log('Starting crawler...');
  while (queue.length > 0) {
    const url = queue.shift();
    if (visited.has(url)) continue;
    visited.add(url);

    try {
      console.log(`[${queue.length} left] Visiting: ${url}`);
      const res = await axios.get(url, { timeout: 10000 });
      const $ = cheerio.load(res.data);

      // Check if it's a product page
      const skuEl = $('.commerce-product-sku').first();
      const fallbackSkuEl = $('[itemprop="sku"]').first();
      let sku = skuEl.text().trim() || fallbackSkuEl.text().trim();

      if (sku) {
        sku = sku.replace(/[^a-zA-Z0-9_-]/g, '_');
        if (sku.startsWith('SKU_')) sku = sku.replace('SKU_', '');
        if (sku.startsWith('Art_Nr_')) sku = sku.replace('Art_Nr_', '');

        if (!downloadedSkus.has(sku)) {
          // Find image
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
            imgUrl = imgUrl.replace(/\/styles\/[^\/]+\/public\//, '/'); // original size
            
            try {
              const imgRes = await axios.get(imgUrl, { responseType: 'arraybuffer', timeout: 15000 });
              const ext = path.extname(new URL(imgUrl).pathname) || '.jpg';
              const filename = `${sku}${ext}`;
              const filepath = path.join(outDir, filename);
              
              fs.writeFileSync(filepath, imgRes.data);
              downloadedSkus.add(sku);
              console.log(`✅ Downloaded: ${filename}`);
            } catch (imgErr) {
              console.error(`❌ Failed to download image for SKU ${sku}: ${imgErr.message}`);
            }
          }
        }
      }

      // Add new links to queue
      $('a').each((i, el) => {
        let href = $(el).attr('href');
        if (!href) return;
        
        if (href.startsWith('/')) {
            href = baseUrl + href;
        }

        if (href.startsWith(baseUrl)) {
          // Exclude certain paths
          if (
              href.includes('/cart') || 
              href.includes('/checkout') || 
              href.includes('/user') || 
              href.includes('?') || // avoid pagination/query params if possible, or limit them
              href.match(/\.(png|jpg|jpeg|gif|css|js|pdf|zip)$/i)
          ) {
              return;
          }
          // Remove hash
          href = href.split('#')[0];
          
          if (!visited.has(href) && !queue.includes(href)) {
              queue.push(href);
          }
        }
      });
    } catch (err) {
      console.error(`⚠️ Error visiting ${url}: ${err.message}`);
    }
  }
  
  console.log(`\n🎉 Crawler finished! Total images downloaded: ${downloadedSkus.size}`);
}

scrapeAll();
