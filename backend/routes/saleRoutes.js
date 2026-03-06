const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');

router.post('/', saleController.createSale);
router.get('/:store_id', saleController.getSales);
router.get('/stats/:store_id', saleController.getStats);
router.get('/weekly/:store_id', saleController.getWeeklySales);
module.exports = router;