const Product = require('../models/Product');

// Tovar yaratish
exports.createProduct = async (req, res) => {
    try {
        const { name, sku, price_buy, price_sell, stock_quantity, store_id } = req.body;
        
        const newProduct = await Product.create({
            name,
            sku,
            price_buy,
            price_sell,
            stock_quantity,
            store_id // Do'kon bilan bog'liqlik
        });
        
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(400).json({ message: "Tovarni saqlashda xatolik", error: error.message });
    }
};

// Ma'lum bir do'konning barcha tovarlarini olish
exports.getStoreProducts = async (req, res) => {
    try {
        const { store_id } = req.params;
        const products = await Product.findAll({ where: { store_id } });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const Entry = require('../models/Entry');

exports.addStock = async (req, res) => {
    try {
        const { product_id, quantity, price_buy } = req.body;
        
        // 1. Mahsulotni topish
        const product = await Product.findByPk(product_id);
        if (!product) return res.status(404).json({ message: "Mahsulot topilmadi" });

        // 2. Kirim tarixini yaratish
        await Entry.create({ product_id, quantity, price_buy });

        // 3. Mahsulot qoldig'ini yangilash
        product.stock_quantity += parseInt(quantity);
        await product.save();

        res.json({ message: "Ombor to'ldirildi!", newStock: product.stock_quantity });
    } catch (error) {
        res.status(500).json({ message: "Kirimda xatolik", error: error.message });
    }
};