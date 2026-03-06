const Sale = require('../models/Sale');
const Product = require('../models/Product');
const { Op } = require('sequelize');
const sequelize = require('../config/db');

// 1. Yangi sotuvni amalga oshirish (Sotish + Foydani hisoblash)
exports.createSale = async (req, res) => {
    const t = await sequelize.transaction(); // Tranzaksiya: hamma narsa bo'lsa bo'ladi, bo'lmasa qaytadi
    try {
        const { store_id, items, total_price } = req.body;

        // Items ichiga kelish narxini (supply_price) ham qo'shib saqlaymiz
        const itemsWithSupplyPrice = [];
        
        for (let item of items) {
            const product = await Product.findByPk(item.id);
            if (!product || product.stock_quantity < item.qty) {
                throw new Error(`${item.name} omborda yetarli emas!`);
            }

            // Ombor qoldig'ini kamaytirish
            product.stock_quantity -= item.qty;
            await product.save({ transaction: t });

            // Foydani hisoblash uchun ma'lumotlarni yig'ish
            itemsWithSupplyPrice.push({
                ...item,
                supply_price: product.supply_price || 0 // Mahsulotning kelish narxi
            });
        }

        const newSale = await Sale.create({
            store_id,
            items: itemsWithSupplyPrice,
            total_price
        }, { transaction: t });

        await t.commit();
        res.status(201).json(newSale);
    } catch (error) {
        await t.rollback();
        res.status(400).json({ message: error.message });
    }
};

// 2. Dashboard uchun statistika (Tushum + Sof Foyda)
exports.getStats = async (req, res) => {
    try {
        const { store_id } = req.params;
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const sales = await Sale.findAll({
            where: {
                store_id,
                createdAt: { [Op.gte]: startOfDay }
            }
        });

        let totalRevenue = 0;
        let totalProfit = 0;

        sales.forEach(sale => {
            // total_price ni raqamga o'tkazamiz
            const saleTotal = parseFloat(sale.total_price) || 0;
            totalRevenue += saleTotal;
            
            // Items ichidagi foydani hisoblash
            if (sale.items && Array.isArray(sale.items)) {
                sale.items.forEach(item => {
                    const sellPrice = parseFloat(item.price_sell) || 0;
                    const supplyPrice = parseFloat(item.supply_price) || 0;
                    const quantity = parseInt(item.qty) || 0;

                    // Agar supplyPrice bo'lmasa, foyda = 0 deb hisoblaymiz (xato bermasligi uchun)
                    const itemProfit = (sellPrice - supplyPrice) * quantity;
                    totalProfit += itemProfit;
                });
            }
        });

        res.json({
            totalRevenue: Math.round(totalRevenue),
            totalProfit: Math.round(totalProfit),
            totalSalesCount: sales.length
        });
    } catch (error) {
        console.error("Statistika xatosi:", error);
        res.status(500).json({ message: "Statistikada xato", error: error.message });
    }
};

// 3. Barcha sotuvlar tarixini olish
exports.getSales = async (req, res) => {
    try {
        const { store_id } = req.params;
        const sales = await Sale.findAll({
            where: { store_id },
            order: [['createdAt', 'DESC']]
        });
        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: "Xatolik", error: error.message });
    }
};

exports.getWeeklySales = async (req, res) => {
    try {
        const { store_id } = req.params;
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const sales = await Sale.findAll({
            where: {
                store_id,
                createdAt: { [Op.gte]: sevenDaysAgo }
            },
            attributes: [
                [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
                [sequelize.fn('SUM', sequelize.col('total_price')), 'total']
            ],
            group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
            order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
        });

        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: "Grafik ma'lumotlarida xato" });
    }
};