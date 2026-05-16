import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Coffee, CreditCard, FileText, UtensilsCrossed, LayoutGrid, Users, LogOut, ChevronLeft, Menu } from 'lucide-react';
import { useState } from 'react';
import './DesktopLayout.css';

const NAV_ITEMS = {
  thungan: [
    { to: '/cashier/payment', icon: CreditCard, label: 'Thanh toán' },
    { to: '/cashier/invoices', icon: FileText, label: 'Hóa đơn' },
    { to: '/staff/orders', icon: LayoutGrid, label: 'Order Board' },
  ],
  admin: [
    { to: '/manager/menu', icon: UtensilsCrossed, label: 'Quản lý Menu' },
    { to: '/manager/tables', icon: LayoutGrid, label: 'Quản lý Bàn' },
    { to: '/manager/staff', icon: Users, label: 'Nhân viên' },
    { to: '/cashier/payment', icon: CreditCard, label: 'Thanh toán' },
    { to: '/cashier/invoices', icon: FileText, label: 'Hóa đơn' },
    { to: '/staff/orders', icon: LayoutGrid, label: 'Order Board' },
  ],
};

export default function DesktopLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = NAV_ITEMS[user?.role] || NAV_ITEMS.admin;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className={`desktop-layout ${collapsed ? 'collapsed' : ''}`}>
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <Coffee size={24} />
            {!collapsed && <span>Nhà Ba Teria</span>}
          </div>
          <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Icon size={20} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          {!collapsed && (
            <div className="user-info">
              <div className="user-avatar">{user?.hoTen?.charAt(0) || 'U'}</div>
              <div>
                <p className="user-name">{user?.hoTen}</p>
                <p className="user-role">{user?.role === 'admin' ? 'Quản lý' : 'Thu ngân'}</p>
              </div>
            </div>
          )}
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            {!collapsed && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
