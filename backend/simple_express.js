const express = require('express');
const cors = require('cors');
const app = express();
const port = 8000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '0.1.0',
    message: 'Backend API is running'
  });
});

// Candidates array
const candidates = [];

// Candidates endpoints
app.get('/candidates', (req, res) => {
  res.json(candidates);
});

app.post('/candidates', (req, res) => {
  console.log('Received POST request to /candidates');
  console.log('Request body:', req.body);
  
  const { name, email } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required' });
  }
  
  const newCandidate = {
    id: Math.random().toString(36).substring(7),
    name,
    email,
    created_at: new Date().toISOString()
  };
  
  candidates.push(newCandidate);
  console.log('Created new candidate:', newCandidate);
  
  res.status(201).json(newCandidate);
});

// Start the server
app.listen(port, () => {
  console.log(`Backend API server running at http://localhost:${port}`);
}); 