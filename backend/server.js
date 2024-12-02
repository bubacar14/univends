require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const http = require('http');
const { Server } = require('socket.io');
const apiRoutes = require('./routes/api');
const uploadRoutes = require('./routes/upload');

const app = express();
const server = http.createServer(app);

// Configuration de Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rendre io accessible dans les routes
app.set('io', io);

// Route racine
app.get('/', (req, res) => {
  res.json({
    message: 'UniVends API is running',
    version: '1.0.0',
    endpoints: {
      api: '/api',
      upload: '/api/upload'
    },
    status: 'healthy'
  });
});

// Routes
app.use('/api', apiRoutes);
app.use('/api/upload', uploadRoutes);

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `La route ${req.originalUrl} n'existe pas`,
    availableEndpoints: {
      api: '/api',
      upload: '/api/upload'
    }
  });
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
  });
});

// Connexion MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-marketplace', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Gestion des WebSocket
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Rejoindre une conversation
  socket.on('joinConversation', (conversationId) => {
    socket.join(conversationId);
  });

  // Quitter une conversation
  socket.on('leaveConversation', (conversationId) => {
    socket.leave(conversationId);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
