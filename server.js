const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();

// Connect Database
connectDB();

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// CORS Configuration
const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:5173', 'https://mfau.netlify.app', 'http://127.0.0.1:5500', 'http://localhost:5500'],
    credentials: true
};
app.use(cors(corsOptions));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/home', require('./routes/home'));
app.use('/api/invoices', require('./routes/invoices'));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;

// Only start server if not in Vercel environment
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Export for Vercel serverless
module.exports = app;
