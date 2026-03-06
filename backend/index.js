const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const storeRoutes = require('./routes/storeRoutes');
const productRoutes = require('./routes/productRoutes');
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/sales', require('./routes/saleRoutes'));
// Marshrutlarni ulash
app.use('/api/products', productRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/auth', require('./routes/authRoutes'));
sequelize.sync({ alter: true })
    .then(() => console.log('Bazaga ulanish va jadvallar tayyor! ✅'))
    .catch(err => console.log('Xatolik: ' + err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server ${PORT}-portda yondi! 🔥`));