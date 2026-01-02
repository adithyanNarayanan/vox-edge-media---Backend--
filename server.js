const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://vox-edge-media.vercel.app', process.env.FRONTEND_URL].filter(Boolean), // Frontend URLs
    credentials: true // Allow cookies to be sent
}));
app.use(express.json());

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://adithyan:root@cluster0.hr69xgw.mongodb.net/';

mongoose.connect(mongoUri)
    .then(() => console.log('✓ MongoDB Connected'))
    .catch(err => {
        console.error('✗ MongoDB Connection Error:', err.message);
        console.warn('  Server will continue running, but database operations will fail.');
    });

// MongoDB connection event handlers
mongoose.connection.on('disconnected', () => {
    console.warn('⚠ MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
    console.log('✓ MongoDB reconnected');
});

mongoose.connection.on('error', (err) => {
    console.error('✗ MongoDB error:', err.message);
});

// Routes
const dbCheck = require('./middleware/dbCheck');

app.use('/api/auth', dbCheck, require('./routes/auth'));
app.use('/api/bookings', dbCheck, require('./routes/bookings'));
app.use('/api/contact', dbCheck, require('./routes/contact'));
app.use('/api/admin', dbCheck, require('./routes/admin'));
app.use('/api/services', dbCheck, require('./routes/services'));
app.use('/api/plans', dbCheck, require('./routes/plans'));
app.use('/api/content', dbCheck, require('./routes/content'));

// Health check endpoint
app.get('/health', (req, res) => {
    const { admin, firebaseInitialized } = require('./config/firebase-admin');

    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
            mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
            firebase: firebaseInitialized ? 'initialized' : 'not configured'
        }
    });
});

app.get('/', (req, res) => {
    res.json({
        name: 'Vox Edge Media API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            health: '/health',
            auth: '/api/auth'
        }
    });
});

// 404 Handler - Must be last route
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.originalUrl}`
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Server updated with 404 handler and DB check');
});
