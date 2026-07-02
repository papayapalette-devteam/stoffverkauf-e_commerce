const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

async function scrapeSample() {
  try {
    const baseUrl = 'https://stoffverkauf-weber.de';
    console.log('Fetching homepage...');
    const homeRes = await axios.get(baseUrl);
    const $ = cheerio.load(homeRes.data);
    
    // Find all links
    const links = [];
    $('a').each((i, el) => {
      const href = $(el).attr('href');
      if (href && (href.startsWith('/') || href.startsWith(baseUrl)) && !href.includes('.css') && !href.includes('.js')) {
        links.push(href.startsWith('/') ? baseUrl + href : href);
      }
    });

    console.log(`Found ${links.length} links on homepage. Let's look for a product...`);

    // Let's just fetch a few links to find a product page
    let productUrl = null;
    let product$ = null;

    // A category page might have product links
    for (const link of links) {
       if (link === baseUrl || link === baseUrl + '/') continue;
       try {
           const pageRes = await axios.get(link);
           const p$ = cheerio.load(pageRes.data);
           // Drupal Commerce typically uses .commerce-product-sku or .field-name-field-product
           if (p$('.commerce-product-sku').length > 0 || p$('[itemprop="sku"]').length > 0 || p$('.sku').length > 0 || p$('.field-name-commerce-price').length > 0) {
               productUrl = link;
               product$ = p$;
               break;
           } else {
               // Maybe it's a category page, let's look for product links here
               const catLinks = [];
               p$('a').each((i, el) => {
                 const href = p$(el).attr('href');
                 if (href && (href.startsWith('/') || href.startsWith(baseUrl))) {
                   catLinks.push(href.startsWith('/') ? baseUrl + href : href);
                 }
               });
               for (const cLink of catLinks) {
                   if (cLink.includes('/cart') || cLink.includes('/checkout')) continue;
                   try {
                       const cpRes = await axios.get(cLink);
                       const cp$ = cheerio.load(cpRes.data);
                       if (cp$('.commerce-product-sku').length > 0 || cp$('[itemprop="sku"]').length > 0 || cp$('.sku').length > 0 || cp$('.field-name-commerce-price').length > 0) {
                           productUrl = cLink;
                           product$ = cp$;
                           break;
                       }
                   } catch(e) {}
               }
           }
           if (productUrl) break;
       } catch (err) {
           continue;
       }
    }

    if (!productUrl || !product$) {
      console.log('Could not find a product page automatically.');
      return;
    }

    console.log('Found product page:', productUrl);
    
    // Extract SKU
    let sku = product$('.commerce-product-sku').text().trim() || product$('[itemprop="sku"]').text().trim() || product$('.sku').text().trim();
    if (!sku) {
        // Try to find anything looking like an SKU
        sku = 'Sample_SKU_' + Date.now();
    }
    // Clean SKU for filename
    sku = sku.replace(/[^a-zA-Z0-9_-]/g, '_');
    if (sku.startsWith('SKU_')) sku = sku.replace('SKU_', '');
    if (sku.startsWith('Art_Nr_')) sku = sku.replace('Art_Nr_', '');
    
    console.log('Extracted SKU:', sku);

    // Extract image
    // Find the largest image or the main product image
    let imgUrl = null;
    const imgEl = product$('.field-name-field-image img, .product-image img, .main-image img').first();
    if (imgEl.length > 0) {
        imgUrl = imgEl.attr('src');
    } else {
        // Just grab the first large image
        imgUrl = product$('img').filter((i, el) => {
            const src = product$(el).attr('src');
            return src && src.includes('/files/') && !src.includes('logo');
        }).first().attr('src');
    }

    if (!imgUrl) {
        console.log('Could not find product image.');
        return;
    }

    if (imgUrl.startsWith('/')) imgUrl = baseUrl + imgUrl;
    // Sometimes Drupal images have styles in URL (e.g., /styles/medium/public/), we can try to get the original by removing the style part
    imgUrl = imgUrl.replace(/\/styles\/[^\/]+\/public\//, '/');

    console.log('Found Image URL:', imgUrl);

    // Download image
    const imgRes = await axios.get(imgUrl, { responseType: 'arraybuffer' });
    const ext = path.extname(new URL(imgUrl).pathname) || '.jpg';
    const filename = `${sku}${ext}`;
    const filepath = path.join(__dirname, '..', filename);
    
    fs.writeFileSync(filepath, imgRes.data);
    console.log(`Downloaded image successfully to ${filepath}`);

  } catch (err) {
    console.error('Error:', err.message);
  }
}

scrapeSample();
