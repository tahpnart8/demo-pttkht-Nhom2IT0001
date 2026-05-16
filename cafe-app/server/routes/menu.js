const express = require('express');
const supabase = require('../config/db');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// GET /api/menu — Danh sách nhóm menu + món
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('MENU')
            .select('*, MON(*)');
        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// GET /api/menu/items — Tất cả món
router.get('/items', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('MON')
            .select('*, MENU(TenMenu)');
        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// POST /api/menu/items — Thêm món (Quản lý)
router.post('/items', authMiddleware(['admin']), async (req, res) => {
    const { MaMon, TenMon, DonGia, HinhAnh, TrangThai, MaMenu } = req.body;
    try {
        const { data, error } = await supabase
            .from('MON')
            .insert([{ MaMon, TenMon, DonGia, HinhAnh, TrangThai: TrangThai || 'ConMon', MaMenu }])
            .select();
        if (error) return res.status(400).json({ error: error.message });
        res.status(201).json(data[0]);
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// PUT /api/menu/items/:id — Sửa món
router.put('/items/:id', authMiddleware(['admin']), async (req, res) => {
    const { TenMon, DonGia, HinhAnh, TrangThai, MaMenu } = req.body;
    try {
        const { data, error } = await supabase
            .from('MON')
            .update({ TenMon, DonGia, HinhAnh, TrangThai, MaMenu })
            .eq('MaMon', req.params.id)
            .select();
        if (error) return res.status(400).json({ error: error.message });
        res.json(data[0]);
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// DELETE /api/menu/items/:id — Xóa món
router.delete('/items/:id', authMiddleware(['admin']), async (req, res) => {
    try {
        const { error } = await supabase
            .from('MON')
            .delete()
            .eq('MaMon', req.params.id);
        if (error) return res.status(400).json({ error: error.message });
        res.json({ message: 'Đã xóa' });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// PATCH /api/menu/items/:id/status — Toggle trạng thái
router.patch('/items/:id/status', authMiddleware(['admin']), async (req, res) => {
    const { TrangThai } = req.body;
    try {
        const { data, error } = await supabase
            .from('MON')
            .update({ TrangThai })
            .eq('MaMon', req.params.id)
            .select();
        if (error) return res.status(400).json({ error: error.message });
        res.json(data[0]);
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

module.exports = router;
