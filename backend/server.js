// backend/server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const adminRoutes = require('./routes/adminRoutes');
const transferRoutes = require('./routes/transferRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// serve frontend static files if you want to run backend to serve frontend
const path = require('path');
app.use('/', express.static(path.join(__dirname, '..', 'frontend')));

app.use('/api/admin', adminRoutes);
app.use('/api/transfer', transferRoutes);
app.use('/api/chat', chatRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Baby Vibra server running on port', port));
