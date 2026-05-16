const express = require('express');
const supabase = require('../config/db');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// POST /api/payments — Xác nhận thanh toán
router.post('/', authMiddleware(['thungan', 'admin']), async (req, res) => {
    const { MaHD, SoTien, PhuongThuc, MaNV } = req.body;
    try {
        const MaThanhToan = 'TT' + Date.now().toString().slice(-8);
        const { data, error } = await supabase.from('THANHTOAN').insert([{ MaThanhToan, MaHD, SoTien, PhuongThuc, MaNV }]).select();
        if (error) return res.status(400).json({ error: error.message });

        // Giải phóng bàn
        const { data: orders } = await supabase.from('DONHANG').select('MaBan').eq('MaHD', MaHD);
        if (orders?.length) {
            const tables = [...new Set(orders.map(o => o.MaBan))];
            for (const t of tables) {
                // Kiểm tra còn order chưa TT không
                const { data: remaining } = await supabase.from('DONHANG').select('MaDH').eq('MaBan', t).is('MaHD', null);
                if (!remaining?.length) await supabase.from('BAN').update({ TrangThai: 'Trong' }).eq('MaBan', t);
            }
        }
        res.status(201).json(data[0]);
    } catch (err) { res.status(500).json({ error: 'Lỗi server' }); }
});

module.exports = router;
