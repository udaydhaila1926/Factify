require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const analyzeRoute = require('./routes/analyze.route');

// Routes
app.use('/api', analyzeRoute);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'TruthLens server is running', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 TruthLens server running on port ${PORT}`);
});

module.exports = app;