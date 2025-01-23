const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const auth = require('../middlewares/auth');

router.post('/create', auth, transactionController.createTransaction);
router.get('/get', auth, transactionController.getTransactions);
router.delete('/delete/:id', auth, transactionController.deleteTransaction);
router.get('/get/day', auth, transactionController.getTransactionByDay);
router.get('/get/month', auth, transactionController.getTransactionByMonth);
router.get('/get/week', auth, transactionController.getTransactionByWeek);
router.get('/get/year', auth, transactionController.getTransactionByYear);

module.exports = router;
