import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Coffee, Minus, Plus, Trash2, Send, MessageSquare } from 'lucide-react';
import { api } from '../../services/api';
import './Cart.css';

export default function Cart() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [noteItem, setNoteItem] = useState(null);
  const [noteText, setNoteText] = useState('');

  const fetchCart = async () => {
    try {
      const data = await api.getCart(tableId);
      setCart((data.items || []).map(i => ({
        MaMon: i.MaMon,
        TenMon: i.MON?.TenMon || '',
        DonGia: i.MON?.DonGia || 0,
        HinhAnh: i.MON?.HinhAnh || '',
        SoLuong: i.SoLuong,
        GhiChu: i.GhiChu || ''
      })));
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchCart(); }, [tableId]);

  const updateQty = async (maMon, delta) => {
    const item = cart.find(c => c.MaMon === maMon);
    if (!item) return;
    const newQty = item.SoLuong + delta;
    if (newQty <= 0) {
      await api.removeFromCart(tableId, maMon);
      setCart(prev => prev.filter(c => c.MaMon !== maMon));
    } else {
      await api.updateCartItem(tableId, maMon, { SoLuong: newQty });
      setCart(prev => prev.map(c => c.MaMon === maMon ? { ...c, SoLuong: newQty } : c));
    }
  };

  const removeItem = async (maMon) => {
    await api.removeFromCart(tableId, maMon);
    setCart(prev => prev.filter(c => c.MaMon !== maMon));
  };

  const saveNote = async () => {
    if (!noteItem) return;
    await api.updateCartItem(tableId, noteItem, { SoLuong: cart.find(c => c.MaMon === noteItem)?.SoLuong || 1, GhiChu: noteText });
    setCart(prev => prev.map(c => c.MaMon === noteItem ? { ...c, GhiChu: noteText } : c));
    setNoteItem(null);
    setNoteText('');
  };

  const sendOrder = async () => {
    if (!cart.length) return;
    setSending(true);
    try {
      const result = await api.createOrder(tableId);
      navigate(`/order-status/${result.MaDH}?table=${tableId}`);
    } catch (err) {
      alert(err.message);
      setSending(false);
    }
  };

  const total = cart.reduce((s, c) => s + c.SoLuong * c.DonGia, 0);
  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + 'đ';

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="cart-page">
      <header className="cart-header">
        <button className="btn btn-icon btn-ghost" onClick={() => navigate(`/order/${tableId}`)}>
          <ArrowLeft size={22} />
        </button>
        <h2>Giỏ hàng</h2>
        <span className="table-tag-sm">Bàn {tableId.replace('B', '')}</span>
      </header>

      {cart.length === 0 ? (
        <div className="empty-state">
          <Coffee size={64} strokeWidth={1} />
          <h3>Giỏ hàng trống</h3>
          <p>Hãy quay lại menu để chọn món nhé!</p>
          <button className="btn btn-primary" onClick={() => navigate(`/order/${tableId}`)}>Xem menu</button>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cart.map(item => (
              <div key={item.MaMon} className="cart-item">
                <div className="cart-item-img">
                  <img
                    src={`/images/menu/${item.HinhAnh}`}
                    alt={item.TenMon}
                    onError={e => { e.target.src = `https://placehold.co/80x80/F5E6D3/8B4513?text=☕`; }}
                  />
                </div>
                <div className="cart-item-info">
                  <h4>{item.TenMon}</h4>
                  <p className="cart-item-price">{formatPrice(item.DonGia)}</p>
                  {item.GhiChu && <p className="cart-item-note">📝 {item.GhiChu}</p>}
                  <div className="cart-item-controls">
                    <div className="qty-control-sm">
                      <button onClick={() => updateQty(item.MaMon, -1)}><Minus size={14} /></button>
                      <span>{item.SoLuong}</span>
                      <button onClick={() => updateQty(item.MaMon, 1)}><Plus size={14} /></button>
                    </div>
                    <div className="cart-item-buttons">
                      <button className="note-btn" onClick={() => { setNoteItem(item.MaMon); setNoteText(item.GhiChu); }}>
                        <MessageSquare size={16} />
                      </button>
                      <button className="remove-btn" onClick={() => removeItem(item.MaMon)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="cart-item-total">
                  {formatPrice(item.SoLuong * item.DonGia)}
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-row">
              <span>Tổng ({cart.reduce((s, c) => s + c.SoLuong, 0)} món)</span>
              <span className="summary-total">{formatPrice(total)}</span>
            </div>
            <button className="btn btn-primary btn-lg btn-block send-order-btn" onClick={sendOrder} disabled={sending}>
              {sending ? <div className="spinner" style={{width:20,height:20,borderWidth:2}} /> : <><Send size={18} /> Gửi order</>}
            </button>
            <button className="btn btn-ghost btn-block" onClick={() => navigate(`/order/${tableId}`)}>
              ← Thêm món
            </button>
          </div>
        </>
      )}

      {/* Note Modal */}
      {noteItem && (
        <div className="modal-overlay" onClick={() => setNoteItem(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Ghi chú món</h3>
              <button className="btn btn-icon btn-ghost" onClick={() => setNoteItem(null)}><ArrowLeft size={18} /></button>
            </div>
            <div className="modal-body">
              <textarea
                className="input-field"
                rows="3"
                placeholder="Ít đường, nhiều đá, không whipping..."
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setNoteItem(null)}>Hủy</button>
              <button className="btn btn-primary" onClick={saveNote}>Lưu ghi chú</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
