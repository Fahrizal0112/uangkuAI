const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');

router.post('/register', userController.register);
router.post('/login', userController.login);

router.get('/profile', auth, userController.getProfile);
router.patch('/profile', auth, userController.updateProfile);
router.patch('/change-password', auth, userController.changePassword);
router.post('/income', auth, userController.updateMonthlyIncome);
router.post('/logout', auth, userController.logout);

module.exports = router;
