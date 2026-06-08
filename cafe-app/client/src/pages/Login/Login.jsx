import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Coffee, Eye, EyeOff, LogIn } from 'lucide-react';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(username, password);
      // Redirect theo vai trò
      switch (user.role) {
        case 'admin': navigate('/manager/menu'); break;
        case 'thungan': navigate('/cashier/payment'); break;
        case 'barista':
        case 'phucvu': navigate('/staff/orders'); break;
        default: navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-pattern" />
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">
            <Coffee size={36} strokeWidth={2} />
          </div>
          <h1>Nhà Ba Teria</h1>
          <p>Hệ thống quản lý quán cafe</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error">{error}</div>}

          <div className="input-group">
            <label htmlFor="username">Tài khoản</label>
            <input
              id="username"
              className="input-field"
              type="text"
              placeholder="Nhập tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Mật khẩu</label>
            <div className="password-wrapper">
              <input
                id="password"
                className="input-field"
                type={showPw ? 'text' : 'password'}
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" className="password-toggle" onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg btn-block login-btn" disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : <><LogIn size={18} /> Đăng nhập</>}
          </button>
        </form>

        <div className="login-demo-info">
          <p>Tài khoản demo:</p>
          <div className="demo-accounts">
            <span onClick={() => { setUsername('admin'); setPassword('123456'); }}>admin</span>
            <span onClick={() => { setUsername('thungan'); setPassword('123456'); }}>thungan</span>
            <span onClick={() => { setUsername('phucvu1'); setPassword('123456'); }}>phucvu</span>
            <span onClick={() => { setUsername('barista1'); setPassword('123456'); }}>barista</span>
          </div>
          <p className="demo-pw">Mật khẩu: <strong>123456</strong></p>
        </div>
      </div>
    </div>
  );
}
