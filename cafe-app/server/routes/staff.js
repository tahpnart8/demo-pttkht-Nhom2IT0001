const express = require('express');
const supabase = require('../config/db');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.get('/', authMiddleware(['admin']), async (req, res) => {
    try {
        const { data, error } = await supabase.from('NHANVIEN').select('*, TAIKHOAN(TenDangNhap, QuyenHan)').order('MaNV');
        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
    } catch (err) { res.status(500).json({ error: 'Lỗi server' }); }
});

router.get('/:id', authMiddleware(['admin']), async (req, res) => {
    try {
        const { data, error } = await supabase.from('NHANVIEN').select('*, TAIKHOAN(TenDangNhap, QuyenHan)').eq('MaNV', req.params.id).single();
        if (error) return res.status(404).json({ error: 'Không tìm thấy' });
        res.json(data);
    } catch (err) { res.status(500).json({ error: 'Lỗi server' }); }
});

router.post('/', authMiddleware(['admin']), async (req, res) => {
    const { MaNV, HoTen, SoDienThoai, ViTri, TenDangNhap, MatKhau, QuyenHan } = req.body;
    try {
        const { error: nvErr } = await supabase.from('NHANVIEN').insert([{ MaNV, HoTen, SoDienThoai, ViTri }]);
        if (nvErr) return res.status(400).json({ error: nvErr.message });
        if (TenDangNhap) {
            await supabase.from('TAIKHOAN').insert([{ TenDangNhap, MatKhau: MatKhau || '123456', QuyenHan: QuyenHan || 'phucvu', MaNV }]);
        }
        res.status(201).json({ MaNV, message: 'Đã thêm' });
    } catch (err) { res.status(500).json({ error: 'Lỗi server' }); }
});

router.put('/:id', authMiddleware(['admin']), async (req, res) => {
    const { HoTen, SoDienThoai, ViTri, TrangThai } = req.body;
    try {
        const { data, error } = await supabase.from('NHANVIEN').update({ HoTen, SoDienThoai, ViTri, TrangThai }).eq('MaNV', req.params.id).select();
        if (error) return res.status(400).json({ error: error.message });
        res.json(data[0]);
    } catch (err) { res.status(500).json({ error: 'Lỗi server' }); }
});

router.delete('/:id', authMiddleware(['admin']), async (req, res) => {
    try {
        await supabase.from('TAIKHOAN').delete().eq('MaNV', req.params.id);
        const { error } = await supabase.from('NHANVIEN').delete().eq('MaNV', req.params.id);
        if (error) return res.status(400).json({ error: error.message });
        res.json({ message: 'Đã xóa' });
    } catch (err) { res.status(500).json({ error: 'Lỗi server' }); }
});

module.exports = router;
