const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

const frontendPath = path.resolve(__dirname, '../frontend');

app.use(cors());
app.use(express.json());
app.use(express.static(frontendPath));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));

app.get(/.*/, (req, res) => {
  res.sendFile('index.html', { root: frontendPath });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on address on address http://localhost:${PORT}`);
});