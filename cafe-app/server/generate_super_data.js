require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PRICES = {
  'MON01': 45000,
  'MON02': 49000,
  'MON03': 55000,
  'MON04': 65000,
  'MON05': 55000,
  'MON06': 49000,
  'MON07': 65000,
  'MON08': 60000,
  'MON09': 50000,
  'MON10': 45000
};

async function run() {
  console.log('Đã nạp Supabase Service Role Key thành công!');

  try {
    console.log('1. Đang dọn dẹp dữ liệu động cũ (Xóa Hóa đơn, Nhập xuất kho)...');
    await supabase.from('HOADON').delete().neq('MaHD', 'dummy');
    await supabase.from('PHIEUNHAP').delete().neq('MaPN', 'dummy');
    await supabase.from('PHIEUXUAT').delete().neq('MaPX', 'dummy');
    await supabase.from('PHIEUKIEMKHO').delete().neq('MaPKK', 'dummy');

    console.log('2. Đang cập nhật lại giá tiền cho Menu (Chuẩn Sài Gòn)...');
    for (const [id, price] of Object.entries(PRICES)) {
      await supabase.from('MON').update({ DonGia: price }).eq('MaMon', id);
    }

    console.log('3. Đang sinh dữ liệu Hóa đơn trong 2 năm (T6/2024 -> T6/2026)...');
    const MON_LIST = Object.entries(PRICES).map(([id, price]) => ({ id, price }));
    const startDate = new Date('2024-06-01T08:00:00+07:00');
    const endDate = new Date('2026-06-01T22:00:00+07:00');
    
    let currentId = 1;
    let hdBatch = [];
    let dhBatch = [];
    let ctdhBatch = [];
    let ttBatch = [];

    const insertBatches = async () => {
       if(hdBatch.length === 0) return;
       await supabase.from('HOADON').insert(hdBatch);
       await supabase.from('DONHANG').insert(dhBatch);
       
       // Chunk ctdhBatch if it's too large (>1000)
       for (let k = 0; k < ctdhBatch.length; k += 1000) {
          await supabase.from('CHITIETDONHANG').insert(ctdhBatch.slice(k, k + 1000));
       }
       
       await supabase.from('THANHTOAN').insert(ttBatch);

       hdBatch = []; dhBatch = []; ctdhBatch = []; ttBatch = [];
    };

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const year = d.getFullYear();
        let minB, maxB;
        if (year === 2024) { minB = 10; maxB = 25; }
        else if (year === 2025) { minB = 25; maxB = 50; }
        else { minB = 50; maxB = 80; } // Giảm nhẹ volume để API không bị rate limit quá nặng

        const numBills = Math.floor(Math.random() * (maxB - minB + 1)) + minB;
        
        for (let i = 0; i < numBills; i++) {
            const time = new Date(d);
            time.setHours(8 + Math.floor(Math.random()*14), Math.floor(Math.random()*60), Math.floor(Math.random()*60));
            const timeStr = time.toISOString().replace('T', ' ').slice(0, 19) + '+07';
            
            const idStr = currentId.toString().padStart(6, '0');
            const maHD = `HD_${idStr}`;
            const maDH = `DH_${idStr}`;
            const maTT = `TT_${idStr}`;
            
            const numItems = Math.floor(Math.random() * 4) + 1;
            const selectedMons = [...MON_LIST].sort(() => 0.5 - Math.random()).slice(0, numItems);
            
            let tongTien = 0;
            for (let mon of selectedMons) {
                const sl = Math.floor(Math.random() * 3) + 1;
                tongTien += mon.price * sl;
                ctdhBatch.push({ MaDH: maDH, MaMon: mon.id, SoLuong: sl, DonGia: mon.price });
            }
            
            const maNV = ['NV02', 'NV02', 'NV01'][Math.floor(Math.random()*3)];
            const maBan = `B${(Math.floor(Math.random()*15)+1).toString().padStart(2, '0')}`;
            const pt = ['TienMat', 'CK', 'CK', 'Visa'][Math.floor(Math.random()*4)];
            
            hdBatch.push({ MaHD: maHD, ThoiGianXuat: timeStr, TongTien: tongTien, MaNV: maNV });
            dhBatch.push({ MaDH: maDH, ThoiGianDat: timeStr, TrangThaiOrder: 'DaGiao', MaBan: maBan, MaNV: 'NV05', MaHD: maHD });
            ttBatch.push({ MaThanhToan: maTT, ThoiGianThanhToan: timeStr, SoTien: tongTien, PhuongThuc: pt, MaHD: maHD, MaNV: maNV });
            
            currentId++;
            if (hdBatch.length >= 500) {
              await insertBatches();
              process.stdout.write(`\rĐã tạo ${currentId - 1} hóa đơn...`);
            }
        }
    }
    await insertBatches();
    console.log(`\nHoàn thành! Đã tạo tổng cộng ${currentId - 1} hóa đơn (bills).`);

    // 4. Inventories
    console.log('4. Đang sinh dữ liệu Xuất Nhập - Hao hụt kho...');
    const { data: nls } = await supabase.from('NGUYENLIEU').select('MaNL');
    const NL_LIST = nls.map(r => r.MaNL);
    
    let pnId = 1;
    let pnBatch = [];
    let ctpnBatch = [];
    for (let d = new Date('2024-06-05'); d <= endDate; d.setDate(d.getDate() + 15)) {
        const time = new Date(d);
        const timeStr = time.toISOString().replace('T', ' ').slice(0, 19) + '+07';
        const maPN = `PN_${pnId.toString().padStart(4, '0')}`;
        
        let tongTienNhap = 0;
        for (let nl of NL_LIST) {
            let sl = Math.floor(Math.random() * 50) + 10;
            let price = Math.floor(Math.random() * 50000) + 10000;
            if (nl === 'NL01' || nl === 'NL04') { sl *= 100; price = 200; }
            tongTienNhap += sl * price;
            ctpnBatch.push({ MaPN: maPN, MaNL: nl, SoLuong: sl, DonGiaNhap: price });
        }
        pnBatch.push({ MaPN: maPN, NgayNhap: timeStr, TongTienNhap: tongTienNhap, MaNV: 'NV01', MaNCC: 'NCC01' });
        pnId++;
    }
    await supabase.from('PHIEUNHAP').insert(pnBatch);
    for (let k = 0; k < ctpnBatch.length; k += 1000) await supabase.from('CHITIETPHIEUNHAP').insert(ctpnBatch.slice(k, k+1000));

    let pxId = 1;
    let pxBatch = [];
    let ctpxBatch = [];
    for (let d = new Date('2024-06-10'); d <= endDate; d.setDate(d.getDate() + 10)) {
        const time = new Date(d);
        const timeStr = time.toISOString().replace('T', ' ').slice(0, 19) + '+07';
        const maPX = `PX_${pxId.toString().padStart(4, '0')}`;
        pxBatch.push({ MaPX: maPX, NgayXuat: timeStr, LyDo: 'Xuat quay', MaNV: 'NV01' });
        
        for (let nl of [...NL_LIST].sort(()=>0.5-Math.random()).slice(0, 3)) {
            let sl = Math.floor(Math.random() * 10) + 1;
            if (nl === 'NL01' || nl === 'NL04') sl *= 100;
            ctpxBatch.push({ MaPX: maPX, MaNL: nl, SoLuong: sl });
        }
        pxId++;
    }
    await supabase.from('PHIEUXUAT').insert(pxBatch);
    await supabase.from('CHITIETPHIEUXUAT').insert(ctpxBatch);

    let pkkId = 1;
    let pkkBatch = [];
    let ctkkBatch = [];
    for (let d = new Date('2024-06-30'); d <= endDate; d.setMonth(d.getMonth() + 1)) {
        const time = new Date(d);
        const timeStr = time.toISOString().replace('T', ' ').slice(0, 19) + '+07';
        const maPKK = `PKK_${pkkId.toString().padStart(4, '0')}`;
        
        let isLech = Math.random() > 0.4;
        pkkBatch.push({ MaPKK: maPKK, NgayKiem: timeStr, TrangThai: isLech ? 'Lech' : 'Khop', MaNV: 'NV01' });
        
        for (let nl of NL_LIST) {
            let lyThuyet = Math.floor(Math.random() * 100) + 50;
            if (nl === 'NL01' || nl === 'NL04') lyThuyet *= 100;
            let thucTe = lyThuyet;
            let ghiChu = 'Khop';
            if (isLech && Math.random() > 0.6) {
                thucTe = Math.max(0, lyThuyet - Math.floor(Math.random() * 10));
                ghiChu = 'Hao hut';
            }
            ctkkBatch.push({ MaPKK: maPKK, MaNL: nl, SLThucTe: thucTe, SLLyThuyet: lyThuyet, ChenhLech: thucTe - lyThuyet, GhiChu: ghiChu });
        }
        pkkId++;
    }
    await supabase.from('PHIEUKIEMKHO').insert(pkkBatch);
    await supabase.from('CHITIETKIEMKHO').insert(ctkkBatch);

    console.log('🎉 TẤT CẢ ĐÃ HOÀN TẤT. Database đã sẵn sàng!');
  } catch(e) {
    console.error('❌ Lỗi:', e);
  }
}

run();
