const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const routes = require('./routes/routes');

const app = express();

// Hapus helmet() sementara atau konfigurasi ulang
// app.use(helmet());

// Perbaiki konfigurasi CORS
app.use(cors({
    origin: ['http://localhost:5173','http://8.215.199.5:3002'], // Sesuaikan dengan origin frontend Anda
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware untuk parsing JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware untuk CORS pre-flight requests
app.options('*', cors()); // Tambahkan ini untuk handle OPTIONS requests

// Routes
app.use('/api', routes);

// Error handling middleware (perbaiki parameter)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: err.message
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});