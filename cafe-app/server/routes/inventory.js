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

// POST /api/inventory/kiemkho - Kiểm kho
router.post('/kiemkho', authMiddleware(['admin', 'quản lý']), async (req, res) => {
    const { MaPKK, ChiTiet } = req.body;
    try {
        const MaNV = req.user.MaNV;
        let TrangThai = 'Khop';
        for (const item of ChiTiet) {
            if (item.SLThucTe !== item.SLLyThuyet) TrangThai = 'Lech';
        }

        const { data: pkkData, error: pkkErr } = await supabase
            .from('PHIEUKIEMKHO')
            .insert([{ MaPKK, MaNV, TrangThai }])
            .select();
        if (pkkErr) throw pkkErr;

        for (const item of ChiTiet) {
            const ChenhLech = item.SLThucTe - item.SLLyThuyet;
            await supabase.from('CHITIETKIEMKHO').insert([{ 
                MaPKK, 
                MaNL: item.MaNL, 
                SLThucTe: item.SLThucTe, 
                SLLyThuyet: item.SLLyThuyet, 
                ChenhLech, 
                GhiChu: item.GhiChu || '' 
            }]);
            
            await supabase.from('NGUYENLIEU').update({ SoLuongTon: item.SLThucTe }).eq('MaNL', item.MaNL);
        }
        res.status(201).json(pkkData[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================================
// CRUD NGUYÊN LIỆU
// ============================================================

// POST /api/inventory/nguyenlieu - Thêm nguyên liệu mới
router.post('/nguyenlieu', authMiddleware(['admin']), async (req, res) => {
    const { MaNL, TenNL, DonViTinh, SoLuongTon, MucToiThieu } = req.body;
    try {
        const { data, error } = await supabase
            .from('NGUYENLIEU')
            .insert([{ MaNL, TenNL, DonViTinh, SoLuongTon: SoLuongTon || 0, MucToiThieu: MucToiThieu || 0 }])
            .select();
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/inventory/nguyenlieu/:id - Sửa nguyên liệu
router.put('/nguyenlieu/:id', authMiddleware(['admin']), async (req, res) => {
    const { TenNL, DonViTinh, SoLuongTon, MucToiThieu } = req.body;
    try {
        const { data, error } = await supabase
            .from('NGUYENLIEU')
            .update({ TenNL, DonViTinh, SoLuongTon, MucToiThieu })
            .eq('MaNL', req.params.id)
            .select();
        if (error) throw error;
        res.json(data[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/inventory/nguyenlieu/:id - Xóa nguyên liệu
router.delete('/nguyenlieu/:id', authMiddleware(['admin']), async (req, res) => {
    try {
        // Kiểm tra ràng buộc công thức
        const { data: ct } = await supabase.from('CONGTHUC').select('MaMon').eq('MaNL', req.params.id);
        if (ct && ct.length > 0) {
            return res.status(400).json({ error: `Nguyên liệu đang được sử dụng trong ${ct.length} công thức. Hãy gỡ công thức trước khi xóa.` });
        }
        const { error } = await supabase.from('NGUYENLIEU').delete().eq('MaNL', req.params.id);
        if (error) throw error;
        res.json({ message: 'Đã xóa nguyên liệu' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================================
// TỒN LÝ THUYẾT (cho Kiểm kho chính xác)
// ============================================================

// GET /api/inventory/tonlythuyet?startDate=...
// Công thức: Tồn đầu kỳ + Nhập trong kỳ - Tiêu thụ lý thuyết
router.get('/tonlythuyet', authMiddleware(['admin']), async (req, res) => {
    try {
        const { startDate } = req.query;
        const now = new Date().toISOString();

        // 1. Lấy tất cả nguyên liệu
        const { data: allNL } = await supabase.from('NGUYENLIEU').select('MaNL, TenNL, DonViTinh, SoLuongTon');

        // 2. Tồn đầu kỳ: từ phiếu kiểm kho gần nhất TRƯỚC startDate
        const { data: lastPKK } = await supabase
            .from('PHIEUKIEMKHO')
            .select('MaPKK')
            .lt('NgayKiem', startDate)
            .order('NgayKiem', { ascending: false })
            .limit(1);

        let tonDauKy = {};
        if (lastPKK && lastPKK.length > 0) {
            const { data: ctKiem } = await supabase
                .from('CHITIETKIEMKHO')
                .select('MaNL, SLThucTe')
                .eq('MaPKK', lastPKK[0].MaPKK);
            if (ctKiem) ctKiem.forEach(c => { tonDauKy[c.MaNL] = c.SLThucTe; });
        }

        // 3. Nhập kho trong kỳ
        const { data: pnInKy } = await supabase
            .from('PHIEUNHAP')
            .select('MaPN')
            .gte('NgayNhap', startDate)
            .lte('NgayNhap', now);
        let nhapKho = {};
        if (pnInKy && pnInKy.length > 0) {
            const pnIds = pnInKy.map(p => p.MaPN);
            const { data: ctNhap } = await supabase
                .from('CHITIETPHIEUNHAP')
                .select('MaNL, SoLuong')
                .in('MaPN', pnIds);
            if (ctNhap) ctNhap.forEach(c => { nhapKho[c.MaNL] = (nhapKho[c.MaNL] || 0) + c.SoLuong; });
        }

        // 4. Tiêu thụ lý thuyết: Đơn hàng trong kỳ × Công thức
        const { data: dhInKy } = await supabase
            .from('DONHANG')
            .select('MaDH')
            .gte('ThoiGianDat', startDate)
            .lte('ThoiGianDat', now);
        let tieuThu = {};
        if (dhInKy && dhInKy.length > 0) {
            const dhIds = dhInKy.map(d => d.MaDH);
            const { data: ctDH } = await supabase
                .from('CHITIETDONHANG')
                .select('MaMon, SoLuong')
                .in('MaDH', dhIds);
            if (ctDH) {
                // Lấy tất cả công thức
                const { data: congthuc } = await supabase.from('CONGTHUC').select('MaMon, MaNL, DinhLuong');
                if (congthuc) {
                    ctDH.forEach(ct => {
                        const recipes = congthuc.filter(r => r.MaMon === ct.MaMon);
                        recipes.forEach(r => {
                            tieuThu[r.MaNL] = (tieuThu[r.MaNL] || 0) + (ct.SoLuong * r.DinhLuong);
                        });
                    });
                }
            }
        }

        // 5. Tính tồn lý thuyết
        const result = allNL.map(nl => {
            const dauKy = tonDauKy[nl.MaNL] !== undefined ? tonDauKy[nl.MaNL] : nl.SoLuongTon;
            const nhap = nhapKho[nl.MaNL] || 0;
            const tieu = tieuThu[nl.MaNL] || 0;
            return {
                MaNL: nl.MaNL,
                TenNL: nl.TenNL,
                DonViTinh: nl.DonViTinh,
                TonDauKy: dauKy,
                NhapTrongKy: nhap,
                TieuThuLyThuyet: Math.round(tieu * 100) / 100,
                TonLyThuyet: Math.round((dauKy + nhap - tieu) * 100) / 100
            };
        });

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
