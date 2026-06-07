const express = require('express');
const supabase = require('../config/db');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// GET /api/reports/doanhthu
router.get('/doanhthu', authMiddleware(['admin']), async (req, res) => {
    try {
        const { data: hoadon, error: hdErr } = await supabase.from('HOADON').select('TongTien');
        if (hdErr) throw hdErr;
        
        const { data: phieunhap, error: pnErr } = await supabase.from('PHIEUNHAP').select('TongTienNhap');
        if (pnErr) throw pnErr;
        
        const totalRevenue = hoadon.reduce((sum, item) => sum + item.TongTien, 0);
        const totalCost = phieunhap.reduce((sum, item) => sum + item.TongTienNhap, 0);
        const profit = totalRevenue - totalCost;
        
        res.json({
            doanhThu: totalRevenue,
            chiPhiNhap: totalCost,
            loiNhuan: profit
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/reports/bestseller
router.get('/bestseller', authMiddleware(['admin']), async (req, res) => {
    try {
        const { data: ctdh, error } = await supabase.from('CHITIETDONHANG').select('MaMon, SoLuong, MON(TenMon)');
        if (error) throw error;
        
        const sales = {};
        ctdh.forEach(item => {
            if (!sales[item.MaMon]) {
                sales[item.MaMon] = { TenMon: item.MON?.TenMon || 'Unknown', SoLuong: 0 };
            }
            sales[item.MaMon].SoLuong += item.SoLuong;
        });
        
        const result = Object.values(sales).sort((a, b) => b.SoLuong - a.SoLuong);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/reports/lichsukho - Lấy tất cả lịch sử xuất/nhập/kiểm kho
router.get('/lichsukho', authMiddleware(['admin']), async (req, res) => {
    try {
        // Mock returning multiple types of receipts (for real app, would union queries)
        const { data: nhap } = await supabase.from('PHIEUNHAP').select('*, NHANVIEN(HoTen), NCC(TenNCC)');
        const { data: xuat } = await supabase.from('PHIEUXUAT').select('*, NHANVIEN(HoTen)');
        const { data: kiem } = await supabase.from('PHIEUKIEMKHO').select('*, NHANVIEN(HoTen)');
        
        res.json({
            phieuNhap: nhap || [],
            phieuXuat: xuat || [],
            phieuKiem: kiem || []
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
