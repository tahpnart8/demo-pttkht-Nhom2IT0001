const fs = require('fs');

const startDate = new Date('2024-01-01T08:00:00+07:00');
const endDate = new Date('2025-12-31T22:00:00+07:00');

const MON_LIST = [
  { id: 'MON01', price: 29000 }, { id: 'MON02', price: 32000 },
  { id: 'MON03', price: 35000 }, { id: 'MON04', price: 42000 },
  { id: 'MON05', price: 35000 }, { id: 'MON06', price: 30000 },
  { id: 'MON07', price: 40000 }, { id: 'MON08', price: 38000 },
  { id: 'MON09', price: 32000 }, { id: 'MON10', price: 20000 },
];

const NL_LIST = [
  { id: 'NL01', price: 100 }, { id: 'NL02', price: 10000 },
  { id: 'NL03', price: 15000 }, { id: 'NL04', price: 1000 },
  { id: 'NL05', price: 20000 }, { id: 'NL06', price: 20000 },
];

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
const formatSQLDate = (d) => d.toISOString().replace('T', ' ').slice(0, 19) + '+07';

let sqlPart1 = `-- Xóa dữ liệu động cũ\nTRUNCATE TABLE "CHITIETKIEMKHO", "PHIEUKIEMKHO", "CHITIETPHIEUXUAT", "PHIEUXUAT", "CHITIETPHIEUNHAP", "PHIEUNHAP", "THANHTOAN", "CHITIETDONHANG", "DONHANG", "HOADON" CASCADE;\n\n`;
let sqlPart2 = `-- Phần 2: Đơn hàng & Chi tiết\n\n`;
let sqlPart3 = `-- Phần 3: Thanh toán & Quản lý kho\n\n`;

// Batch arrays
let hdBatch = [];
let dhBatch = [];
let ctdhBatch = [];
let ttBatch = [];

let currentId = 1;
for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
  const numBills = randomInt(5, 10);
  for (let i = 0; i < numBills; i++) {
    const time = new Date(d);
    time.setHours(randomInt(8, 21), randomInt(0, 59), randomInt(0, 59));
    
    const idStr = currentId.toString().padStart(5, '0');
    const maHD = `HD_${idStr}`;
    const maDH = `DH_${idStr}`;
    const maTT = `TT_${idStr}`;
    
    const numItems = randomInt(1, 4);
    let tongTien = 0;
    const selectedMons = [...MON_LIST].sort(() => 0.5 - Math.random()).slice(0, numItems);
    for (let mon of selectedMons) {
      const sl = randomInt(1, 3);
      tongTien += mon.price * sl;
      ctdhBatch.push(`('${maDH}', '${mon.id}', ${sl}, ${mon.price})`);
    }
    
    const timeStr = formatSQLDate(time);
    const maNV = randomItem(['NV02', 'NV02', 'NV01']);
    const maBan = `B${randomInt(1, 15).toString().padStart(2, '0')}`;
    const pt = randomItem(['TienMat', 'TienMat', 'CK', 'CK', 'CK', 'Visa']);
    
    hdBatch.push(`('${maHD}', '${timeStr}', ${tongTien}, '${maNV}')`);
    dhBatch.push(`('${maDH}', '${timeStr}', 'DaGiao', '${maBan}', '${randomItem(['NV05', 'NV06', 'NV07', 'NV08'])}', '${maHD}')`);
    ttBatch.push(`('${maTT}', '${timeStr}', ${tongTien}, '${pt}', '${maHD}', '${maNV}')`);
    
    currentId++;
  }
}

// Function to generate INSERT statements in chunks of 500
function flushBatch(table, columns, dataArray, targetSql) {
    let result = '';
    while (dataArray.length > 0) {
        const chunk = dataArray.splice(0, 500);
        result += `INSERT INTO "${table}" ${columns} VALUES\n${chunk.join(',\n')};\n\n`;
    }
    return result;
}

