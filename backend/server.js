require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const app = express();

const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API is running' });
});

// Add your routes here
app.use('/api', (req, res) => {
  res.status(200).json({ message: 'API is functioning correctly' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 