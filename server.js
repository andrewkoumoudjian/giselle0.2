// Local development server
require('dotenv').config();

try {
  console.log('Loading API...');
  const app = require('./api/index');

  const PORT = process.env.PORT || 3001;

  app.listen(PORT, () => {
    console.log(`HR Candidate Filtering API running on http://localhost:${PORT}`);
  });
} catch (error) {
  console.error('Error starting server:', error);
}
