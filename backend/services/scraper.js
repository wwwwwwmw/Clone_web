const puppeteer = require('puppeteer');

/**
 * Scrapes a website and extracts clean HTML and CSS
 * @param {string} url - The URL to scrape
 * @returns {Promise<{html: string, css: string}>}
 */
async function scrapeWebsite(url) {
  let browser = null;
  
  try {
    // Launch Puppeteer
    console.log('Launching browser...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    
    // Set viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    console.log(`Navigating to ${url}...`);
    
    // Navigate to URL with timeout
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait a bit for any dynamic content
    await page.waitForTimeout(2000);

    // Extract HTML and CSS
    const extractedData = await page.evaluate(() => {
      // Get the body HTML
      const bodyHTML = document.body.innerHTML;

      // Extract all inline styles and stylesheets
      let cssContent = '';
      
      // Get all style tags
      const styleTags = document.querySelectorAll('style');
      styleTags.forEach(tag => {
        cssContent += tag.textContent + '\n';
      });

      // Get external stylesheets (inline them)
      const linkTags = document.querySelectorAll('link[rel="stylesheet"]');
      linkTags.forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
          cssContent += `/* External: ${href} */\n`;
        }
      });

      return {
        html: bodyHTML,
        css: cssContent
      };
    });

    // Clean the HTML
    let cleanedHTML = cleanHTML(extractedData.html);
    let cleanedCSS = extractedData.css;

    console.log('Scraping completed successfully');

    return {
      html: cleanedHTML,
      css: cleanedCSS
    };

  } catch (error) {
    console.error('Scraping error:', error);
    throw new Error(`Failed to scrape website: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
      console.log('Browser closed');
    }
  }
}

/**
 * Cleans HTML by removing unwanted elements
 * @param {string} html - Raw HTML string
 * @returns {string} - Cleaned HTML
 */
function cleanHTML(html) {
  // Remove script tags
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove iframe tags
  html = html.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  
  // Remove noscript tags
  html = html.replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '');
  
  // Remove common analytics/tracking elements
  const trackingPatterns = [
    /<!--.*?Google Analytics.*?-->/gi,
    /<!--.*?gtag.*?-->/gi,
    /data-gtm-[^=]*="[^"]*"/gi,
    /ga\([^)]*\)/gi
  ];
  
  trackingPatterns.forEach(pattern => {
    html = html.replace(pattern, '');
  });

  // Remove excessive whitespace
  html = html.replace(/\s+/g, ' ');
  html = html.replace(/>\s+</g, '><');
  
  return html.trim();
}

module.exports = {
  scrapeWebsite
};
