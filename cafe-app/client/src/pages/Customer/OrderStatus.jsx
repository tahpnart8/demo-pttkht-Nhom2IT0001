import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Coffee, Clock, ChefHat, CheckCircle2, Truck, ArrowLeft, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import './OrderStatus.css';

const STATUS_MAP = {
  Cho: { label: 'Đang chờ', icon: Clock, color: 'var(--status-cho)', step: 1 },
  DangLam: { label: 'Đang pha chế', icon: ChefHat, color: 'var(--status-danglam)', step: 2 },
  HoanThanh: { label: 'Hoàn thành', icon: CheckCircle2, color: 'var(--status-hoanthanh)', step: 3 },
  DaGiao: { label: 'Đã giao', icon: Truck, color: 'var(--status-dagiao)', step: 4 },
};

const STEPS = ['Cho', 'DangLam', 'HoanThanh', 'DaGiao'];

export default function OrderStatus() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get('table');
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const data = await api.getOrder(orderId);
      setOrder(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 2000);
    return () => clearInterval(interval);
  }, [orderId]);

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + 'đ';
  const formatTime = (t) => new Date(t).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  if (loading) return <div className="page-loading"><div className="spinner" /><p>Đang tải...</p></div>;
  if (!order) return <div className="page-loading"><p>Không tìm thấy đơn hàng</p></div>;

  const currentStatus = STATUS_MAP[order.TrangThaiOrder] || STATUS_MAP.Cho;
  const currentStep = currentStatus.step;
  const StatusIcon = currentStatus.icon;

  return (
    <div className="status-page">
      <header className="status-header">
        {tableId && (
          <button className="btn btn-icon btn-ghost" onClick={() => navigate(`/order/${tableId}`)}>
            <ArrowLeft size={22} />
          </button>
        )}
        <div>
          <h2>Theo dõi order</h2>
          <span className="status-order-id">#{orderId}</span>
        </div>
        <button className="btn btn-icon btn-ghost refresh-btn" onClick={fetchOrder}>
          <RefreshCw size={18} />
        </button>
      </header>

      {/* Status Hero */}
      <div className="status-hero" style={{ background: `linear-gradient(135deg, ${currentStatus.color}15, ${currentStatus.color}08)` }}>
        <div className="status-icon-big" style={{ background: currentStatus.color }}>
          <StatusIcon size={32} color="white" />
        </div>
        <h3 style={{ color: currentStatus.color }}>{currentStatus.label}</h3>
        <p>Đặt lúc {formatTime(order.ThoiGianDat)} • {order.BAN?.TenBan || ''}</p>
      </div>

      {/* Progress Steps */}
      <div className="progress-steps">
        {STEPS.map((step, idx) => {
          const info = STATUS_MAP[step];
          const Icon = info.icon;
          const isActive = idx + 1 <= currentStep;
          const isCurrent = idx + 1 === currentStep;
          return (
            <div key={step} className={`progress-step ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}>
              <div className="step-indicator" style={isActive ? { background: info.color, borderColor: info.color } : {}}>
                <Icon size={16} />
              </div>
              <span>{info.label}</span>
              {idx < STEPS.length - 1 && <div className={`step-line ${isActive ? 'active' : ''}`} />}
            </div>
          );
        })}
      </div>

      {/* Order Items */}
      <div className="status-items">
        <h4>Chi tiết đơn hàng</h4>
        {(order.CHITIETDONHANG || []).map(item => (
          <div key={item.MaMon} className="status-item">
            <span className="item-qty">{item.SoLuong}x</span>
            <span className="item-name">{item.MON?.TenMon || item.MaMon}</span>
            <span className="item-price">{formatPrice(item.SoLuong * item.DonGia)}</span>
          </div>
        ))}
        <div className="status-total">
          <span>Tổng cộng</span>
          <span>{formatPrice((order.CHITIETDONHANG || []).reduce((s, i) => s + i.SoLuong * i.DonGia, 0))}</span>
        </div>
      </div>

      <p className="auto-refresh-note">
        <RefreshCw size={14} /> Tự động cập nhật mỗi 2 giây
      </p>
    </div>
  );
}
