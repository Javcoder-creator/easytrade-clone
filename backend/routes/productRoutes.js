const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.post('/', productController.createProduct);
router.get('/:store_id', productController.getStoreProducts); // Do'kon ID si orqali olish
router.post('/add-stock', productController.addStock);
module.exports = router;