# WebCloneAI 🚀

An AI-powered stateless web cloning tool that scrapes websites, analyzes their structure, and generates compatible backend code (PostgreSQL schemas and Node.js Express routes) using OpenAI.

![WebCloneAI](https://img.shields.io/badge/Status-Active-green)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-blue)

## 🌟 Features

- **Web Scraping**: Extract clean HTML and CSS from any website using Puppeteer
- **AI Code Generation**: Automatically generate PostgreSQL schemas and Express routes based on UI analysis
- **Live Preview**: View the cloned website directly in the browser
- **Code Editor**: Built-in Monaco Editor for viewing and editing generated code
- **Instant Download**: Package all generated files into a downloadable ZIP
- **Stateless Architecture**: No database required - all processing happens on-demand

## 🏗️ Architecture

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Frontend  │──────▶│   Backend   │──────▶│   OpenAI    │
│  (Next.js)  │       │  (Express)  │       │     API     │
└─────────────┘       └─────────────┘       └─────────────┘
      │                      │
      │                      ▼
      │               ┌─────────────┐
      │               │  Puppeteer  │
      │               │  (Scraper)  │
      │               └─────────────┘
      │
      ▼
┌─────────────┐
│   JSZip +   │
│ File Saver  │
└─────────────┘
```

## 📁 Project Structure

```
Clone_web/
├── backend/
│   ├── server.js                 # Express server
│   ├── services/
│   │   ├── scraper.js           # Puppeteer web scraper
│   │   └── aiGenerator.js       # OpenAI integration
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── app/
│   │   ├── page.tsx             # Main UI component
│   │   ├── layout.tsx           # Root layout
│   │   └── globals.css          # Global styles
│   ├── components/
│   │   └── CodePreview.tsx      # Monaco Editor wrapper
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   └── tsconfig.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ installed
- **npm** or **yarn** package manager
- **OpenAI API Key** (get one at [platform.openai.com](https://platform.openai.com))

### Installation

#### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Clone_web
```

#### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your OpenAI API key
# OPENAI_API_KEY=your_api_key_here
```

#### 3. Setup Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file (optional)
cp .env.example .env
```

### Running the Application

#### Start Backend Server

```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:5000`

#### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

### Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Enter a website URL in the input field
3. Click **Clone** to start the process
4. View the results in different tabs:
   - **Preview**: Live preview of the cloned website
   - **HTML**: Extracted HTML code
   - **CSS**: Extracted CSS styles
   - **SQL Schema**: Generated PostgreSQL database schema
   - **Node.js Route**: Generated Express routes
5. Click **Download ZIP** to get all files in a package

## 🔧 Configuration

### Backend Environment Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o

# CORS Configuration (optional)
# ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 📦 Dependencies

### Backend

- **express**: Web server framework
- **cors**: Enable CORS
- **puppeteer**: Headless browser for web scraping
- **openai**: OpenAI API client
- **dotenv**: Environment variable management

### Frontend

- **next**: React framework
- **react**: UI library
- **tailwindcss**: CSS framework
- **@monaco-editor/react**: Code editor
- **lucide-react**: Icon library
- **jszip**: Create ZIP files
- **file-saver**: Download files in browser

## 🛠️ API Endpoints

### `POST /api/clone`

Clone a website and generate backend code.

**Request Body:**

```json
{
  "url": "https://example.com"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "html": "<!DOCTYPE html>...",
    "css": "body { ... }",
    "sqlSchema": "CREATE TABLE ...",
    "nodeRoute": "const express = require('express');...",
    "metadata": {
      "sourceUrl": "https://example.com",
      "processingTime": "5.23s",
      "timestamp": "2025-12-26T10:30:00.000Z"
    }
  }
}
```

## 🎨 Features Breakdown

### 1. Web Scraping (Puppeteer)

- Launches headless Chrome browser
- Extracts HTML and CSS
- Removes tracking scripts and analytics
- Cleans unnecessary elements

### 2. AI Code Generation (OpenAI)

- Analyzes HTML structure
- Identifies forms and inputs
- Generates PostgreSQL schema
- Creates Express CRUD routes
- Provides fallback code if AI fails

### 3. Frontend UI

- Modern dark-themed interface
- Real-time preview
- Tabbed code viewer
- Monaco Editor integration
- ZIP file generation and download

## 🔒 Security Considerations

- **CORS**: Configure allowed origins in production
- **Rate Limiting**: Consider adding rate limiting to prevent abuse
- **Input Validation**: URLs are validated before processing
- **Sandboxed iFrame**: Preview uses sandboxed iframe
- **API Key Protection**: Never expose OpenAI API key on frontend

## 🚀 Production Deployment

### Backend Deployment

1. Set environment variables on your hosting platform
2. Ensure Puppeteer dependencies are installed
3. Use `npm start` to run the production server

### Frontend Deployment

```bash
cd frontend
npm run build
npm start
```

Or deploy to Vercel:

```bash
vercel --prod
```

## 🐛 Troubleshooting

### Puppeteer Issues

If Puppeteer fails to launch:

```bash
# Install required dependencies (Linux)
sudo apt-get install -y chromium-browser

# Or set environment variable
export PUPPETEER_SKIP_DOWNLOAD=true
```

### OpenAI API Errors

- **401 Unauthorized**: Check your API key
- **429 Rate Limit**: Upgrade your OpenAI plan or wait
- **500 Server Error**: OpenAI service may be down

## 📝 License

MIT License - feel free to use this project for any purpose.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 💡 Future Enhancements

- [ ] Support for multiple AI models (Claude, Gemini)
- [ ] Support for MongoDB schema generation
- [ ] GraphQL API generation
- [ ] Docker containerization
- [ ] Advanced HTML cleaning options
- [ ] Custom prompt templates
- [ ] User authentication and history
- [ ] Batch processing multiple URLs

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ using Next.js, Node.js, Puppeteer, and OpenAI**
# Clone_web
