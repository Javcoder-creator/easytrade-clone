const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Entry = sequelize.define('Entry', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    product_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    supply_price: { // Kelish narxi
        type: DataTypes.DECIMAL,
        allowNull: false
    }
});

module.exports = Entry;