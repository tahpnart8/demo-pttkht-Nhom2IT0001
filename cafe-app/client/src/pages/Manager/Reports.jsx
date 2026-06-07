import { useState, useEffect } from 'react';
import DesktopLayout from '../../components/Layout/DesktopLayout';
import { LineChart, ArrowUpCircle, ArrowDownCircle, DollarSign, Trophy } from 'lucide-react';
import { api } from '../../services/api';
import './Reports.css';

export default function Reports() {
  const [revenueData, setRevenueData] = useState({ doanhThu: 0, chiPhiNhap: 0, loiNhuan: 0 });
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [revData, bestData] = await Promise.all([api.getRevenueReport(), api.getBestSellers()]);
        setRevenueData(revData);
        setBestSellers(bestData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + 'đ';

  return (
    <DesktopLayout>
      <div className="page-header">
        <h1><LineChart size={28} /> Báo cáo & Thống kê</h1>
      </div>

      {loading ? <div className="page-loading"><div className="spinner" /></div> : (
        <div className="reports-container">
          
          {/* Dashboard Cards */}
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

          <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
            {/* Best Sellers */}
            <div style={{ flex: 1, background: 'var(--surface)', padding: 20, borderRadius: 12, boxShadow: 'var(--shadow-sm)' }}>
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

            <div style={{ flex: 1, background: 'var(--surface)', padding: 20, borderRadius: 12, boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)' }}>
              <LineChart size={64} style={{ opacity: 0.2, marginBottom: 10 }} />
              <p>Biểu đồ doanh thu theo ngày</p>
              <span className="badge badge-warning" style={{ marginTop: 10 }}>Tính năng đang phát triển</span>
            </div>
          </div>

        </div>
      )}
    </DesktopLayout>
  );
}
