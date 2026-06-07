const express = require('express');
const supabase = require('../config/db');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// GET /api/reports/doanhthu
router.get('/doanhthu', authMiddleware(['admin', 'quản lý']), async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Nhánh A: Doanh thu từ Hóa đơn
        let hQuery = supabase.from('HOADON').select('TongTien, ThoiGianXuat');
        if (startDate && endDate) {
            hQuery = hQuery.gte('ThoiGianXuat', startDate).lte('ThoiGianXuat', endDate);
        }
        const { data: hoadon, error: hdErr } = await hQuery;
        if (hdErr) throw hdErr;

        // Nhánh B: Chi phí từ Phiếu nhập
        let pQuery = supabase.from('PHIEUNHAP').select('TongTienNhap, NgayNhap');
        if (startDate && endDate) {
            pQuery = pQuery.gte('NgayNhap', startDate).lte('NgayNhap', endDate);
        }
        const { data: phieunhap, error: pnErr } = await pQuery;
        if (pnErr) throw pnErr;

        const totalRevenue = hoadon.reduce((sum, item) => sum + item.TongTien, 0);
        const totalCost = phieunhap.reduce((sum, item) => sum + item.TongTienNhap, 0);
        const profit = totalRevenue - totalCost;

        res.json({
            doanhThu: totalRevenue,
            chiPhiNhap: totalCost,
            loiNhuan: profit,
            chiTietDoanhThu: hoadon, // Để Frontend tự vẽ biểu đồ theo thời gian
            chiTietChiPhi: phieunhap
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/reports/bestseller
router.get('/bestseller', authMiddleware(['admin', 'quản lý']), async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        // Lấy chi tiết đơn hàng (thông qua đơn hàng để có thời gian)
        // Vì Supabase khó JOIN phức tạp kèm filter, ta lấy tất cả DONHANG trong kỳ, sau đó lấy CHITIET
        let dQuery = supabase.from('DONHANG').select('MaDH, ThoiGianDat');
        if (startDate && endDate) {
            dQuery = dQuery.gte('ThoiGianDat', startDate).lte('ThoiGianDat', endDate);
        }
        const { data: donhang, error: dhErr } = await dQuery;
        if (dhErr) throw dhErr;

        const dhIds = donhang.map(d => d.MaDH);
        
        let ctdh = [];
        if (dhIds.length > 0) {
            const { data: ctData, error: ctErr } = await supabase
                .from('CHITIETDONHANG')
                .select('MaMon, SoLuong, MON(TenMon)')
                .in('MaDH', dhIds);
            if (ctErr) throw ctErr;
            ctdh = ctData;
        }

        const sales = {};
        ctdh.forEach(item => {
            if (!sales[item.MaMon]) {
                sales[item.MaMon] = { TenMon: item.MON?.TenMon || 'Unknown', SoLuong: 0 };
            }
            sales[item.MaMon].SoLuong += item.SoLuong;
        });

        const result = Object.values(sales).sort((a, b) => b.SoLuong - a.SoLuong).slice(0, 5); // Top 5
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/reports/haohut
router.get('/haohut', authMiddleware(['admin', 'quản lý']), async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        let pQuery = supabase.from('PHIEUKIEMKHO').select('MaPKK, NgayKiem, TrangThai, NHANVIEN(HoTen)');
        if (startDate && endDate) {
            pQuery = pQuery.gte('NgayKiem', startDate).lte('NgayKiem', endDate);
        }
        const { data: phieukiem, error: pkErr } = await pQuery;
        if (pkErr) throw pkErr;

        const pkIds = phieukiem.map(p => p.MaPKK);
        let chitiet = [];
        if (pkIds.length > 0) {
            const { data: ctData, error: ctErr } = await supabase
                .from('CHITIETKIEMKHO')
                .select('*, NGUYENLIEU(TenNL, DonViTinh)')
                .in('MaPKK', pkIds);
            if (ctErr) throw ctErr;
            chitiet = ctData;
        }

        res.json({ phieukiem, chitiet });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/reports/xuatnhap
router.get('/xuatnhap', authMiddleware(['admin', 'quản lý']), async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Lấy phiếu nhập
        let pnQuery = supabase.from('PHIEUNHAP').select('MaPN, NgayNhap');
        if (startDate && endDate) {
            pnQuery = pnQuery.gte('NgayNhap', startDate).lte('NgayNhap', endDate);
        }
        const { data: phieunhap, error: pnErr } = await pnQuery;
        if (pnErr) throw pnErr;
        const pnIds = phieunhap.map(p => p.MaPN);

        let ctNhap = [];
        if (pnIds.length > 0) {
            const { data } = await supabase.from('CHITIETPHIEUNHAP').select('*, NGUYENLIEU(TenNL)').in('MaPN', pnIds);
            ctNhap = data || [];
        }

        // Lấy phiếu xuất
        let pxQuery = supabase.from('PHIEUXUAT').select('MaPX, NgayXuat, LyDo');
        if (startDate && endDate) {
            pxQuery = pxQuery.gte('NgayXuat', startDate).lte('NgayXuat', endDate);
        }
        const { data: phieuxuat, error: pxErr } = await pxQuery;
        if (pxErr) throw pxErr;
        const pxIds = phieuxuat.map(p => p.MaPX);

        let ctXuat = [];
        if (pxIds.length > 0) {
            const { data } = await supabase.from('CHITIETPHIEUXUAT').select('*, NGUYENLIEU(TenNL)').in('MaPX', pxIds);
            
            // Nối thêm trường LyDo vào chi tiết xuất
            ctXuat = (data || []).map(ctx => {
                const px = phieuxuat.find(p => p.MaPX === ctx.MaPX);
                return { ...ctx, LyDo: px ? px.LyDo : '' };
            });
        }

        res.json({ nhap: ctNhap, xuat: ctXuat });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
