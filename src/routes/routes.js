const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');
const categoryRoutes = require('./categoryRoutes');
const transactionRoutes = require('./transactionRoutes');
const aiRoutes = require('./insightRoutes');

router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/transactions', transactionRoutes);
router.use('/ai', aiRoutes);

module.exports = router;
