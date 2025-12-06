const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
// Prefer WEB_PORT if defined, else fall back to PORT, else 5000
const PORT = process.env.WEB_PORT || process.env.PORT || 5000;
//const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ||'http://localhost:5173','https://pme-stark-tvm1.vercel.app', 'https://pme-stark-tvm1.vercel.app/' || 'http://localhost:3000';
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const productionOrigin = process.env.CLIENT_ORIGIN; // https://pme-stark-tvm1.vercel.app

// Example: https://pme-stark-tvm1.vercel.app

// Regex allows ALL Vercel preview URLs for this project
// Matches patterns like:
// https://pme-stark-tvm1-xxxx.vercel.app
// https://pme-stark-tvm1-xxxx-prasads-projects.vercel.app
// https://pme-stark-tvm1-xxxx-prasads-projects-xxxx.vercel.app
const vercelPreviewPattern =
  /^https:\/\/pme-stark-tvm1-[a-zA-Z0-9-]+\.vercel\.app$/;
//const vercelPreviewPattern = /^https:\/\/pme-stark-tvm1-[a-zA-Z0-9-]+\.vercel\.app$/;
//const allowedOrigins = process.env.CLIENT_ORIGIN 
//? process.env.CLIENT_ORIGIN.split(',').map(o => o.trim())
 //     : ["http://localhost:3000","https://*pme-stark-tvm1.vercel.app"];

      const allowedOrigins = [
  productionOrigin,
  "http://localhost:3000",
  vercelPreviewPattern
];

 // ? process.env.CLIENT_ORIGIN.split(',') 
// : ['http://localhost:3000',  'http://localhost:5000'];
 
console.log('CORS Configuration:');
console.log('CLIENT_ORIGIN:', allowedOrigins);
//console.log('Request from origin:', req.headers.origin);
//'https://pme-stark-tvm1.vercel.app', 'https://*.pme-stark-tvm1.vercel.app',   
   //   'https://pme-stark-tvm1-m1cp5x1vi-prasads-projects-89fbad0f.vercel.app',
  //  'http://localhost:3000'
// Middleware - Fix CORS
//app.use(cors({
 //origin:  allowedOrigins, // Your frontend URL 
//   credentials: true,
 // methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
 // allowedHeaders: ['Content-Type', 'Authorization']
//}));
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`❌ Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "ngrok-skip-browser-warning"   // <-- IMPORTANT FIX
  ],
}));
 //console.log(`server.jst`);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, UPLOAD_DIR)));
// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));

// ✅ Serve frontend (only if hosting React from Express)
//app.use(express.static(path.join(__dirname, '../frontend/dist')));

// ✅ Catch-all: serve index.html for client-side routes
//app.get('*', (req, res) => {
 // res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
//});

// Test route
app.get('/api/health', (req, res) => {
  res.json({
    message: 'PME Backend is running!', 
    timestamp: new Date(),
    status: 'healthy'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 PostgreSQL Database: ${process.env.DB_NAME || 'pme_system'}`);
});

{/* ✅ Add this new route for OpenRouter
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
});*/}

