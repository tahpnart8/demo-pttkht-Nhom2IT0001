import { useState, useEffect, useMemo } from 'react';
import DesktopLayout from '../../components/Layout/DesktopLayout';
import { LineChart, ArrowUpCircle, ArrowDownCircle, DollarSign, Trophy, PackageOpen, AlertTriangle, Calendar } from 'lucide-react';
import { api } from '../../services/api';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
import './Reports.css';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('doanhthu'); // 'doanhthu' | 'haohut' | 'xuatnhap'
  const [dateRange, setDateRange] = useState('6months'); // '6months' | 'thisMonth' | 'all'
  
  // Data states
  const [revenueData, setRevenueData] = useState({ doanhThu: 0, chiPhiNhap: 0, loiNhuan: 0, chiTietDoanhThu: [], chiTietChiPhi: [] });
  const [bestSellers, setBestSellers] = useState([]);
  const [haohutData, setHaohutData] = useState({ phieukiem: [], chitiet: [] });
  const [xuatnhapData, setXuatnhapData] = useState({ nhap: [], xuat: [] });
  
  const [loading, setLoading] = useState(true);

  // Helper to get date range
  const getDates = () => {
    const end = new Date();
    const start = new Date();
    if (dateRange === '6months') {
      start.setMonth(start.getMonth() - 5); // 6 months including current
      start.setDate(1);
      start.setHours(0,0,0,0);
    } else if (dateRange === 'thisMonth') {
      start.setDate(1);
      start.setHours(0,0,0,0);
    } else {
      start.setFullYear(2000); // All time
    }
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { startDate, endDate } = getDates();
      const params = { startDate, endDate };

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
  }, [activeTab, dateRange]);

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + 'đ';

  // Chế biến dữ liệu biểu đồ 6 tháng
  const chartData = useMemo(() => {
    if (activeTab !== 'doanhthu' || !revenueData.chiTietDoanhThu) return [];
    
    // Tạo mảng 6 tháng gần nhất (để làm nhãn trục X)
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`,
        label: `Tháng ${d.getMonth() + 1}`,
        DoanhThu: 0,
        ChiPhi: 0
      });
    }

    // Nhét Doanh thu
    revenueData.chiTietDoanhThu.forEach(hd => {
      const d = new Date(hd.ThoiGianXuat);
      const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      const monthObj = months.find(m => m.key === key);
      if (monthObj) monthObj.DoanhThu += hd.TongTien;
    });

    // Nhét Chi phí
    revenueData.chiTietChiPhi.forEach(pn => {
      const d = new Date(pn.NgayNhap);
      const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      const monthObj = months.find(m => m.key === key);
      if (monthObj) monthObj.ChiPhi += pn.TongTienNhap;
    });

    return months;
  }, [revenueData, activeTab]);

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
  const xuatNhapSummary = useMemo(() => {
    if (activeTab !== 'xuatnhap') return [];
    const summary = {};
    
    // Cộng dồn Nhập
    xuatnhapData.nhap.forEach(n => {
      if (!summary[n.MaNL]) summary[n.MaNL] = { TenNL: n.NGUYENLIEU?.TenNL || n.MaNL, TongNhap: 0, TienNhap: 0, TongXuat: 0, LyDo: [] };
      summary[n.MaNL].TongNhap += n.SoLuong;
      summary[n.MaNL].TienNhap += (n.SoLuong * n.DonGiaNhap);
    });

    // Cộng dồn Xuất
    xuatnhapData.xuat.forEach(x => {
      if (!summary[x.MaNL]) summary[x.MaNL] = { TenNL: x.NGUYENLIEU?.TenNL || x.MaNL, TongNhap: 0, TienNhap: 0, TongXuat: 0, LyDo: [] };
      summary[x.MaNL].TongXuat += x.SoLuong;
      if (x.LyDo && !summary[x.MaNL].LyDo.includes(x.LyDo)) summary[x.MaNL].LyDo.push(x.LyDo);
    });

    return Object.values(summary);
  }, [xuatnhapData, activeTab]);


  return (
    <DesktopLayout>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1><LineChart size={28} /> Báo cáo & Thống kê</h1>
        
        {/* Lọc thời gian */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'white', padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)' }}>
          <Calendar size={18} color="var(--text-light)" />
          <select value={dateRange} onChange={e => setDateRange(e.target.value)} style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 14 }}>
            <option value="thisMonth">Tháng này</option>
            <option value="6months">6 tháng gần nhất</option>
            <option value="all">Tất cả thời gian</option>
          </select>
        </div>
      </div>

      <div className="reports-tabs">
        <button className={activeTab === 'doanhthu' ? 'active' : ''} onClick={() => setActiveTab('doanhthu')}><DollarSign size={16}/> Doanh Thu</button>
        <button className={activeTab === 'haohut' ? 'active' : ''} onClick={() => setActiveTab('haohut')}><AlertTriangle size={16}/> Hao Hụt Kho</button>
        <button className={activeTab === 'xuatnhap' ? 'active' : ''} onClick={() => setActiveTab('xuatnhap')}><PackageOpen size={16}/> Xuất Nhập Kho</button>
      </div>

      {loading ? <div className="page-loading"><div className="spinner" /></div> : (
        <div className="reports-container" style={{ marginTop: 20 }}>
          
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
              <h3>Danh sách Chênh lệch Tồn kho</h3>
              <p style={{ color: 'var(--text-light)', fontSize: 13, marginBottom: 15 }}>Dữ liệu được trích xuất từ các Phiếu Kiểm Kho trong kỳ.</p>
              
              <table className="data-table">
                <thead><tr><th>Phiếu Kiểm</th><th>Ngày</th><th>Nguyên liệu</th><th>Lý thuyết</th><th>Thực tế</th><th>Độ lệch</th><th>Ghi chú</th></tr></thead>
                <tbody>
                  {haohutData.chitiet.map((ct, idx) => {
                    const pkk = haohutData.phieukiem.find(p => p.MaPKK === ct.MaPKK);
                    return (
                      <tr key={idx}>
                        <td><strong>{ct.MaPKK}</strong></td>
                        <td>{pkk ? new Date(pkk.NgayKiem).toLocaleDateString('vi-VN') : ''}</td>
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
                    );
                  })}
                  {haohutData.chitiet.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center' }}>Không có phiếu kiểm kho nào trong kỳ.</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: XUẤT NHẬP KHO */}
          {activeTab === 'xuatnhap' && (
            <div style={{ background: 'var(--surface)', padding: 20, borderRadius: 12, boxShadow: 'var(--shadow-sm)' }}>
              <h3>Tổng hợp Xuất Nhập Kho</h3>
              
              <table className="data-table" style={{ marginTop: 15 }}>
                <thead><tr><th>Nguyên liệu</th><th>Tổng lượng Nhập</th><th>Tổng tiền Nhập</th><th>Tổng lượng Xuất</th><th>Lý do xuất</th></tr></thead>
                <tbody>
                  {xuatNhapSummary.map((item, idx) => (
                    <tr key={idx}>
                      <td><strong>{item.TenNL}</strong></td>
                      <td><span style={{ color: 'var(--success)', fontWeight: 600 }}>+{item.TongNhap}</span></td>
                      <td>{formatPrice(item.TienNhap)}</td>
                      <td><span style={{ color: 'var(--danger)', fontWeight: 600 }}>-{item.TongXuat}</span></td>
                      <td>{item.LyDo.join(', ')}</td>
                    </tr>
                  ))}
                  {xuatNhapSummary.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center' }}>Không có giao dịch xuất/nhập trong kỳ.</td></tr>}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}
    </DesktopLayout>
  );
}
