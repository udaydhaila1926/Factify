import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health Check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Factify API Gateway' });
});

// Verification Endpoint
app.post('/api/verify', async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text input is required' });
  }

  try {
    // In production, this calls the Python Microservice
    // For now, we can mock the response or forward it if the python service is running
    
    // const response = await axios.post(`${AI_SERVICE_URL}/analyze`, { text });
    // const analysis = response.data;

    // Mock Response for MVP
    const analysis = {
      verdict: 'Unverified',
      score: Math.floor(Math.random() * 100),
      confidence: 85,
      summary: `Backend processed: "${text.substring(0, 20)}..."`,
      sources: []
    };

    // TODO: Save to Supabase here using supabase-admin client

    res.json(analysis);
  } catch (error) {
    console.error('AI Service Error:', error.message);
    res.status(500).json({ error: 'Failed to verify claim' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend Gateway running on port ${PORT}`);
});
