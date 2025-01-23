const express = require('express');
const cors = require('cors');
require('dotenv').config();

const routes = require('./routes/routes');
const app = express();

// Definisikan semua kemungkinan origins
const allowedOrigins = [
    'http://localhost:5173',
    'http://8.215.199.5:3002',
    'http://8.215.199.5:3001',
    'http://8.215.199.5',
    // Tambahkan variasi lain yang mungkin
    'https://8.215.199.5:3002',
    'https://8.215.199.5:3001',
    'https://8.215.199.5'
];

// Konfigurasi CORS yang lebih permisif untuk debugging
app.use(cors({
    origin: true, // Izinkan semua origin sementara untuk debugging
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Middleware untuk debugging
app.use((req, res, next) => {
    console.log('Request dari:', req.headers.origin);
    console.log('Method:', req.method);
    console.log('Path:', req.path);
    console.log('Headers:', req.headers);
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});