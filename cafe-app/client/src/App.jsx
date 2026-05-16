import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login/Login';
import CustomerMenu from './pages/Customer/CustomerMenu';
import Cart from './pages/Customer/Cart';
import OrderStatus from './pages/Customer/OrderStatus';
import OrderBoard from './pages/Staff/OrderBoard';
import Payment from './pages/Cashier/Payment';
import InvoiceList from './pages/Cashier/InvoiceList';
import MenuMgmt from './pages/Manager/MenuMgmt';
import TableMgmt from './pages/Manager/TableMgmt';
import StaffMgmt from './pages/Manager/StaffMgmt';
import './App.css';

function PageWrapper({ title, children }) {
  useEffect(() => {
    document.title = title ? `${title} | Nhà Ba Teria` : 'Nhà Ba Teria';
  }, [title]);
  return children;
}

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<PageWrapper title="Đăng nhập"><Login /></PageWrapper>} />

      {/* Customer routes — không cần đăng nhập */}
      <Route path="/order/:tableId" element={<PageWrapper title="Đặt món"><CustomerMenu /></PageWrapper>} />
      <Route path="/cart/:tableId" element={<PageWrapper title="Giỏ hàng"><Cart /></PageWrapper>} />
      <Route path="/order-status/:orderId" element={<PageWrapper title="Tiến độ đơn hàng"><OrderStatus /></PageWrapper>} />

      {/* Staff routes */}
      <Route path="/staff/orders" element={
        <ProtectedRoute roles={['phucvu', 'barista', 'thungan', 'admin']}>
          <PageWrapper title="Phục vụ"><OrderBoard /></PageWrapper>
        </ProtectedRoute>
      } />

      {/* Cashier routes */}
      <Route path="/cashier/payment" element={
        <ProtectedRoute roles={['thungan', 'admin']}>
          <PageWrapper title="Thanh toán"><Payment /></PageWrapper>
        </ProtectedRoute>
      } />
      <Route path="/cashier/invoices" element={
        <ProtectedRoute roles={['thungan', 'admin']}>
          <PageWrapper title="Hóa đơn"><InvoiceList /></PageWrapper>
        </ProtectedRoute>
      } />

      {/* Manager routes */}
      <Route path="/manager/menu" element={
        <ProtectedRoute roles={['admin']}>
          <PageWrapper title="Quản lý Menu"><MenuMgmt /></PageWrapper>
        </ProtectedRoute>
      } />
      <Route path="/manager/tables" element={
        <ProtectedRoute roles={['admin']}>
          <PageWrapper title="Quản lý Bàn"><TableMgmt /></PageWrapper>
        </ProtectedRoute>
      } />
      <Route path="/manager/staff" element={
        <ProtectedRoute roles={['admin']}>
          <PageWrapper title="Nhân viên"><StaffMgmt /></PageWrapper>
        </ProtectedRoute>
      } />

      {/* Default redirect */}
      <Route path="/" element={
        user ? <Navigate to={
          user.role === 'admin' ? '/manager/menu' :
          user.role === 'thungan' ? '/cashier/payment' :
          '/staff/orders'
        } /> : <Navigate to="/login" />
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
