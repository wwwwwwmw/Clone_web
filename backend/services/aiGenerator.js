const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generates backend code (SQL schema and Node.js route) based on HTML
 * @param {string} htmlString - The HTML to analyze
 * @returns {Promise<{sqlSchema: string, nodeRoute: string}>}
 */
async function generateBackendCode(htmlString) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    console.log('Calling Gemini API...');

    const prompt = `You are an expert backend developer. Analyze the provided HTML and generate appropriate backend code.

Your task:
1. Identify all forms, inputs, and data collection elements in the HTML
2. Design a PostgreSQL database schema that would support this UI
3. Create a Node.js Express route to handle CRUD operations for the identified data

HTML to analyze:
\`\`\`html
${htmlString.substring(0, 8000)}
\`\`\`

Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks, no extra text):
{
  "sqlSchema": "CREATE TABLE users (\\n  id SERIAL PRIMARY KEY,\\n  ...\\n);",
  "nodeRoute": "const express = require('express');\\nconst router = express.Router();\\n...\\nmodule.exports = router;"
}

Important:
- Use \\n for newlines in strings
- Escape quotes properly
- Return strict JSON only - no markdown code blocks
- If no forms found, create a basic example schema/route
- Include proper SQL data types and constraints
- Include Express middleware (body-parser, etc.)
- Add error handling in the route`;

    const model = genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
      }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let content = response.text();
    
    // Remove markdown code blocks if present
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    console.log('Gemini response received');

    // Parse the JSON response
    let generatedCode;
    try {
      generatedCode = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('AI returned invalid JSON format');
    }

    // Validate response structure
    if (!generatedCode.sqlSchema || !generatedCode.nodeRoute) {
      throw new Error('AI response missing required fields (sqlSchema or nodeRoute)');
    }

    return {
      sqlSchema: generatedCode.sqlSchema,
      nodeRoute: generatedCode.nodeRoute
    };

  } catch (error) {
    console.error('AI Generation error:', error);

    // Check for specific Gemini errors
    if (error.message && error.message.includes('API_KEY')) {
      throw new Error('Invalid Gemini API key');
    } else if (error.message && error.message.includes('RATE_LIMIT')) {
      throw new Error('Gemini API rate limit exceeded');
    } else if (error.message && error.message.includes('QUOTA')) {
      throw new Error('Gemini API quota exceeded');
    }

    // Return fallback code if AI fails
    console.log('Returning fallback backend code');
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
