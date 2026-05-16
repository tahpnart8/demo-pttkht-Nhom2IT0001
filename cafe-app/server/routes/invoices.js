const express = require('express');
const supabase = require('../config/db');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.get('/', authMiddleware(['thungan', 'admin']), async (req, res) => {
    try {
        const query = supabase.from('HOADON').select('*, NHANVIEN(HoTen), DONHANG(MaDH, MaBan, BAN(TenBan))').order('ThoiGianXuat', { ascending: false });
        if (req.query.date) query.gte('ThoiGianXuat', req.query.date + 'T00:00:00').lte('ThoiGianXuat', req.query.date + 'T23:59:59');
        if (req.query.id) query.eq('MaHD', req.query.id);
        const { data, error } = await query;
        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
    } catch (err) { res.status(500).json({ error: 'Lỗi server' }); }
});

router.get('/:id', authMiddleware(['thungan', 'admin']), async (req, res) => {
    try {
        const { data, error } = await supabase.from('HOADON').select('*, NHANVIEN(HoTen), DONHANG(*, CHITIETDONHANG(*, MON(TenMon)))').eq('MaHD', req.params.id).single();
        if (error) return res.status(404).json({ error: 'Không tìm thấy' });
        res.json(data);
    } catch (err) { res.status(500).json({ error: 'Lỗi server' }); }
});

// POST /api/invoices — Tạo hóa đơn từ 1 hoặc nhiều đơn hàng
router.post('/', authMiddleware(['thungan', 'admin']), async (req, res) => {
    const { orderIds, MaNV } = req.body;
    try {
        // Tính tổng tiền
        let tongTien = 0;
        for (const id of orderIds) {
            const { data } = await supabase.from('CHITIETDONHANG').select('SoLuong, DonGia').eq('MaDH', id);
            if (data) tongTien += data.reduce((sum, d) => sum + d.SoLuong * d.DonGia, 0);
        }
        const MaHD = 'HD' + Date.now().toString().slice(-8);
        const { error } = await supabase.from('HOADON').insert([{ MaHD, TongTien: tongTien, MaNV }]);
        if (error) return res.status(400).json({ error: error.message });

        // Gán MaHD cho các đơn hàng
        for (const id of orderIds) {
            await supabase.from('DONHANG').update({ MaHD }).eq('MaDH', id);
        }
        res.status(201).json({ MaHD, TongTien: tongTien });
    } catch (err) { res.status(500).json({ error: 'Lỗi server' }); }
});

router.delete('/:id', authMiddleware(['admin']), async (req, res) => {
    try {
        await supabase.from('DONHANG').update({ MaHD: null }).eq('MaHD', req.params.id);
        const { error } = await supabase.from('HOADON').delete().eq('MaHD', req.params.id);
        if (error) return res.status(400).json({ error: error.message });
        res.json({ message: 'Đã xóa' });
    } catch (err) { res.status(500).json({ error: 'Lỗi server' }); }
});

module.exports = router;
