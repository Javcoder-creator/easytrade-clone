const Store = require('../models/Store');

// Hamma do'konlarni olish
exports.getAllStores = async (req, res) => {
    try {
        const stores = await Store.findAll();
        res.json(stores);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Yangi do'kon ochish
exports.createStore = async (req, res) => {
    try {
        const { name, ownerName, address } = req.body;
        const newStore = await Store.create({ name, ownerName, address });
        res.status(201).json(newStore);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};