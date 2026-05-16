const express = require('express');
const supabase = require('../config/db');
const router = express.Router();

// GET /api/cart/:tableId
router.get('/:tableId', async (req, res) => {
    try {
        const { data, error } = await supabase.from('GIOHANG').select('*, CHITIETGIOHANG(*, MON(TenMon, DonGia, HinhAnh))').eq('MaBan', req.params.tableId).single();
        if (error || !data) return res.json({ items: [] });
        res.json({ MaGio: data.MaGio, items: data.CHITIETGIOHANG || [] });
    } catch (err) { res.status(500).json({ error: 'Lỗi server' }); }
});

// POST /api/cart/:tableId/items
router.post('/:tableId/items', async (req, res) => {
    const { MaMon, SoLuong, GhiChu } = req.body;
    try {
        // Tìm hoặc tạo giỏ hàng
        let { data: cart } = await supabase.from('GIOHANG').select('MaGio').eq('MaBan', req.params.tableId).single();
        if (!cart) {
            const MaGio = 'GH' + Date.now().toString().slice(-8);
            const { data: newCart } = await supabase.from('GIOHANG').insert([{ MaGio, MaBan: req.params.tableId }]).select().single();
            cart = newCart;
        }

        // Kiểm tra món đã có chưa
        const { data: existing } = await supabase.from('CHITIETGIOHANG').select('*').eq('MaGio', cart.MaGio).eq('MaMon', MaMon).single();
        if (existing) {
            const { data } = await supabase.from('CHITIETGIOHANG').update({ SoLuong: existing.SoLuong + (SoLuong || 1), GhiChu }).eq('MaGio', cart.MaGio).eq('MaMon', MaMon).select();
            return res.json(data[0]);
        }

        const { data, error } = await supabase.from('CHITIETGIOHANG').insert([{ MaGio: cart.MaGio, MaMon, SoLuong: SoLuong || 1, GhiChu }]).select();
        if (error) return res.status(400).json({ error: error.message });
        res.status(201).json(data[0]);
    } catch (err) { res.status(500).json({ error: 'Lỗi server: ' + err.message }); }
});

// PUT /api/cart/:tableId/items/:itemId — Sửa SL
router.put('/:tableId/items/:itemId', async (req, res) => {
    try {
        const { data: cart } = await supabase.from('GIOHANG').select('MaGio').eq('MaBan', req.params.tableId).single();
        if (!cart) return res.status(404).json({ error: 'Giỏ hàng không tồn tại' });
        const { data, error } = await supabase.from('CHITIETGIOHANG').update({ SoLuong: req.body.SoLuong, GhiChu: req.body.GhiChu }).eq('MaGio', cart.MaGio).eq('MaMon', req.params.itemId).select();
        if (error) return res.status(400).json({ error: error.message });
        res.json(data[0]);
    } catch (err) { res.status(500).json({ error: 'Lỗi server' }); }
});

// DELETE /api/cart/:tableId/items/:itemId
router.delete('/:tableId/items/:itemId', async (req, res) => {
    try {
        const { data: cart } = await supabase.from('GIOHANG').select('MaGio').eq('MaBan', req.params.tableId).single();
        if (!cart) return res.status(404).json({ error: 'Giỏ hàng không tồn tại' });
        const { error } = await supabase.from('CHITIETGIOHANG').delete().eq('MaGio', cart.MaGio).eq('MaMon', req.params.itemId);
        if (error) return res.status(400).json({ error: error.message });
        // Nếu hết item thì xóa giỏ
        const { data: remaining } = await supabase.from('CHITIETGIOHANG').select('MaMon').eq('MaGio', cart.MaGio);
        if (!remaining?.length) await supabase.from('GIOHANG').delete().eq('MaGio', cart.MaGio);
        res.json({ message: 'Đã xóa' });
    } catch (err) { res.status(500).json({ error: 'Lỗi server' }); }
});

module.exports = router;
