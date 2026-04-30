const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Fix frontend path for Railway
const frontendPath = path.resolve(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

app.use(express.static(frontendPath));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', frontendPath });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));

// Serve frontend for all other routes


app.get('*', (req, res) => {
  const indexPath = path.resolve(__dirname, '..', 'frontend', 'index.html');
  console.log('Serving index from:', indexPath);
  res.sendFile(indexPath);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ __dirname is: ${__dirname}`);
});