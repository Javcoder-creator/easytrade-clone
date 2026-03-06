const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');

router.get('/', storeController.getAllStores);
router.post('/', storeController.createStore);

module.exports = router;