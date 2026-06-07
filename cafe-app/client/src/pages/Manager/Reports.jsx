import { useState, useEffect, useMemo } from 'react';
import DesktopLayout from '../../components/Layout/DesktopLayout';
import { LineChart, ArrowUpCircle, ArrowDownCircle, DollarSign, Trophy, PackageOpen, AlertTriangle, Calendar, Download, X } from 'lucide-react';
import { api } from '../../services/api';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import html2pdf from 'html2pdf.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
import './Reports.css';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('doanhthu'); // 'doanhthu' | 'haohut' | 'xuatnhap'
  const [selectedDate, setSelectedDate] = useState(null); // Cho modal Xuất nhập kho
  const [selectedPKK, setSelectedPKK] = useState(null);   // Cho modal Hao hụt kho
  
  const [startDate, setStartDate] = useState(() => {
    let d = new Date(); d.setMonth(d.getMonth() - 5); d.setDate(1); return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  
  // Data states
  const [revenueData, setRevenueData] = useState({ doanhThu: 0, chiPhiNhap: 0, loiNhuan: 0, chiTietDoanhThu: [], chiTietChiPhi: [] });
  const [bestSellers, setBestSellers] = useState([]);
  const [haohutData, setHaohutData] = useState({ phieukiem: [], chitiet: [] });
  const [xuatnhapData, setXuatnhapData] = useState({ nhap: [], xuat: [] });
  
  const [loading, setLoading] = useState(true);

  const setShortcut = (type) => {
    const end = new Date();
    const start = new Date();
    if (type === 'thisMonth') {
      start.setDate(1);
    } else if (type === '6months') {
      start.setMonth(start.getMonth() - 5); start.setDate(1);
    } else {
      start.setFullYear(2000); // All time
    }
    setStartDate(start.toISOString().slice(0, 10));
    setEndDate(end.toISOString().slice(0, 10));
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const s = new Date(startDate); s.setHours(0,0,0,0);
      const e = new Date(endDate); e.setHours(23,59,59,999);
      const params = { startDate: s.toISOString(), endDate: e.toISOString() };

      try {
        if (activeTab === 'doanhthu') {
          const [revData, bestData] = await Promise.all([api.getRevenueReport(params), api.getBestSellers(params)]);
          setRevenueData(revData);
          setBestSellers(bestData);
        } else if (activeTab === 'haohut') {
          const hhData = await api.getDiscrepancyReport(params);
          setHaohutData(hhData);
        } else if (activeTab === 'xuatnhap') {
          const xnData = await api.getInOutReport(params);
          setXuatnhapData(xnData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab, startDate, endDate]);

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + 'đ';

  // Chế biến dữ liệu biểu đồ
  const chartData = useMemo(() => {
    if (activeTab !== 'doanhthu') return [];
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    const dataPoints = {};
    
    if (diffDays <= 31) {
      // Nhóm theo ngày
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = d.toISOString().slice(0, 10);
        dataPoints[key] = {
          key,
          label: `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`,
          DoanhThu: 0,
          ChiPhi: 0
        };
      }
      
      revenueData.chiTietDoanhThu.forEach(hd => {
        const key = hd.ThoiGianXuat.slice(0, 10);
        if (dataPoints[key]) dataPoints[key].DoanhThu += hd.TongTien;
      });
      revenueData.chiTietChiPhi.forEach(pn => {
        const key = pn.NgayNhap.slice(0, 10);
        if (dataPoints[key]) dataPoints[key].ChiPhi += pn.TongTienNhap;
      });
      
    } else {
      // Nhóm theo tháng
      const startMonth = new Date(start.getFullYear(), start.getMonth(), 1);
      const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
      
      for (let d = new Date(startMonth); d <= endMonth; d.setMonth(d.getMonth() + 1)) {
        const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        dataPoints[key] = {
          key,
          label: `T${d.getMonth() + 1}/${d.getFullYear().toString().slice(-2)}`,
          DoanhThu: 0,
          ChiPhi: 0
        };
      }
      
      revenueData.chiTietDoanhThu.forEach(hd => {
        const key = hd.ThoiGianXuat.slice(0, 7);
        if (dataPoints[key]) dataPoints[key].DoanhThu += hd.TongTien;
      });
      revenueData.chiTietChiPhi.forEach(pn => {
        const key = pn.NgayNhap.slice(0, 7);
        if (dataPoints[key]) dataPoints[key].ChiPhi += pn.TongTienNhap;
      });
    }

    return Object.values(dataPoints);
  }, [revenueData, activeTab, startDate, endDate]);

  const chartJSData = useMemo(() => {
    return {
      labels: chartData.map(d => d.label),
      datasets: [
        {
          label: 'Doanh Thu',
          data: chartData.map(d => d.DoanhThu),
          backgroundColor: '#10b981', // var(--success)
        },
        {
          label: 'Chi Phí',
          data: chartData.map(d => d.ChiPhi),
          backgroundColor: '#ef4444', // var(--danger)
        }
      ]
    };
  }, [chartData]);

  // Chế biến báo cáo Xuất nhập tồn
  const dailyXuatNhapSummary = useMemo(() => {
    if (activeTab !== 'xuatnhap' || !xuatnhapData.phieunhap) return [];
    const summary = {};

    // Ghi nhận các ngày có Nhập
    xuatnhapData.phieunhap.forEach(pn => {
      const date = pn.NgayNhap.slice(0, 10);
      if (!summary[date]) summary[date] = { date, countNhap: 0, countXuat: 0, totalTienNhap: 0 };
      summary[date].countNhap += 1;
      
      const ct = xuatnhapData.nhap.filter(n => n.MaPN === pn.MaPN);
      const tien = ct.reduce((sum, item) => sum + (item.SoLuong * item.DonGiaNhap), 0);
      summary[date].totalTienNhap += tien;
    });

    // Ghi nhận các ngày có Xuất
    xuatnhapData.phieuxuat.forEach(px => {
      const date = px.NgayXuat.slice(0, 10);
      if (!summary[date]) summary[date] = { date, countNhap: 0, countXuat: 0, totalTienNhap: 0 };
      summary[date].countXuat += 1;
    });

    // Sắp xếp giảm dần theo ngày
    return Object.values(summary).sort((a, b) => b.date.localeCompare(a.date));
  }, [xuatnhapData, activeTab]);

  const handleExport = () => {
    const element = document.getElementById('report-pdf-content');
    const header = document.getElementById('pdf-hidden-header');
    if (!element) return;
    
    // Hiện tiêu đề lên trước khi chụp
    if (header) header.style.display = 'block';
    
    const opt = {
      margin:       [10, 10, 10, 10],
      filename:     `Bao_Cao_${activeTab}_${new Date().toISOString().slice(0,10)}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' } // landscape để chứa vừa bảng và biểu đồ
    };

    html2pdf().set(opt).from(element).save().then(() => {
      // Ẩn tiêu đề đi sau khi xuất xong
      if (header) header.style.display = 'none';
    });
  };

  return (
    <DesktopLayout>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1><LineChart size={28} /> Báo cáo & Thống kê</h1>
        
        <div style={{ display: 'flex', gap: 10 }}>
          {/* Lọc thời gian tuỳ chọn */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'white', padding: '6px 16px', borderRadius: 8, border: '1px solid var(--border)' }}>
            <Calendar size={18} color="var(--text-light)" />
            <input type="date" style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13 }} value={startDate} onChange={e => setStartDate(e.target.value)} />
            <span style={{ color: 'var(--text-light)' }}>-</span>
            <input type="date" style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13 }} value={endDate} onChange={e => setEndDate(e.target.value)} />
            
            <div style={{ display: 'flex', gap: 4, marginLeft: 10, borderLeft: '1px solid var(--border)', paddingLeft: 10 }}>
              <button className="btn btn-sm btn-ghost" onClick={() => setShortcut('thisMonth')} style={{ fontSize: 12, padding: '4px 8px' }}>Tháng này</button>
              <button className="btn btn-sm btn-ghost" onClick={() => setShortcut('6months')} style={{ fontSize: 12, padding: '4px 8px' }}>6 Tháng</button>
              <button className="btn btn-sm btn-ghost" onClick={() => setShortcut('all')} style={{ fontSize: 12, padding: '4px 8px' }}>Tất cả</button>
            </div>
          </div>
          
          {/* Export Button */}
          <button className="btn btn-primary" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Download size={18} /> Xuất file PDF
          </button>
        </div>
      </div>

      <div className="reports-tabs">
        <button className={activeTab === 'doanhthu' ? 'active' : ''} onClick={() => setActiveTab('doanhthu')}><DollarSign size={16}/> Doanh Thu</button>
        <button className={activeTab === 'haohut' ? 'active' : ''} onClick={() => setActiveTab('haohut')}><AlertTriangle size={16}/> Hao Hụt Kho</button>
        <button className={activeTab === 'xuatnhap' ? 'active' : ''} onClick={() => setActiveTab('xuatnhap')}><PackageOpen size={16}/> Xuất Nhập Kho</button>
      </div>

      {loading ? <div className="page-loading"><div className="spinner" /></div> : (
        <div className="reports-container" id="report-pdf-content" style={{ marginTop: 20, padding: '10px' }}>
          
          {/* Tiêu đề ẩn cho PDF */}
          <div id="pdf-hidden-header" style={{ display: 'none' }} className="pdf-header">
            <h2 style={{ textAlign: 'center', color: 'var(--primary)' }}>BÁO CÁO NHÀ BA TERIA</h2>
            <p style={{ textAlign: 'center', color: 'var(--text-light)', marginBottom: 20 }}>Thời gian trích xuất: {new Date().toLocaleDateString('vi-VN')}</p>
          </div>
          
          {/* TAB 1: DOANH THU */}
          {activeTab === 'doanhthu' && (
            <>
              <div className="stat-cards">
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
                    <ArrowUpCircle size={24} />
                  </div>
                  <div className="stat-info">
                    <span>Tổng Doanh Thu</span>
                    <h3>{formatPrice(revenueData.doanhThu)}</h3>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
                    <ArrowDownCircle size={24} />
                  </div>
                  <div className="stat-info">
                    <span>Tổng Chi Phí Nhập Kho</span>
                    <h3>{formatPrice(revenueData.chiPhiNhap)}</h3>
                  </div>
                </div>

                <div className="stat-card highlight">
                  <div className="stat-icon">
                    <DollarSign size={24} />
                  </div>
                  <div className="stat-info">
                    <span>Lợi Nhuận Gộp</span>
                    <h3>{formatPrice(revenueData.loiNhuan)}</h3>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 20, marginTop: 20, height: 400 }}>
                {/* Best Sellers */}
                <div style={{ flex: 1, background: 'var(--surface)', padding: 20, borderRadius: 12, boxShadow: 'var(--shadow-sm)', overflowY: 'auto' }}>
                  <h3><Trophy size={20} style={{ color: '#f59e0b', verticalAlign: 'middle', marginRight: 8 }}/> Top Món Bán Chạy</h3>
                  <table className="data-table" style={{ marginTop: 15 }}>
                    <thead><tr><th>Hạng</th><th>Tên món</th><th>Đã bán</th></tr></thead>
                    <tbody>
                      {bestSellers.map((item, index) => (
                        <tr key={index}>
                          <td>
                            {index === 0 ? <span className="badge" style={{ background: '#f59e0b', color: '#fff' }}>#1</span> : 
                             index === 1 ? <span className="badge" style={{ background: '#9ca3af', color: '#fff' }}>#2</span> :
                             index === 2 ? <span className="badge" style={{ background: '#b45309', color: '#fff' }}>#3</span> : `#${index + 1}`}
                          </td>
                          <td><strong>{item.TenMon}</strong></td>
                          <td>{item.SoLuong} ly</td>
                        </tr>
                      ))}
                      {bestSellers.length === 0 && <tr><td colSpan="3" style={{ textAlign: 'center' }}>Chưa có dữ liệu bán hàng</td></tr>}
                    </tbody>
                  </table>
                </div>

                {/* Chart */}
                <div style={{ flex: 2, background: 'var(--surface)', padding: 20, borderRadius: 12, boxShadow: 'var(--shadow-sm)' }}>
                  <h3 style={{ marginBottom: 20 }}>Biểu đồ Doanh Thu & Chi Phí</h3>
                  <div style={{ height: 320, width: '100%' }}>
                    <Bar 
                      data={chartJSData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: (value) => new Intl.NumberFormat('vi-VN', { notation: "compact" }).format(value)
                            }
                          }
                        },
                        plugins: {
                          tooltip: {
                            callbacks: {
                              label: (context) => formatPrice(context.raw)
                            }
                          }
                        }
                      }} 
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: HAO HỤT */}
          {activeTab === 'haohut' && (
            <div style={{ background: 'var(--surface)', padding: 20, borderRadius: 12, boxShadow: 'var(--shadow-sm)' }}>
              <h3>Danh sách Các Kỳ Kiểm Kho</h3>
              <p style={{ color: 'var(--text-light)', fontSize: 13, marginBottom: 15 }}>Dữ liệu được trích xuất từ các Phiếu Kiểm Kho trong kỳ.</p>
              
              <table className="data-table">
                <thead><tr><th>Phiếu Kiểm</th><th>Ngày Kiểm</th><th>Nhân viên</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                <tbody>
                  {haohutData.phieukiem?.map((pkk, idx) => (
                    <tr key={idx}>
                      <td><strong>{pkk.MaPKK}</strong></td>
                      <td>{new Date(pkk.NgayKiem).toLocaleDateString('vi-VN')}</td>
                      <td>{pkk.NHANVIEN?.HoTen || '—'}</td>
                      <td>
                        {pkk.TrangThai === 'Lech' ? <span className="badge badge-danger">Có hao hụt</span> : <span className="badge badge-success">Khớp</span>}
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline" onClick={() => setSelectedPKK(pkk.MaPKK)}>Xem chi tiết</button>
                      </td>
                    </tr>
                  ))}
                  {(!haohutData.phieukiem || haohutData.phieukiem.length === 0) && <tr><td colSpan="5" style={{ textAlign: 'center' }}>Không có phiếu kiểm kho nào trong kỳ.</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: XUẤT NHẬP KHO */}
          {activeTab === 'xuatnhap' && (
            <div style={{ background: 'var(--surface)', padding: 20, borderRadius: 12, boxShadow: 'var(--shadow-sm)' }}>
              <h3>Tổng hợp Xuất Nhập Kho Theo Ngày</h3>
              
              <table className="data-table" style={{ marginTop: 15 }}>
                <thead><tr><th>Ngày</th><th>Số Phiếu Nhập</th><th>Số Phiếu Xuất</th><th>Tổng Tiền Nhập</th><th>Thao tác</th></tr></thead>
                <tbody>
                  {dailyXuatNhapSummary.map((item, idx) => (
                    <tr key={idx}>
                      <td><strong>{new Date(item.date).toLocaleDateString('vi-VN')}</strong></td>
                      <td><span style={{ color: 'var(--success)', fontWeight: 600 }}>{item.countNhap}</span></td>
                      <td><span style={{ color: 'var(--danger)', fontWeight: 600 }}>{item.countXuat}</span></td>
                      <td>{formatPrice(item.totalTienNhap)}</td>
                      <td><button className="btn btn-sm btn-outline" onClick={() => setSelectedDate(item.date)}>Xem chi tiết</button></td>
                    </tr>
                  ))}
                  {dailyXuatNhapSummary.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center' }}>Không có giao dịch xuất/nhập trong kỳ.</td></tr>}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* MODAL CHI TIẾT HAO HỤT */}
      {selectedPKK && (
        <div className="modal-overlay" onClick={() => setSelectedPKK(null)}>
          <div className="modal-content" style={{ maxWidth: 800 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi Tiết Phiếu Kiểm Kho: {selectedPKK}</h3>
              <button className="btn btn-icon btn-ghost" onClick={() => setSelectedPKK(null)}><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <table className="data-table">
                <thead><tr><th>Nguyên liệu</th><th>Lý thuyết</th><th>Thực tế</th><th>Độ lệch</th><th>Ghi chú</th></tr></thead>
                <tbody>
                  {haohutData.chitiet.filter(ct => ct.MaPKK === selectedPKK).map((ct, idx) => (
                    <tr key={idx}>
                      <td>{ct.NGUYENLIEU?.TenNL}</td>
                      <td>{ct.SLLyThuyet} {ct.NGUYENLIEU?.DonViTinh}</td>
                      <td>{ct.SLThucTe} {ct.NGUYENLIEU?.DonViTinh}</td>
                      <td>
                        {ct.ChenhLech < 0 ? <span className="badge badge-danger">{ct.ChenhLech} (Hao hụt)</span> :
                         ct.ChenhLech > 0 ? <span className="badge badge-success">+{ct.ChenhLech} (Dư)</span> :
                         <span className="badge" style={{ background: 'var(--border)' }}>Khớp (0)</span>}
                      </td>
                      <td>{ct.GhiChu}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CHI TIẾT XUẤT NHẬP */}
      {selectedDate && (
        <div className="modal-overlay" onClick={() => setSelectedDate(null)}>
          <div className="modal-content" style={{ maxWidth: 800 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi Tiết Giao Dịch Kho Ngày: {new Date(selectedDate).toLocaleDateString('vi-VN')}</h3>
              <button className="btn btn-icon btn-ghost" onClick={() => setSelectedDate(null)}><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <h4 style={{ color: 'var(--success)', marginBottom: 10 }}>1. Các khoản NHẬP KHO</h4>
              <table className="data-table" style={{ marginBottom: 20 }}>
                <thead><tr><th>Mã Phiếu</th><th>Nguyên Liệu</th><th>Số Lượng</th><th>Đơn Giá</th><th>Thành Tiền</th></tr></thead>
                <tbody>
                  {xuatnhapData.nhap.filter(n => {
                    const pn = xuatnhapData.phieunhap?.find(p => p.MaPN === n.MaPN);
                    return pn && pn.NgayNhap.slice(0, 10) === selectedDate;
                  }).map((n, idx) => (
                    <tr key={idx}>
                      <td>{n.MaPN}</td>
                      <td>{n.NGUYENLIEU?.TenNL}</td>
                      <td><span style={{ color: 'var(--success)', fontWeight: 600 }}>+{n.SoLuong}</span></td>
                      <td>{formatPrice(n.DonGiaNhap)}</td>
                      <td>{formatPrice(n.SoLuong * n.DonGiaNhap)}</td>
                    </tr>
                  ))}
                  {xuatnhapData.nhap.filter(n => {
                    const pn = xuatnhapData.phieunhap?.find(p => p.MaPN === n.MaPN);
                    return pn && pn.NgayNhap.slice(0, 10) === selectedDate;
                  }).length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center' }}>Không có nhập kho trong ngày.</td></tr>}
                </tbody>
              </table>

              <h4 style={{ color: 'var(--danger)', marginBottom: 10 }}>2. Các khoản XUẤT KHO</h4>
              <table className="data-table">
                <thead><tr><th>Mã Phiếu</th><th>Nguyên Liệu</th><th>Số Lượng</th><th>Lý Do</th></tr></thead>
                <tbody>
                  {xuatnhapData.xuat.filter(x => {
                    const px = xuatnhapData.phieuxuat?.find(p => p.MaPX === x.MaPX);
                    return px && px.NgayXuat.slice(0, 10) === selectedDate;
                  }).map((x, idx) => (
                    <tr key={idx}>
                      <td>{x.MaPX}</td>
                      <td>{x.NGUYENLIEU?.TenNL}</td>
                      <td><span style={{ color: 'var(--danger)', fontWeight: 600 }}>-{x.SoLuong}</span></td>
                      <td>{x.LyDo}</td>
                    </tr>
                  ))}
                  {xuatnhapData.xuat.filter(x => {
                    const px = xuatnhapData.phieuxuat?.find(p => p.MaPX === x.MaPX);
                    return px && px.NgayXuat.slice(0, 10) === selectedDate;
                  }).length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center' }}>Không có xuất kho trong ngày.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </DesktopLayout>
  );
}
