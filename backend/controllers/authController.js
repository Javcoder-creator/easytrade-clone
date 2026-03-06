const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { username, password, role } = req.body;
        const user = await User.create({ username, password, role });
        res.status(201).json({ message: "Foydalanuvchi yaratildi" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ where: { username } });
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Login yoki parol xato!" });
        }

        // Token yaratish (7 kun amal qiladi)
        const token = jwt.sign({ id: user.id, role: user.role }, 'MAXFIY_KALIT', { expiresIn: '7d' });
        
        res.json({ token, user: { username: user.username, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};