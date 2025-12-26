const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini client
let genAI;
try {
  if (!process.env.GEMINI_API_KEY) {
    console.error('⚠️  GEMINI_API_KEY not found in environment variables');
  } else {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('✅ Gemini AI client initialized successfully');
  }
} catch (error) {
  console.error('❌ Failed to initialize Gemini client:', error.message);
}

/**
 * Generates backend code (SQL schema and Node.js route) based on HTML
 * @param {string} htmlString - The HTML to analyze
 * @returns {Promise<{sqlSchema: string, nodeRoute: string}>}
 */
async function generateBackendCode(htmlString) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured in .env file');
    }

    if (!genAI) {
      throw new Error('Gemini AI client not initialized');
    }

    console.log('🤖 Calling Gemini API (gemini-1.5-flash)...');

    // Improved prompt for better JSON output
    const prompt = `You are an expert backend developer. Analyze the HTML below and generate backend code.

HTML to analyze:
\`\`\`html
${htmlString.substring(0, 6000)}
\`\`\`

YOUR TASK:
1. Identify forms, inputs, and data fields in the HTML
2. Design a PostgreSQL schema to support this UI
3. Create Express.js CRUD routes for the data

CRITICAL: Return ONLY pure JSON. No markdown. No code blocks. No explanation.

Use this EXACT JSON structure:
{
  "sqlSchema": "CREATE TABLE example (\\n  id SERIAL PRIMARY KEY,\\n  name VARCHAR(255)\\n);",
  "nodeRoute": "const express = require('express');\\nconst router = express.Router();\\n\\nrouter.get('/api/data', (req, res) => {\\n  res.json({ data: [] });\\n});\\n\\nmodule.exports = router;"
}

RULES:
- Use \\n for newlines in strings
- Escape all quotes with \\
- Return pure JSON only
- If no forms exist, create a basic user table example
- Include proper error handling in routes`;

    const model = genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 8192,
        topP: 0.8,
        topK: 40,
      }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let content = response.text();
    
    console.log('📥 Raw Gemini response received (first 200 chars):', content.substring(0, 200));
    
    // Aggressive cleaning to extract JSON
    content = content.trim();
    
    // Remove markdown code blocks
    content = content.replace(/```json\s*/gi, '');
    content = content.replace(/```javascript\s*/gi, '');
    content = content.replace(/```\s*/g, '');
    
    // Remove any text before first { and after last }
    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      content = content.substring(firstBrace, lastBrace + 1);
    }
    
    content = content.trim();
    
    console.log('🧹 Cleaned content (first 200 chars):', content.substring(0, 200));

    // Parse the JSON response
    let generatedCode;
    try {
      generatedCode = JSON.parse(content);
      console.log('✅ Successfully parsed JSON response');
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError.message);
      console.error('Content that failed to parse:', content.substring(0, 500));
      throw new Error(`AI returned invalid JSON: ${parseError.message}`);
    }

    // Validate response structure
    if (!generatedCode.sqlSchema || !generatedCode.nodeRoute) {
      console.error('❌ Missing required fields in response:', generatedCode);
      throw new Error('AI response missing required fields (sqlSchema or nodeRoute)');
    }

    console.log('✅ Code generation successful');
    console.log('   - SQL Schema length:', generatedCode.sqlSchema.length);
    console.log('   - Node Route length:', generatedCode.nodeRoute.length);

    return {
      sqlSchema: generatedCode.sqlSchema,
      nodeRoute: generatedCode.nodeRoute
    };

  } catch (error) {
    console.error('❌ AI Generation error:', error.message);
    console.error('Error stack:', error.stack);

    // Check for specific Gemini errors
    if (error.message && (error.message.includes('API_KEY') || error.message.includes('API key'))) {
      throw new Error('Invalid or missing Gemini API key. Check your .env file.');
    } else if (error.message && error.message.includes('RATE_LIMIT')) {
      throw new Error('Gemini API rate limit exceeded. Please try again later.');
    } else if (error.message && (error.message.includes('QUOTA') || error.message.includes('quota'))) {
      throw new Error('Gemini API quota exceeded. Check your Google Cloud quota.');
    } else if (error.message && error.message.includes('blocked')) {
      throw new Error('Content was blocked by Gemini safety filters.');
    }

    // Return fallback code if AI fails
    console.log('⚠️  Returning fallback backend code due to error');
    return getFallbackCode();
  }
}

/**
 * Returns fallback code when AI generation fails
 * @returns {{sqlSchema: string, nodeRoute: string}}
 */
function getFallbackCode() {
  return {
    sqlSchema: `-- Fallback SQL Schema
-- Generated when AI service is unavailable

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS form_submissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  form_data JSONB NOT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_submissions_user ON form_submissions(user_id);`,

    nodeRoute: `// Fallback Node.js Express Route
// Generated when AI service is unavailable

const express = require('express');
const router = express.Router();

// Middleware
router.use(express.json());

// Get all records
router.get('/users', async (req, res) => {
  try {
    // TODO: Implement database query
    res.json({ message: 'Get all users', data: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single record
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // TODO: Implement database query
    res.json({ message: 'Get user by id', id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create record
router.post('/users', async (req, res) => {
  try {
    const userData = req.body;
    // TODO: Implement database insert
    res.status(201).json({ message: 'User created', data: userData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update record
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userData = req.body;
    // TODO: Implement database update
    res.json({ message: 'User updated', id, data: userData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete record
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // TODO: Implement database delete
    res.json({ message: 'User deleted', id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;`
  };
}

module.exports = {
  generateBackendCode
};
