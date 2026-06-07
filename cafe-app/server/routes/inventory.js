const express = require('express');
const supabase = require('../config/db');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// GET /api/inventory - Lấy danh sách nguyên liệu
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('NGUYENLIEU')
            .select('*');
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/inventory/nhap - Nhập kho thủ công
router.post('/nhap', authMiddleware(['admin']), async (req, res) => {
    const { MaPN, MaNCC, TongTienNhap, ChiTiet } = req.body;
    try {
        const MaNV = req.user.MaNV;
        const { data: pnData, error: pnErr } = await supabase
            .from('PHIEUNHAP')
            .insert([{ MaPN, MaNV, MaNCC, TongTienNhap }])
            .select();
        if (pnErr) throw pnErr;

        for (const item of ChiTiet) {
            await supabase.from('CHITIETPHIEUNHAP').insert([{ MaPN, MaNL: item.MaNL, SoLuong: item.SoLuong, DonGiaNhap: item.DonGiaNhap }]);
            const { data: nl } = await supabase.from('NGUYENLIEU').select('SoLuongTon').eq('MaNL', item.MaNL).single();
            await supabase.from('NGUYENLIEU').update({ SoLuongTon: nl.SoLuongTon + item.SoLuong }).eq('MaNL', item.MaNL);
        }
        res.status(201).json(pnData[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/inventory/xuat - Xuất kho thủ công
router.post('/xuat', authMiddleware(['admin', 'barista']), async (req, res) => {
    const { MaPX, LyDo, ChiTiet } = req.body;
    try {
        const MaNV = req.user.MaNV;
        const { data: pxData, error: pxErr } = await supabase
            .from('PHIEUXUAT')
            .insert([{ MaPX, LyDo, MaNV }])
            .select();
        if (pxErr) throw pxErr;

        for (const item of ChiTiet) {
            await supabase.from('CHITIETPHIEUXUAT').insert([{ MaPX, MaNL: item.MaNL, SoLuong: item.SoLuong }]);
            const { data: nl } = await supabase.from('NGUYENLIEU').select('SoLuongTon').eq('MaNL', item.MaNL).single();
            const newStock = Math.max(0, nl.SoLuongTon - item.SoLuong);
            await supabase.from('NGUYENLIEU').update({ SoLuongTon: newStock }).eq('MaNL', item.MaNL);
            
            // Auto lock MON if stock = 0
            if (newStock === 0) {
                const { data: congThuc } = await supabase.from('CONGTHUC').select('MaMon').eq('MaNL', item.MaNL);
                if (congThuc && congThuc.length > 0) {
                    const monIds = congThuc.map(c => c.MaMon);
                    await supabase.from('MON').update({ TrangThai: 'HetMon' }).in('MaMon', monIds);
                }
            }
        }
        res.status(201).json(pxData[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/inventory/ncc - Lấy danh sách NCC
router.get('/ncc', async (req, res) => {
    try {
        const { data, error } = await supabase.from('NCC').select('*');
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
