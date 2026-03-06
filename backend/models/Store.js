// backend/models/Store.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Store = sequelize.define('Store', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    ownerName: {
        type: DataTypes.STRING
    },
    address: {
        type: DataTypes.STRING
    }
});

module.exports = Store;