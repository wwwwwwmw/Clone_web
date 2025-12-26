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
      waitUntil: 'networkidle0',
      timeout: 45000
    });

    // Wait for dynamic content to load
    await page.waitForTimeout(5000);

    // Scroll to load lazy-loaded images
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            window.scrollTo(0, 0);
            resolve();
          }
        }, 100);
      });
    });

    await page.waitForTimeout(2000);

    // Extract HTML, CSS, and computed styles
    const extractedData = await page.evaluate(() => {
      // Get the full HTML including head
      const fullHTML = document.documentElement.outerHTML;

      // Extract all CSS from style tags
      let cssContent = '';
      
      // Get all style tags
      const styleTags = document.querySelectorAll('style');
      styleTags.forEach(tag => {
        cssContent += tag.textContent + '\n';
      });

      // Try to fetch external stylesheets content
      const linkTags = document.querySelectorAll('link[rel="stylesheet"]');
      linkTags.forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
          cssContent += `/* External stylesheet: ${href} */\n`;
        }
      });

      // Extract computed styles for better accuracy
      const allElements = document.querySelectorAll('body *');
      const computedStyles = [];
      const processedClasses = new Set();
      
      allElements.forEach((element, index) => {
        if (element.className && typeof element.className === 'string') {
          const classes = element.className.split(' ').filter(c => c.trim());
          classes.forEach(className => {
            if (!processedClasses.has(className) && className.trim()) {
              processedClasses.add(className);
              const computed = window.getComputedStyle(element);
              
              // Extract key visual properties
              const styles = {
                'background-color': computed.backgroundColor,
                'color': computed.color,
                'font-size': computed.fontSize,
                'font-weight': computed.fontWeight,
                'font-family': computed.fontFamily,
                'padding': computed.padding,
                'margin': computed.margin,
                'border': computed.border,
                'border-radius': computed.borderRadius,
                'display': computed.display,
                'width': computed.width !== 'auto' ? computed.width : null,
                'height': computed.height !== 'auto' ? computed.height : null,
                'background-image': computed.backgroundImage,
                'background-size': computed.backgroundSize,
                'background-position': computed.backgroundPosition,
                'box-shadow': computed.boxShadow,
                'text-align': computed.textAlign,
                'line-height': computed.lineHeight,
                'opacity': computed.opacity,
                'position': computed.position,
                'z-index': computed.zIndex,
                'overflow': computed.overflow,
              };

              // Build CSS rule
              let cssRule = `.${className} {\n`;
              Object.entries(styles).forEach(([prop, value]) => {
                if (value && value !== 'none' && value !== 'normal' && value !== 'rgba(0, 0, 0, 0)') {
                  cssRule += `  ${prop}: ${value};\n`;
                }
              });
              cssRule += '}\n\n';
              
              computedStyles.push(cssRule);
            }
          });
        }
      });

      return {
        html: fullHTML,
        css: cssContent + '\n\n/* Computed Styles for better accuracy */\n' + computedStyles.join('')
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
