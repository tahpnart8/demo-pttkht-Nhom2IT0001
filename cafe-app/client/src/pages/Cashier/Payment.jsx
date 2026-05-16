import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DesktopLayout from '../../components/Layout/DesktopLayout';
import { CreditCard, Search, Check, Printer, Ban } from 'lucide-react';
import { api } from '../../services/api';
import './Payment.css';

export default function Payment() {
  const { user } = useAuth();
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [payMethod, setPayMethod] = useState('TienMat');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    api.getTables().then(data => {
      setTables(data.filter(t => t.TrangThai === 'DangCoKhach'));
      setLoading(false);
    });
  }, []);

  const loadOrders = async (tableId) => {
    setSelectedTable(tableId);
    setSelectedOrders([]);
    const data = await api.getOrders({ table: tableId });
    setOrders(data.filter(o => !o.MaHD));
  };

  const toggleOrder = (maDH, trangThai) => {
    if (trangThai !== 'DaGiao') return;
    setSelectedOrders(prev => prev.includes(maDH) ? prev.filter(id => id !== maDH) : [...prev, maDH]);
  };

  const selectAll = () => {
    const validOrders = orders.filter(o => o.TrangThaiOrder === 'DaGiao');
    if (selectedOrders.length === validOrders.length && validOrders.length > 0) setSelectedOrders([]);
    else setSelectedOrders(validOrders.map(o => o.MaDH));
  };

  const getTotal = () => {
    return orders.filter(o => selectedOrders.includes(o.MaDH)).reduce((sum, o) =>
      sum + (o.CHITIETDONHANG || []).reduce((s, i) => s + i.SoLuong * i.DonGia, 0), 0);
  };

  const handlePayment = async () => {
    if (!selectedOrders.length) return;
    setProcessing(true);
    try {
      const inv = await api.createInvoice(selectedOrders, user.maNV);
      await api.createPayment({ MaHD: inv.MaHD, SoTien: inv.TongTien, PhuongThuc: payMethod, MaNV: user.maNV });
      setToast({ type: 'success', msg: `Thanh toán thành công! HĐ: ${inv.MaHD}` });
      // Refresh
      setOrders(prev => prev.filter(o => !selectedOrders.includes(o.MaDH)));
      setSelectedOrders([]);
      const tbs = await api.getTables();
      setTables(tbs.filter(t => t.TrangThai === 'DangCoKhach'));
      if (!orders.filter(o => !selectedOrders.includes(o.MaDH)).length) setSelectedTable(null);
    } catch (err) { setToast({ type: 'error', msg: err.message }); }
    setProcessing(false);
    setTimeout(() => setToast(null), 3000);
  };

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + 'đ';

  return (
    <DesktopLayout>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      <div className="page-header">
        <h1><CreditCard size={28} /> Thanh toán</h1>
      </div>

      <div className="payment-layout">
        {/* Left: Tables */}
        <div className="payment-left">
          <h3>Bàn đang có khách ({tables.length})</h3>
          {loading ? <div className="spinner" /> : tables.length === 0 ? (
            <div className="empty-state" style={{padding: '40px 0'}}><Ban size={40} strokeWidth={1} /><p>Chưa có bàn nào cần thanh toán</p></div>
          ) : (
            <div className="table-grid-pay">
              {tables.map(t => (
                <button key={t.MaBan} className={`table-btn ${selectedTable === t.MaBan ? 'active' : ''}`} onClick={() => loadOrders(t.MaBan)}>
                  {t.TenBan}
                </button>
              ))}
            </div>
          )}

          {selectedTable && orders.length > 0 && (
            <div className="order-select-list">
              <div className="osl-header">
                <h4>Đơn hàng chưa thanh toán</h4>
                <button className="btn btn-ghost btn-sm" onClick={selectAll}>
                  {selectedOrders.length === orders.length ? 'Bỏ chọn' : 'Chọn tất cả'}
                </button>
              </div>
              {orders.map(o => {
                const canPay = o.TrangThaiOrder === 'DaGiao';
                return (
                <label key={o.MaDH} className={`order-select-item ${selectedOrders.includes(o.MaDH) ? 'selected' : ''}`} style={!canPay ? {opacity: 0.6, cursor: 'not-allowed'} : {}}>
                  <input type="checkbox" checked={selectedOrders.includes(o.MaDH)} disabled={!canPay} onChange={() => toggleOrder(o.MaDH, o.TrangThaiOrder)} />
                  <div className="osi-info">
                    <span className="osi-id">#{o.MaDH}</span>
                    <span className="osi-time">{new Date(o.ThoiGianDat).toLocaleTimeString('vi-VN', {hour:'2-digit',minute:'2-digit'})}</span>
                    {!canPay && <span style={{marginLeft: 8, fontSize: '0.75rem', color: 'var(--danger)', fontWeight: '600'}}>({
                      o.TrangThaiOrder === 'Cho' ? 'Đang chờ' : o.TrangThaiOrder === 'DangLam' ? 'Đang làm' : 'Hoàn thành (Chưa giao)'
                    })</span>}
                  </div>
                  <span className="osi-total">
                    {formatPrice((o.CHITIETDONHANG||[]).reduce((s,i)=>s+i.SoLuong*i.DonGia,0))}
                  </span>
                </label>
              )})}
            </div>
          )}
        </div>

        {/* Right: Payment Details */}
        <div className="payment-right">
          {selectedOrders.length > 0 ? (
            <>
              <h3>Chi tiết thanh toán</h3>
              <div className="pay-detail-items">
                {orders.filter(o => selectedOrders.includes(o.MaDH)).flatMap(o =>
                  (o.CHITIETDONHANG||[]).map(i => (
                    <div key={`${o.MaDH}-${i.MaMon}`} className="pay-item">
                      <span>{i.SoLuong}x {i.MON?.TenMon || i.MaMon}</span>
                      <span>{formatPrice(i.SoLuong * i.DonGia)}</span>
                    </div>
                  ))
                )}
              </div>
              <div className="pay-total-row">
                <span>TỔNG CỘNG</span>
                <span className="pay-total-value">{formatPrice(getTotal())}</span>
              </div>

              <div className="pay-method">
                <h4>Phương thức thanh toán</h4>
                <div className="method-options">
                  {[{v:'TienMat',l:'💵 Tiền mặt'},{v:'CK',l:'📱 Chuyển khoản'},{v:'Visa',l:'💳 Visa'}].map(m => (
                    <button key={m.v} className={`method-btn ${payMethod === m.v ? 'active' : ''}`} onClick={() => setPayMethod(m.v)}>
                      {m.l}
                    </button>
                  ))}
                </div>
              </div>

              <button className="btn btn-primary btn-lg btn-block pay-confirm-btn" onClick={handlePayment} disabled={processing}>
                {processing ? <div className="spinner" style={{width:20,height:20,borderWidth:2}} /> : <><Check size={20} /> Xác nhận thanh toán</>}
              </button>
            </>
          ) : (
            <div className="empty-state" style={{padding:'60px 0'}}>
              <CreditCard size={56} strokeWidth={1} />
              <p>Chọn bàn và đơn hàng để thanh toán</p>
            </div>
          )}
        </div>
      </div>
    </DesktopLayout>
  );
}
