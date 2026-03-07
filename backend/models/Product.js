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
        type: DataTypes.STRING,
        allowNull: false
    },
    sku: {
        type: DataTypes.STRING,
        // UNIQUE cheklovini olib tashladik, chunki bo'sh (null) qiymatlar 
        // bir marta tushgandan keyin ikkinchi marta xatolik berayotgan edi
        unique: false, 
        allowNull: true
    },
    price_buy: {
        type: DataTypes.DECIMAL(10, 2),
        // Frontend'dan supply_price o'rniga keladigan qiymat shu yerga tushadi
        defaultValue: 0
    },
    price_sell: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    stock_quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    // Bazadagi jadvallarni o'chirishda xatolik bermasligi uchun mantiqiy bog'liqliklar
    timestamps: true // Qachon yaratilganini bilish uchun (createdAt, updatedAt)
});

// Bog'liqliklar:
// onDelete: 'CASCADE' - Do'kon o'chirilsa, unga tegishli hamma tovarlar ham o'chib ketadi
Store.hasMany(Product, { foreignKey: 'store_id', onDelete: 'CASCADE' });
Product.belongsTo(Store, { foreignKey: 'store_id' });

module.exports = Product;