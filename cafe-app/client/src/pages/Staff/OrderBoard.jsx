import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Clock, ChefHat, CheckCircle2, Truck, LogOut, RefreshCw, Coffee, ChevronRight, User } from 'lucide-react';
import { api } from '../../services/api';
import './OrderBoard.css';

const STATUSES = [
  { key: 'Cho', label: 'Chờ', icon: Clock, color: '#F39C12', bgColor: '#FEF5E7' },
  { key: 'DangLam', label: 'Đang làm', icon: ChefHat, color: '#3498DB', bgColor: '#EBF5FB' },
  { key: 'HoanThanh', label: 'Hoàn thành', icon: CheckCircle2, color: '#27AE60', bgColor: '#E8F8EF' },
  { key: 'DaGiao', label: 'Đã giao', icon: Truck, color: '#8C7B6B', bgColor: '#F0EBE5' },
];

const NEXT_STATUS = { Cho: 'DangLam', DangLam: 'HoanThanh', HoanThanh: 'DaGiao' };
const ACTION_LABELS = { Cho: 'Bắt đầu làm', DangLam: 'Hoàn thành', HoanThanh: 'Đã giao' };

export default function OrderBoard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('Cho');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await api.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.MaDH === orderId ? { ...o, TrangThaiOrder: newStatus } : o));
    } catch (err) { alert(err.message); }
    setUpdating(null);
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const filteredOrders = orders.filter(o => o.TrangThaiOrder === activeTab);
  const countByStatus = (key) => orders.filter(o => o.TrangThaiOrder === key).length;

  const formatTime = (t) => {
    const d = new Date(t);
    const now = new Date();
    const diff = Math.floor((now - d) / 60000);
    if (diff < 1) return 'Vừa xong';
    if (diff < 60) return `${diff} phút`;
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const activeStatus = STATUSES.find(s => s.key === activeTab);

  if (loading) return <div className="page-loading"><div className="spinner" /><p>Đang tải đơn hàng...</p></div>;

  return (
    <div className="board-page">
      {/* Header */}
      <header className="board-header">
        <div className="board-brand">
          <Coffee size={22} />
          <div>
            <h1>Order Board</h1>
            <span className="board-user"><User size={12} /> {user?.hoTen} ({user?.role})</span>
          </div>
        </div>
        <div className="board-actions">
          <button className="btn btn-icon btn-ghost" onClick={fetchOrders} title="Refresh">
            <RefreshCw size={18} />
          </button>
          <button className="btn btn-icon btn-ghost" onClick={handleLogout} title="Đăng xuất">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Status Tabs */}
      <div className="status-tabs">
        {STATUSES.map(s => {
          const Icon = s.icon;
          const count = countByStatus(s.key);
          return (
            <button
              key={s.key}
              className={`status-tab ${activeTab === s.key ? 'active' : ''}`}
              onClick={() => setActiveTab(s.key)}
              style={activeTab === s.key ? { borderColor: s.color, color: s.color, background: s.bgColor } : {}}
            >
              <Icon size={16} />
              <span className="tab-label">{s.label}</span>
              {count > 0 && (
                <span className="tab-count" style={activeTab === s.key ? { background: s.color } : {}}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Order Cards */}
      <div className="order-list">
        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            {activeStatus && <activeStatus.icon size={48} strokeWidth={1} />}
            <p>Không có đơn nào ở trạng thái "{activeStatus?.label}"</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.MaDH} className="order-card">
              <div className="order-card-header">
                <div>
                  <span className="order-id">#{order.MaDH}</span>
                  <span className="order-table">{order.BAN?.TenBan || ''}</span>
                </div>
                <span className="order-time">{formatTime(order.ThoiGianDat)}</span>
              </div>

              <div className="order-items-list">
                {(order.CHITIETDONHANG || []).map(item => (
                  <div key={item.MaMon} className="order-item-row">
                    <span className="oi-qty">{item.SoLuong}x</span>
                    <span className="oi-name">{item.MON?.TenMon || item.MaMon}</span>
                    {item.GhiChu && <span className="oi-note">({item.GhiChu})</span>}
                  </div>
                ))}
              </div>

              {(() => {
                const next = NEXT_STATUS[order.TrangThaiOrder];
                if (!next) return null;
                // Phân quyền: barista chỉ Chờ→Đang làm, Đang làm→Hoàn thành
                //              phucvu chỉ Hoàn thành→Đã giao
                //              admin được tất cả
                const role = user?.role;
                const from = order.TrangThaiOrder;
                let canAct = role === 'admin';
                if (role === 'barista' && (from === 'Cho' || from === 'DangLam')) canAct = true;
                if (role === 'phucvu' && from === 'HoanThanh') canAct = true;
                if (!canAct) return null;

                return (
                  <button
                    className="order-action-btn"
                    style={{ background: STATUSES.find(s => s.key === next)?.color }}
                    onClick={() => updateStatus(order.MaDH, next)}
                    disabled={updating === order.MaDH}
                  >
                    {updating === order.MaDH ? (
                      <div className="spinner" style={{width:18,height:18,borderWidth:2,borderColor:'rgba(255,255,255,0.3)',borderTopColor:'white'}} />
                    ) : (
                      <>
                        {ACTION_LABELS[order.TrangThaiOrder]}
                        <ChevronRight size={16} />
                      </>
                    )}
                  </button>
                );
              })()}
            </div>
          ))
        )}
      </div>

      {/* Auto refresh indicator */}
      <div className="refresh-indicator">
        <RefreshCw size={12} /> Tự động cập nhật mỗi 5 giây
      </div>
    </div>
  );
}
