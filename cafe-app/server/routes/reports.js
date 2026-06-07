const express = require('express');
const supabase = require('../config/db');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

async function fetchAllData(table, selectStr, dateCol, start, end) {
    let allData = [];
    let page = 0;
    const limit = 1000;
    while(true) {
        let q = supabase.from(table).select(selectStr).range(page * limit, (page + 1) * limit - 1);
        if (dateCol && start && end) q = q.gte(dateCol, start).lte(dateCol, end);
        const { data, error } = await q;
        if (error) throw error;
        allData = allData.concat(data);
        if (data.length < limit) break;
        page++;
    }
    return allData;
}

async function fetchDetailsInChunks(table, selectStr, filterCol, idsArr) {
    let allData = [];
    for (let i = 0; i < idsArr.length; i += 200) {
        const chunk = idsArr.slice(i, i + 200);
        let page = 0;
        while(true) {
            const { data, error } = await supabase.from(table).select(selectStr).in(filterCol, chunk).range(page*1000, (page+1)*1000-1);
            if (error) throw error;
            allData = allData.concat(data);
            if (data.length < 1000) break;
            page++;
        }
    }
    return allData;
}

// GET /api/reports/doanhthu
router.get('/doanhthu', authMiddleware(['admin', 'quản lý']), async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Nhánh A: Doanh thu từ Hóa đơn
        const hoadon = await fetchAllData('HOADON', 'TongTien, ThoiGianXuat', 'ThoiGianXuat', startDate, endDate);

        // Nhánh B: Chi phí từ Phiếu nhập
        const phieunhap = await fetchAllData('PHIEUNHAP', 'TongTienNhap, NgayNhap', 'NgayNhap', startDate, endDate);

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
        const donhang = await fetchAllData('DONHANG', 'MaDH, ThoiGianDat', 'ThoiGianDat', startDate, endDate);

        const dhIds = donhang.map(d => d.MaDH);
        let ctdh = [];
        if (dhIds.length > 0) {
            ctdh = await fetchDetailsInChunks('CHITIETDONHANG', 'MaMon, SoLuong, MON(TenMon)', 'MaDH', dhIds);
        }

        const sales = {};
        ctdh.forEach(item => {
            if (!sales[item.MaMon]) sales[item.MaMon] = { TenMon: item.MON?.TenMon || 'Unknown', SoLuong: 0 };
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
        const phieukiem = await fetchAllData('PHIEUKIEMKHO', 'MaPKK, NgayKiem, TrangThai, NHANVIEN(HoTen)', 'NgayKiem', startDate, endDate);

        const pkIds = phieukiem.map(p => p.MaPKK);
        let chitiet = [];
        if (pkIds.length > 0) {
            chitiet = await fetchDetailsInChunks('CHITIETKIEMKHO', '*, NGUYENLIEU(TenNL, DonViTinh)', 'MaPKK', pkIds);
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
        const phieunhap = await fetchAllData('PHIEUNHAP', 'MaPN, NgayNhap', 'NgayNhap', startDate, endDate);
        const pnIds = phieunhap.map(p => p.MaPN);
        let ctNhap = [];
        if (pnIds.length > 0) ctNhap = await fetchDetailsInChunks('CHITIETPHIEUNHAP', '*, NGUYENLIEU(TenNL)', 'MaPN', pnIds);

        // Lấy phiếu xuất
        const phieuxuat = await fetchAllData('PHIEUXUAT', 'MaPX, NgayXuat, LyDo', 'NgayXuat', startDate, endDate);
        const pxIds = phieuxuat.map(p => p.MaPX);
        let ctXuat = [];
        if (pxIds.length > 0) {
            const rawCtXuat = await fetchDetailsInChunks('CHITIETPHIEUXUAT', '*, NGUYENLIEU(TenNL)', 'MaPX', pxIds);
            ctXuat = rawCtXuat.map(ctx => {
                const px = phieuxuat.find(p => p.MaPX === ctx.MaPX);
                return { ...ctx, LyDo: px ? px.LyDo : '' };
            });
        }

        res.json({ 
            nhap: ctNhap, 
            xuat: ctXuat,
            phieunhap,
            phieuxuat
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
