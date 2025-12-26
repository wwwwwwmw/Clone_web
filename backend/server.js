require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { scrapeWebsite } = require('./services/scraper');
const { generateBackendCode } = require('./services/aiGenerator');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'WebCloneAI Backend is running' });
});

// Main clone endpoint
app.post('/api/clone', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { url } = req.body;

    // Validate URL
    if (!url) {
      return res.status(400).json({ 
        error: 'URL is required',
        message: 'Please provide a valid URL to clone'
      });
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch (err) {
      return res.status(400).json({ 
        error: 'Invalid URL',
        message: 'Please provide a valid URL format'
      });
    }

    console.log(`[${new Date().toISOString()}] Starting clone process for: ${url}`);

    // Step 1: Scrape the website
    console.log('Step 1: Scraping website...');
    const { html, css } = await scrapeWebsite(url);
    console.log(`Scraped HTML length: ${html.length} characters`);

    // Step 2: Generate backend code using AI
    console.log('Step 2: Generating backend code with AI...');
    const { sqlSchema, nodeRoute } = await generateBackendCode(html);
    console.log('AI generation complete');

    // Step 3: Return the result
    const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`Clone process completed in ${processingTime}s`);

    res.json({
      success: true,
      data: {
        html,
        css,
        sqlSchema,
        nodeRoute,
        metadata: {
          sourceUrl: url,
          processingTime: `${processingTime}s`,
          timestamp: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('❌ Error in clone process:');
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      message: 'Failed to clone website. Please check the URL and try again.',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: 'The requested endpoint does not exist'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║         WebCloneAI Backend Server          ║
║                                            ║
║  Server running on: http://localhost:${PORT}  ║
║  Environment: ${process.env.NODE_ENV || 'development'}                   ║
╚════════════════════════════════════════════╝
  `);
});

module.exports = app;
