const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const auth = require('../middlewares/auth');

router.post('/create', auth, categoryController.createCategory);
router.get('/get', auth, categoryController.getCategories);
router.put('/update/:id', auth, categoryController.updateCategory);
router.delete('/delete/:id', auth, categoryController.deleteCategory);

module.exports = router;
