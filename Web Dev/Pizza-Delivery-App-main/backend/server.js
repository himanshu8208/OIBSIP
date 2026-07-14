import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import pizzaRoutes from './routes/pizzaRoutes.js';
import customRoutes from './routes/customRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Load environmental variables
dotenv.config();

// Connect to MongoDB database
connectDB();

const app = express();
const server = http.createServer(app);

// Configure real-time Socket.IO instance
const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      process.env.ADMIN_URL || 'http://localhost:5174',
      'http://localhost:5173',
      'http://localhost:5174'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Share Socket.IO server reference through Express app settings
app.set('io', io);

// Mount Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    process.env.ADMIN_URL || 'http://localhost:5174',
    'http://localhost:5173',
    'http://localhost:5174'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logger
app.use((req, res, next) => {
  console.log(`[API Request] ${req.method} ${req.originalUrl}`);
  next();
});

// Mount API Route Bindings
app.use('/api/auth', authRoutes);
app.use('/api/pizzas', pizzaRoutes);
app.use('/api/custom', customRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/admin', adminRoutes);

// Root Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the PizzaVerse MERN Stack API Server!',
    version: '1.0.0'
  });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('[Global Error Handler] Caught exception:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected server error occurred'
  });
});

// Socket.IO Connection Event Listener
io.on('connection', (socket) => {
  console.log(`[Socket.IO] New client connected: ${socket.id}`);

  // Securely join room based on customer/admin user ID
  socket.on('joinRoom', (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`[Socket.IO] Client ${socket.id} securely joined room: ${userId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Spin up server listener
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 PizzaVerse Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`👉 Access URL: http://localhost:${PORT}`);
  console.log(`==================================================\n`);
});
