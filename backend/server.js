const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
//const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'https://pme-stark-tvm1.vercel.app/' || 'http://localhost:3000';
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

const allowedOrigins = process.env.CLIENT_ORIGIN 
  ? process.env.CLIENT_ORIGIN.split(',') 
  : ['https://pme-stark-tvm1.vercel.app', 'http://localhost:3000'];


// Middleware - Fix CORS
app.use(cors({
  origin:  allowedOrigins, // Your frontend URL
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, UPLOAD_DIR)));
// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));

// ✅ Add this new route for OpenRouter
app.post('/api/chat', async (req, res) => {
  try {
    //console.log('Request body to OpenRouter:', req.body);
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://pme-stark-tvm1.vercel.app/',   // or your production domain 'http://localhost:3000'
    'X-Title': 'My Chat App'
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error('❌ OpenRouter API error:', error);
    res.status(500).json({ error: 'Failed to contact OpenRouter API' });
  }
});

// Test route
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'PME Backend is running!', 
    timestamp: new Date(),
    status: 'healthy'
  });
});
app.get('/', (req, res) => {
  res.send('✅ PME Backend is live. Use /api/health to check health status.');
});


// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 PostgreSQL Database: ${process.env.DB_NAME || 'pme_system'}`);
});