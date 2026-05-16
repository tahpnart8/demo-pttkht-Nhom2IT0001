import { useState, useEffect } from 'react';
import DesktopLayout from '../../components/Layout/DesktopLayout';
import { FileText, Search, Eye, Trash2, X } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './InvoiceList.css';

export default function InvoiceList() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState('');
  const [detail, setDetail] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchInvoices = async () => {
    try {
      const data = await api.getInvoices();
      setInvoices(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchInvoices(); }, []);

  const viewDetail = async (id) => {
    const data = await api.getInvoice(id);
    setDetail(data);
  };

  const deleteInvoice = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa hóa đơn này?')) return;
    try {
      await api.deleteInvoice(id);
      setInvoices(prev => prev.filter(i => i.MaHD !== id));
      setToast({ type: 'success', msg: 'Đã xóa hóa đơn' });
    } catch (err) { setToast({ type: 'error', msg: err.message }); }
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = invoices.filter(i => !searchId || i.MaHD.toLowerCase().includes(searchId.toLowerCase()));
  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + 'đ';
  const formatDate = (t) => new Date(t).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <DesktopLayout>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      <div className="page-header">
        <h1><FileText size={28} /> Quản lý hóa đơn</h1>
        <div className="header-search">
          <Search size={16} />
          <input placeholder="Tìm mã HĐ..." value={searchId} onChange={e => setSearchId(e.target.value)} />
        </div>
      </div>

      {loading ? <div className="page-loading"><div className="spinner" /></div> : (
        <table className="data-table">
          <thead>
            <tr><th>Mã HĐ</th><th>Thời gian</th><th>Tổng tiền</th><th>Thu ngân</th><th>Thao tác</th></tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="5" style={{textAlign:'center',padding:'40px',color:'var(--text-muted)'}}>Chưa có hóa đơn nào</td></tr>
            ) : filtered.map(inv => (
              <tr key={inv.MaHD}>
                <td><strong>{inv.MaHD}</strong></td>
                <td>{formatDate(inv.ThoiGianXuat)}</td>
                <td style={{fontWeight:700,color:'var(--accent)'}}>{formatPrice(inv.TongTien)}</td>
                <td>{inv.NHANVIEN?.HoTen || '—'}</td>
                <td className="actions">
                  <button className="btn btn-sm btn-outline" onClick={() => viewDetail(inv.MaHD)}><Eye size={14} /> Xem</button>
                  {user?.role === 'admin' && <button className="btn btn-sm btn-ghost" style={{color:'var(--danger)'}} onClick={() => deleteInvoice(inv.MaHD)}><Trash2 size={14} /></button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Detail Modal */}
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth:550}}>
            <div className="modal-header">
              <h3>Chi tiết hóa đơn #{detail.MaHD}</h3>
              <button className="btn btn-icon btn-ghost" onClick={() => setDetail(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p><strong>Thời gian:</strong> {formatDate(detail.ThoiGianXuat)}</p>
              <p><strong>Thu ngân:</strong> {detail.NHANVIEN?.HoTen || '—'}</p>
              <hr style={{margin:'12px 0',border:'none',borderTop:'1px solid var(--border-light)'}} />
              {(detail.DONHANG || []).map(o => (
                <div key={o.MaDH} style={{marginBottom:12}}>
                  <p style={{fontWeight:700,fontSize:'0.85rem',marginBottom:4}}>Đơn #{o.MaDH}</p>
                  {(o.CHITIETDONHANG||[]).map(i => (
                    <div key={i.MaMon} style={{display:'flex',justifyContent:'space-between',padding:'4px 0',fontSize:'0.88rem'}}>
                      <span>{i.SoLuong}x {i.MON?.TenMon || i.MaMon}</span>
                      <span>{formatPrice(i.SoLuong * i.DonGia)}</span>
                    </div>
                  ))}
                </div>
              ))}
              <div style={{display:'flex',justifyContent:'space-between',padding:'12px 0',borderTop:'2px solid var(--primary-light)',fontWeight:800,fontSize:'1.1rem',marginTop:8}}>
                <span>TỔNG</span><span style={{color:'var(--accent)'}}>{formatPrice(detail.TongTien)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </DesktopLayout>
  );
}
