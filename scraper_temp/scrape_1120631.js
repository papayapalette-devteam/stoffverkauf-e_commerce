const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

async function scrapeSKU(targetSku) {
  try {
    const baseUrl = 'https://stoffverkauf-weber.de';
    const searchUrl = `${baseUrl}/products?search_api_views_fulltext=${targetSku}`;
    console.log(`Searching for SKU ${targetSku} at ${searchUrl}...`);
    
    const searchRes = await axios.get(searchUrl);
    const $ = cheerio.load(searchRes.data);
    
    // In Drupal Commerce Kickstart, search results are usually in a view, let's look for product links
    let productUrl = null;
    $('.view-collection-products a, .view-display-id-page a, .node-product a').each((i, el) => {
      const href = $(el).attr('href');
      if (href && !href.includes('.css') && !href.includes('.js') && !href.includes('search_api_views_fulltext')) {
          // If it looks like a product link (not pagination, not filters)
          if (!href.includes('?')) {
              productUrl = href.startsWith('/') ? baseUrl + href : href;
              return false; // break each loop
          }
      }
    });

    if (!productUrl) {
      // If we couldn't find it with specific classes, just find the first link inside the main content area
      $('#content a').each((i, el) => {
         const href = $(el).attr('href');
         if (href && href !== '#' && !href.includes('?') && !href.includes('.css')) {
            productUrl = href.startsWith('/') ? baseUrl + href : href;
            return false;
         }
      });
    }

    if (!productUrl) {
      console.log('Could not find product link in search results.');
      // Maybe the search directly redirected to the product page?
      if ($('body').hasClass('node-type-product') || $('.commerce-product-sku').length > 0) {
          productUrl = searchRes.request.res.responseUrl || searchUrl;
      } else {
          return;
      }
    }

    console.log('Found product page:', productUrl);
    
    let product$ = $;
    if (productUrl !== searchUrl && productUrl !== searchRes.request.res.responseUrl) {
        const pageRes = await axios.get(productUrl);
        product$ = cheerio.load(pageRes.data);
    }

    // Extract Image
    let imgUrl = null;
    const imgEl = product$('.field-name-field-image img, .product-image img, .main-image img').first();
    if (imgEl.length > 0) {
        imgUrl = imgEl.attr('src');
    } else {
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
    imgUrl = imgUrl.replace(/\/styles\/[^\/]+\/public\//, '/'); // Get original image

    console.log('Found Image URL:', imgUrl);

    // Download image
    const imgRes = await axios.get(imgUrl, { responseType: 'arraybuffer' });
    const ext = path.extname(new URL(imgUrl).pathname) || '.jpg';
    const filename = `${targetSku}${ext}`;
    const filepath = path.join(__dirname, '..', filename);
    
    fs.writeFileSync(filepath, imgRes.data);
    console.log(`Downloaded image successfully to ${filepath}`);

  } catch (err) {
    console.error('Error:', err.message);
  }
}

scrapeSKU('1120631');
