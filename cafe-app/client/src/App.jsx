import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login/Login';
import CustomerMenu from './pages/Customer/CustomerMenu';
import Cart from './pages/Customer/Cart';
import OrderStatus from './pages/Customer/OrderStatus';
import OrderBoard from './pages/Staff/OrderBoard';
import './App.css';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" />;
  return children;
}

// Placeholder pages — sẽ được xây dựng ở các Phase tiếp theo
function PlaceholderPage({ title }) {
  return (
    <div className="page-loading">
      <h2>{title}</h2>
      <p style={{ color: 'var(--text-muted)' }}>Đang phát triển...</p>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Customer routes — không cần đăng nhập */}
      <Route path="/order/:tableId" element={<CustomerMenu />} />
      <Route path="/cart/:tableId" element={<Cart />} />
      <Route path="/order-status/:orderId" element={<OrderStatus />} />

      {/* Staff routes */}
      <Route path="/staff/orders" element={
        <ProtectedRoute roles={['phucvu', 'barista', 'thungan', 'admin']}>
          <OrderBoard />
        </ProtectedRoute>
      } />

      {/* Cashier routes */}
      <Route path="/cashier/payment" element={
        <ProtectedRoute roles={['thungan', 'admin']}>
          <PlaceholderPage title="Thanh Toán" />
        </ProtectedRoute>
      } />
      <Route path="/cashier/invoices" element={
        <ProtectedRoute roles={['thungan', 'admin']}>
          <PlaceholderPage title="Quản Lý Hóa Đơn" />
        </ProtectedRoute>
      } />

      {/* Manager routes */}
      <Route path="/manager/menu" element={
        <ProtectedRoute roles={['admin']}>
          <PlaceholderPage title="Quản Lý Menu" />
        </ProtectedRoute>
      } />
      <Route path="/manager/tables" element={
        <ProtectedRoute roles={['admin']}>
          <PlaceholderPage title="Quản Lý Bàn" />
        </ProtectedRoute>
      } />
      <Route path="/manager/staff" element={
        <ProtectedRoute roles={['admin']}>
          <PlaceholderPage title="Quản Lý Nhân Viên" />
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
