import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Coffee, ShoppingCart, ShoppingBag, Search, Plus, Minus, X, ClipboardList } from 'lucide-react';
import { api } from '../../services/api';
import './CustomerMenu.css';

export default function CustomerMenu() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const [menus, setMenus] = useState([]);
  const [activeMenu, setActiveMenu] = useState('all');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingItem, setAddingItem] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);

  useEffect(() => {
    api.getMenu().then(data => {
      setMenus(data);
      setLoading(false);
    }).catch(() => setLoading(false));

    api.getCart(tableId).then(data => {
      if (data.items?.length) {
        setCart(data.items.map(i => ({
          MaMon: i.MaMon,
          TenMon: i.MON?.TenMon,
          DonGia: i.MON?.DonGia,
          HinhAnh: i.MON?.HinhAnh,
          SoLuong: i.SoLuong,
          GhiChu: i.GhiChu || ''
        })));
      }
    }).catch(() => {});

    api.getOrders({ table: tableId }).then(data => {
      // Tìm đơn hàng chưa thanh toán (bao gồm cả đã giao nhưng chưa tính tiền)
      const active = data.find(o => !o.MaHD);
      if (active) setActiveOrder(active.MaDH);
    }).catch(() => {});
  }, [tableId]);

  const allItems = menus.flatMap(m => (m.MON || []).map(mon => ({ ...mon, TenMenu: m.TenMenu })));

  const filtered = allItems.filter(item => {
    const matchMenu = activeMenu === 'all' || item.MaMenu === activeMenu;
    const matchSearch = !search || item.TenMon.toLowerCase().includes(search.toLowerCase());
    return matchMenu && matchSearch && item.TrangThai === 'ConMon';
  });

  const cartCount = cart.reduce((s, c) => s + c.SoLuong, 0);
  const cartTotal = cart.reduce((s, c) => s + c.SoLuong * c.DonGia, 0);

  const addToCart = async (item) => {
    setAddingItem(item.MaMon);
    try {
      await api.addToCart(tableId, { MaMon: item.MaMon, SoLuong: 1 });
      setCart(prev => {
        const existing = prev.find(c => c.MaMon === item.MaMon);
        if (existing) return prev.map(c => c.MaMon === item.MaMon ? { ...c, SoLuong: c.SoLuong + 1 } : c);
        return [...prev, { MaMon: item.MaMon, TenMon: item.TenMon, DonGia: item.DonGia, HinhAnh: item.HinhAnh, SoLuong: 1, GhiChu: '' }];
      });
    } catch (err) { console.error(err); }
    setTimeout(() => setAddingItem(null), 300);
  };

  const getItemQty = (maMon) => cart.find(c => c.MaMon === maMon)?.SoLuong || 0;

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

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + 'đ';

  if (loading) return <div className="page-loading"><div className="spinner" /><p>Đang tải menu...</p></div>;

  const renderItem = (item) => {
    const qty = getItemQty(item.MaMon);
    return (
      <div key={item.MaMon} className={`menu-card ${addingItem === item.MaMon ? 'adding' : ''}`}>
        <div className="menu-card-img">
          <img
            src={`/images/menu/${item.HinhAnh}`}
            alt={item.TenMon}
            onError={(e) => { e.target.src = `https://placehold.co/300x200/F5E6D3/8B4513?text=${encodeURIComponent(item.TenMon)}`; }}
          />
          {item.TrangThai === 'HetMon' && <div className="sold-out-badge">Hết món</div>}
        </div>
        <div className="menu-card-info">
          <h3>{item.TenMon}</h3>
          <p className="menu-price">{formatPrice(item.DonGia)}</p>
          <div className="menu-card-actions">
            {qty > 0 ? (
              <div className="qty-control">
                <button className="qty-btn" onClick={() => updateQty(item.MaMon, -1)}><Minus size={16} /></button>
                <span className="qty-value">{qty}</span>
                <button className="qty-btn" onClick={() => updateQty(item.MaMon, 1)}><Plus size={16} /></button>
              </div>
            ) : (
              <button className="btn btn-primary btn-sm add-btn" onClick={() => addToCart(item)}>
                <Plus size={16} /> Thêm
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="customer-page">
      {/* Header */}
      <header className="customer-header" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div className="customer-brand">
          <Coffee size={24} />
          <div>
            <h1>Nhà Ba Teria</h1>
            <span className="table-tag">Bàn {tableId.replace('B', '')}</span>
          </div>
        </div>
        <button 
          className="btn btn-icon" 
          style={{color: 'white', background: 'rgba(255,255,255,0.2)', padding: '8px', display: 'flex', borderRadius: '50%'}} 
          onClick={() => {
            if (activeOrder) navigate(`/order-status/${activeOrder}?table=${tableId}`);
            else navigate(`/cart/${tableId}`);
          }} 
          title={activeOrder ? "Theo dõi đơn hàng" : "Giỏ hàng"}
        >
          <ShoppingBag size={20} />
        </button>
      </header>

      {/* Search */}
      <div className="customer-search">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Tìm món..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && <button className="search-clear" onClick={() => setSearch('')}><X size={16} /></button>}
      </div>

      {/* Category Tabs */}
      <div className="category-tabs">
        <button
          className={`cat-tab ${activeMenu === 'all' ? 'active' : ''}`}
          onClick={() => setActiveMenu('all')}
        >Tất cả</button>
        {menus.map(m => (
          <button
            key={m.MaMenu}
            className={`cat-tab ${activeMenu === m.MaMenu ? 'active' : ''}`}
            onClick={() => setActiveMenu(m.MaMenu)}
          >{m.TenMenu}</button>
        ))}
      </div>

      {/* Menu Grid */}
      {activeMenu === 'all' && !search ? (
        Object.entries(
          filtered.reduce((acc, item) => {
            if (!acc[item.TenMenu]) acc[item.TenMenu] = [];
            acc[item.TenMenu].push(item);
            return acc;
          }, {})
        ).map(([category, items]) => (
          <div key={category} className="menu-category-section">
            <h2 className="menu-category-title">
              <span>{category}</span>
            </h2>
            <div className="menu-grid">
              {items.map(renderItem)}
            </div>
          </div>
        ))
      ) : (
        <div className="menu-grid">
          {filtered.map(renderItem)}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="empty-state">
          <Coffee size={48} strokeWidth={1} />
          <p>Không tìm thấy món nào</p>
        </div>
      )}

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <button className="floating-cart" onClick={() => navigate(`/cart/${tableId}`)}>
          <div className="cart-left">
            <ShoppingCart size={20} />
            <span className="cart-badge">{cartCount}</span>
            <span>Giỏ hàng</span>
          </div>
          <span className="cart-total">{formatPrice(cartTotal)}</span>
        </button>
      )}
    </div>
  );
}
