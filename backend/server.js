const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Frontend is now INSIDE backend folder
const frontendPath = path.join(__dirname, 'frontend');
console.log('Frontend path:', frontendPath);

app.use(express.static(frontendPath));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', frontendPath });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));

// Fallback - serve index.html
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Frontend path: ${frontendPath}`);
});