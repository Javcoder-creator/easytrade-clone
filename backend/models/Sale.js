const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Store = require('./Store');

const Sale = sequelize.define('Sale', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    items: {
        type: DataTypes.JSONB, // Sotilgan tovarlar ro'yxati (JSON formatda)
        allowNull: false
    },
    payment_type: {
        type: DataTypes.STRING, // 'cash' yoki 'card'
        defaultValue: 'cash'
    }
});

// Bog'liqlik
Store.hasMany(Sale, { foreignKey: 'store_id' });
Sale.belongsTo(Store, { foreignKey: 'store_id' });

module.exports = Sale;