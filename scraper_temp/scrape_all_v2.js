const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const baseUrl = 'https://stoffverkauf-weber.de';
const outDir = path.join(__dirname, '..', 'all-images');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function scrapeAllV2() {
  console.log('Starting targeted crawler for all products...');
  
  // First we need to find how many pages there are, but we can just loop until a page has no products
  let pageNum = 0;
  let hasProducts = true;
  let totalDownloaded = 0;

  while (hasProducts) {
    const listUrl = `${baseUrl}/products?page=${pageNum}`;
    console.log(`\nFetching page: ${listUrl}`);
    try {
      const listRes = await axios.get(listUrl, { timeout: 15000 });
      const $list = cheerio.load(listRes.data);
      
      const productLinks = [];
      $list('.view-collection-products a, .node-product a, h2 a').each((i, el) => {
        const href = $list(el).attr('href');
        if (href && !href.includes('.css') && !href.includes('?')) {
           const fullUrl = href.startsWith('/') ? baseUrl + href : href;
           if (!productLinks.includes(fullUrl)) {
               productLinks.push(fullUrl);
           }
        }
      });

      if (productLinks.length === 0) {
        console.log(`No more products found on page ${pageNum}. Stopping.`);
        hasProducts = false;
        break;
      }

      console.log(`Found ${productLinks.length} products on page ${pageNum}. Processing...`);

      for (const pUrl of productLinks) {
        try {
          const pRes = await axios.get(pUrl, { timeout: 15000 });
          const $p = cheerio.load(pRes.data);

          const skuEl = $p('.commerce-product-sku').first();
          const fallbackSkuEl = $p('[itemprop="sku"]').first();
          let sku = skuEl.text().trim() || fallbackSkuEl.text().trim();

          if (sku) {
            // Remove the word 'Artikelnummer', 'SKU', 'Art_Nr' completely
            sku = sku.replace(/artikelnummer|sku|art\.?_?nr\.?/ig, '');
            // Remove all non-alphanumeric characters (removes spaces, colons, underscores)
            sku = sku.replace(/[^a-zA-Z0-9-]/g, '').trim();

            // Find image
            let imgUrl = null;
            const imgEl = $p('.field-name-field-image img, .product-image img, .main-image img').first();
            if (imgEl.length > 0) {
              imgUrl = imgEl.attr('src');
            } else {
              imgUrl = $p('img').filter((i, el) => {
                const src = $p(el).attr('src');
                return src && src.includes('/files/') && !src.includes('logo');
              }).first().attr('src');
            }

            if (imgUrl) {
              if (imgUrl.startsWith('/')) imgUrl = baseUrl + imgUrl;
              imgUrl = imgUrl.replace(/\/styles\/[^\/]+\/public\//, '/'); // original size
              
              const ext = path.extname(new URL(imgUrl).pathname) || '.jpg';
              const filename = `${sku}${ext}`;
              const filepath = path.join(outDir, filename);

              // Skip if already downloaded
              if (fs.existsSync(filepath)) {
                 console.log(`⏩ Skipped (already exists): ${filename}`);
                 continue;
              }
              
              const imgRes = await axios.get(imgUrl, { responseType: 'arraybuffer', timeout: 15000 });
              fs.writeFileSync(filepath, imgRes.data);
              totalDownloaded++;
              console.log(`✅ Downloaded: ${filename}`);
            }
          }
        } catch (pErr) {
           console.error(`⚠️ Error fetching product ${pUrl}: ${pErr.message}`);
        }
      }
      
      pageNum++;
    } catch (err) {
      if (err.response && err.response.status === 404) {
         console.log(`Page ${pageNum} not found. Reached end of catalog.`);
         hasProducts = false;
      } else {
         console.error(`Error fetching page ${pageNum}: ${err.message}`);
         // Wait a bit and retry or continue
         await new Promise(r => setTimeout(r, 2000));
         pageNum++; // just skip page on error
      }
    }
  }

  console.log(`\n🎉 Crawler V2 finished! Total new images downloaded: ${totalDownloaded}`);
}

scrapeAllV2();
