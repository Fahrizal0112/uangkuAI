const express = require('express');
const router = express.Router();
const insightController = require('../controllers/insightController');
const auth = require('../middlewares/auth');

router.get('/generate', auth, insightController.generateInsight);
router.get('/history', auth, insightController.getInsightHistory);

module.exports = router;