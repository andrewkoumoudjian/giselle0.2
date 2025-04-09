const express = require('express');
const app = express();
const port = 8001;

// Middleware to parse JSON bodies
app.use(express.json());

// Simple test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'GET test successful' });
});

// POST test endpoint
app.post('/test', (req, res) => {
  console.log('Received POST request');
  console.log('Body:', req.body);
  res.json({ 
    message: 'POST test successful',
    receivedData: req.body
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Minimal server running at http://localhost:${port}`);
}); 