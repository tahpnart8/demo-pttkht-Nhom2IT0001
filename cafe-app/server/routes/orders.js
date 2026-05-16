const express = require('express');
const supabase = require('../config/db');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// GET /api/orders
router.get('/', async (req, res) => {
    try {
        const query = supabase.from('DONHANG').select('*, BAN(TenBan), NHANVIEN(HoTen), CHITIETDONHANG(*, MON(TenMon))').order('ThoiGianDat', { ascending: false });
        if (req.query.status) query.eq('TrangThaiOrder', req.query.status);
        if (req.query.table) query.eq('MaBan', req.query.table);
        const { data, error } = await query;
        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
    } catch (err) { res.status(500).json({ error: 'Lỗi server' }); }
});

// GET /api/orders/:id
router.get('/:id', async (req, res) => {
    try {
        const { data, error } = await supabase.from('DONHANG').select('*, BAN(TenBan), NHANVIEN(HoTen), CHITIETDONHANG(*, MON(TenMon, HinhAnh))').eq('MaDH', req.params.id).single();
        if (error) return res.status(404).json({ error: 'Không tìm thấy' });
        res.json(data);
    } catch (err) { res.status(500).json({ error: 'Lỗi server' }); }
});

// POST /api/orders — Tạo order từ giỏ hàng
router.post('/', async (req, res) => {
    const { MaBan } = req.body;
    try {
        // Lấy giỏ hàng
        const { data: cart } = await supabase.from('GIOHANG').select('*, CHITIETGIOHANG(*, MON(DonGia))').eq('MaBan', MaBan).single();
        if (!cart || !cart.CHITIETGIOHANG?.length) return res.status(400).json({ error: 'Giỏ hàng trống' });

        // Tạo mã đơn hàng
        const MaDH = 'DH' + Date.now().toString().slice(-8);
        const { error: orderErr } = await supabase.from('DONHANG').insert([{ MaDH, MaBan, TrangThaiOrder: 'Cho' }]);
        if (orderErr) return res.status(400).json({ error: orderErr.message });

        // Tạo chi tiết
        const details = cart.CHITIETGIOHANG.map(item => ({
            MaDH, MaMon: item.MaMon, SoLuong: item.SoLuong, DonGia: item.MON.DonGia, GhiChu: item.GhiChu
        }));
        await supabase.from('CHITIETDONHANG').insert(details);

        // Cập nhật bàn
        await supabase.from('BAN').update({ TrangThai: 'DangCoKhach' }).eq('MaBan', MaBan);

        // Xóa giỏ hàng
        await supabase.from('CHITIETGIOHANG').delete().eq('MaGio', cart.MaGio);
        await supabase.from('GIOHANG').delete().eq('MaGio', cart.MaGio);

        res.status(201).json({ MaDH, message: 'Đặt hàng thành công' });
    } catch (err) { res.status(500).json({ error: 'Lỗi server: ' + err.message }); }
});

// PATCH /api/orders/:id/status — Phân quyền chuyển trạng thái
// Barista: Chờ → Đang làm, Đang làm → Hoàn thành
// Phục vụ: Hoàn thành → Đã giao
// Admin: tất cả
router.patch('/:id/status', authMiddleware(['barista', 'phucvu', 'admin']), async (req, res) => {
    const { TrangThaiOrder } = req.body;
    const role = req.user.role;

    // Lấy trạng thái hiện tại
    const { data: current } = await supabase.from('DONHANG').select('TrangThaiOrder').eq('MaDH', req.params.id).single();
    if (!current) return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });

    const from = current.TrangThaiOrder;
    const to = TrangThaiOrder;

    // Kiểm tra quyền chuyển trạng thái
    if (role !== 'admin') {
        if (role === 'barista' && !((from === 'Cho' && to === 'DangLam') || (from === 'DangLam' && to === 'HoanThanh'))) {
            return res.status(403).json({ error: 'Barista chỉ được chuyển: Chờ → Đang làm → Hoàn thành' });
        }
        if (role === 'phucvu' && !(from === 'HoanThanh' && to === 'DaGiao')) {
            return res.status(403).json({ error: 'Phục vụ chỉ được chuyển: Hoàn thành → Đã giao' });
        }
    }

    try {
        const { data, error } = await supabase.from('DONHANG').update({ TrangThaiOrder: to }).eq('MaDH', req.params.id).select();
        if (error) return res.status(400).json({ error: error.message });
        res.json(data[0]);
    } catch (err) { res.status(500).json({ error: 'Lỗi server' }); }
});

// PUT /api/orders/:id — Sửa order (thu ngân)
router.put('/:id', authMiddleware(['thungan', 'admin']), async (req, res) => {
    try {
        const { data, error } = await supabase.from('DONHANG').update(req.body).eq('MaDH', req.params.id).select();
        if (error) return res.status(400).json({ error: error.message });
        res.json(data[0]);
    } catch (err) { res.status(500).json({ error: 'Lỗi server' }); }
});

// DELETE /api/orders/:id
router.delete('/:id', authMiddleware(['admin']), async (req, res) => {
    try {
        await supabase.from('CHITIETDONHANG').delete().eq('MaDH', req.params.id);
        const { error } = await supabase.from('DONHANG').delete().eq('MaDH', req.params.id);
        if (error) return res.status(400).json({ error: error.message });
        res.json({ message: 'Đã xóa' });
    } catch (err) { res.status(500).json({ error: 'Lỗi server' }); }
});

module.exports = router;
