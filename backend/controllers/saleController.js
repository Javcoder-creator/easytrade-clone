const Sale = require('../models/Sale');
const Product = require('../models/Product');
const { Op } = require('sequelize');
const sequelize = require('../config/db');

// 1. YANGI SOTUVNI AMALGA OSHIRISH
exports.createSale = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { store_id, items, total_price } = req.body;

        const itemsWithSupplyPrice = [];
        
        for (let item of items) {
            const product = await Product.findByPk(item.id);
            if (!product || product.stock_quantity < item.qty) {
                throw new Error(`${item.name} omborda yetarli emas!`);
            }

            // Ombor qoldig'ini kamaytirish
            product.stock_quantity -= item.qty;
            await product.save({ transaction: t });

            // FOYDANI HISOBLASH UCHUN: supply_price o'rniga price_buy ishlatamiz
            itemsWithSupplyPrice.push({
                ...item,
                supply_price: product.price_buy || 0 // TO'G'IRLANDI: price_buy bazadagi nom
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

// 2. DASHBOARD UCHUN STATISTIKA
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
            const saleTotal = parseFloat(sale.total_price) || 0;
            totalRevenue += saleTotal;
            
            if (sale.items && Array.isArray(sale.items)) {
                sale.items.forEach(item => {
                    const sellPrice = parseFloat(item.price_sell || item.price) || 0;
                    const supplyPrice = parseFloat(item.supply_price) || 0;
                    const quantity = parseInt(item.qty) || 0;

                    // Foydani hisoblash: Sotish narxi - Tannarx
                    if (supplyPrice > 0) {
                        totalProfit += (sellPrice - supplyPrice) * quantity;
                    }
                });
            }
        });

        res.json({
            totalRevenue: Math.round(totalRevenue),
            totalProfit: Math.round(totalProfit),
            totalSalesCount: sales.length
        });
    } catch (error) {
        res.status(500).json({ message: "Statistikada xato", error: error.message });
    }
};

// 3. BARCHA SOTUVLAR TARIXI
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

// 4. HAFTALIK GRAFIK UCHUN
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