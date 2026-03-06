const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Store = require('./Store');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING, // Masalan: iPhone 13 Silicone Case
        allowNull: false
    },
    sku: {
        type: DataTypes.STRING, // Shtrix-kod uchun
        unique: true
    },
    price_buy: {
        type: DataTypes.DECIMAL(10, 2), // Sotib olingan narxi
        defaultValue: 0
    },
    price_sell: {
        type: DataTypes.DECIMAL(10, 2), // Sotilish narxi
        allowNull: false
    },
    stock_quantity: {
        type: DataTypes.INTEGER, // Ombor dagi soni
        defaultValue: 0
    }
});

// Bog'liqlik: Har bir tovar bitta do'konga tegishli
Store.hasMany(Product, { foreignKey: 'store_id' });
Product.belongsTo(Store, { foreignKey: 'store_id' });

module.exports = Product;