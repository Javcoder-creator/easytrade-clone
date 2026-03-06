const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://postgres:2005@localhost:5432/easytrade_db', {
  dialect: 'postgres',
  logging: false, // Konsolda ortiqcha yozuvlar chiqmasligi uchun (ixtiyoriy)
  dialectOptions: process.env.DATABASE_URL ? {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  } : {}
});

module.exports = sequelize;