sqlPart1 += flushBatch('HOADON', '("MaHD", "ThoiGianXuat", "TongTien", "MaNV")', hdBatch);
sqlPart2 += flushBatch('DONHANG', '("MaDH", "ThoiGianDat", "TrangThaiOrder", "MaBan", "MaNV", "MaHD")', dhBatch);
sqlPart2 += flushBatch('CHITIETDONHANG', '("MaDH", "MaMon", "SoLuong", "DonGia")', ctdhBatch);
sqlPart3 += flushBatch('THANHTOAN', '("MaThanhToan", "ThoiGianThanhToan", "SoTien", "PhuongThuc", "MaHD", "MaNV")', ttBatch);

// Inventory Generation
let pnBatch = [];
let ctpnBatch = [];
let pnId = 1;
for (let d = new Date('2024-01-05'); d <= endDate; d.setMonth(d.getMonth() + 1)) {
  for (let i = 0; i < 2; i++) {
    const time = new Date(d);
    time.setDate(i === 0 ? randomInt(1, 10) : randomInt(15, 25));
    time.setHours(randomInt(8, 12), randomInt(0, 59));
    
    const maPN = `PN_${pnId.toString().padStart(4, '0')}`;
    let tongTienNhap = 0;
    
    const numNL = randomInt(2, 6);
    const nls = [...NL_LIST].sort(() => 0.5 - Math.random()).slice(0, numNL);
    
    for (let nl of nls) {
      let sl = randomInt(5, 50);
      if (nl.id === 'NL01' || nl.id === 'NL04') sl *= 100;
      tongTienNhap += sl * nl.price;
      ctpnBatch.push(`('${maPN}', '${nl.id}', ${sl}, ${nl.price})`);
    }
    
    pnBatch.push(`('${maPN}', '${formatSQLDate(time)}', ${tongTienNhap}, 'NV01', '${randomItem(['NCC01', 'NCC02', 'NCC03'])}')`);
    pnId++;
  }
}

sqlPart3 += flushBatch('PHIEUNHAP', '("MaPN", "NgayNhap", "TongTienNhap", "MaNV", "MaNCC")', pnBatch);
sqlPart3 += flushBatch('CHITIETPHIEUNHAP', '("MaPN", "MaNL", "SoLuong", "DonGiaNhap")', ctpnBatch);

let pkkBatch = [];
let ctkBatch = [];
let pkkId = 1;
for (let d = new Date('2024-01-30'); d <= endDate; d.setMonth(d.getMonth() + 1)) {
  const time = new Date(d);
  time.setHours(22, 0, 0);
  const maPKK = `PKK_${pkkId.toString().padStart(4, '0')}`;
  
  let isLech = Math.random() > 0.5;
  pkkBatch.push(`('${maPKK}', '${formatSQLDate(time)}', '${isLech ? 'Lech' : 'Khop'}', 'NV01')`);
  
  for (let nl of NL_LIST) {
    let lyThuyet = randomInt(10, 1000);
    if (nl.id === 'NL01' || nl.id === 'NL04') lyThuyet = randomInt(1000, 10000);
    let thucTe = lyThuyet;
    let ghiChu = 'Khop';
    if (isLech && Math.random() > 0.7) {
      thucTe = Math.max(0, lyThuyet - randomInt(1, 10));
      ghiChu = 'Hao hut';
    }
    ctkBatch.push(`('${maPKK}', '${nl.id}', ${thucTe}, ${lyThuyet}, ${thucTe - lyThuyet}, '${ghiChu}')`);
  }
  pkkId++;
}

sqlPart3 += flushBatch('PHIEUKIEMKHO', '("MaPKK", "NgayKiem", "TrangThai", "MaNV")', pkkBatch);
sqlPart3 += flushBatch('CHITIETKIEMKHO', '("MaPKK", "MaNL", "SLThucTe", "SLLyThuyet", "ChenhLech", "GhiChu")', ctkBatch);

fs.writeFileSync('mock_part1.sql', sqlPart1);
fs.writeFileSync('mock_part2.sql', sqlPart2);
fs.writeFileSync('mock_part3.sql', sqlPart3);

console.log('Split into 3 files: mock_part1.sql, mock_part2.sql, mock_part3.sql');
