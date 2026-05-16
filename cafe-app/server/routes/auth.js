const express = require('express');
const jwt = require('jsonwebtoken');
const supabase = require('../config/db');
const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Vui lòng nhập tài khoản và mật khẩu' });
    }
    try {
        const { data, error } = await supabase
            .from('TAIKHOAN')
            .select('*, NHANVIEN(*)')
            .eq('TenDangNhap', username)
            .single();

        if (error || !data) {
            return res.status(401).json({ error: 'Tài khoản không tồn tại' });
        }
        if (data.MatKhau !== password) {
            return res.status(401).json({ error: 'Mật khẩu không đúng' });
        }

        const token = jwt.sign(
            {
                username: data.TenDangNhap,
                role: data.QuyenHan,
                maNV: data.MaNV,
                hoTen: data.NHANVIEN?.HoTen || '',
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                username: data.TenDangNhap,
                role: data.QuyenHan,
                maNV: data.MaNV,
                hoTen: data.NHANVIEN?.HoTen || '',
            },
        });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// GET /api/auth/me
router.get('/me', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token' });
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ user: decoded });
    } catch {
        res.status(401).json({ error: 'Token invalid' });
    }
});

module.exports = router;
