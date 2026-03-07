const Product = require('../models/Product');
const Entry = require('../models/Entry');

// 1. TOVAR YARATISH
exports.createProduct = async (req, res) => {
    try {
        const { name, sku, price_buy, price_sell, stock_quantity, store_id } = req.body;
        
        // SKU bo'sh kelsa, xato bermasligi uchun vaqtinchalik unikal qiymat beramiz
        const finalSku = sku || `SKU-${Date.now()}`;

        const newProduct = await Product.create({
            name,
            sku: finalSku,
            price_buy: price_buy || 0,
            price_sell,
            stock_quantity: stock_quantity || 0,
            store_id
        });
        
        res.status(201).json(newProduct);
    } catch (error) {
        // Agar SKU takrorlansa yoki boshqa xato bo'lsa
        res.status(400).json({ message: "Tovarni saqlashda xatolik", error: error.message });
    }
};

// 2. DO'KON TOVARLARINI OLISH
exports.getStoreProducts = async (req, res) => {
    try {
        const { store_id } = req.params;
        const products = await Product.findAll({ 
            where: { store_id },
            order: [['createdAt', 'DESC']] // Yangi qo'shilganlar tepada chiqadi
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. TOVARNI O'CHIRISH (Sizda yo'q edi, qo'shildi)
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Mahsulotni o'chirish
        // Eslatma: Modelda onDelete: 'CASCADE' bo'lgani uchun bog'liq kirimlar ham o'chadi
        const deleted = await Product.destroy({ where: { id } });

        if (deleted) {
            res.json({ message: "Mahsulot o'chirildi ✅" });
        } else {
            res.status(404).json({ message: "Mahsulot topilmadi" });
        }
    } catch (error) {
        res.status(500).json({ 
            message: "O'chirishda xatolik. Mahsulot sotuvlar bilan bog'langan bo'lishi mumkin.", 
            error: error.message 
        });
    }
};

// 4. OMBORGA TOVAR QO'SHISH (Kirim qilish)
exports.addStock = async (req, res) => {
    try {
        const { product_id, quantity, price_buy } = req.body;
        
        const product = await Product.findByPk(product_id);
        if (!product) return res.status(404).json({ message: "Mahsulot topilmadi" });

        // Kirim tarixini yaratish
        await Entry.create({ product_id, quantity, supply_price: price_buy });

        // Mahsulot qoldig'ini va TANNARXINI yangilash
        product.stock_quantity += parseInt(quantity);
        if (price_buy) {
            product.price_buy = parseFloat(price_buy); // Yangi kelgan narxni asosiy tannarx sifatida saqlaymiz
        }
        await product.save();

        res.json({ message: "Ombor to'ldirildi!", newStock: product.stock_quantity, newPrice: product.price_buy });
    } catch (error) {
        res.status(500).json({ message: "Kirimda xatolik", error: error.message });
    }
};