import { useState, useEffect } from 'react';
import DesktopLayout from '../../components/Layout/DesktopLayout';
import { Users, Plus, Edit, Trash2, X } from 'lucide-react';
import { api } from '../../services/api';

export default function StaffMgmt() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ MaNV:'', HoTen:'', SoDienThoai:'', ViTri:'Phục vụ', TenDangNhap:'', MatKhau:'123456', QuyenHan:'phucvu' });
  const [toast, setToast] = useState(null);

  const fetchStaff = async () => { const data = await api.getStaff(); setStaff(data); setLoading(false); };
  useEffect(() => { fetchStaff(); }, []);

  const openAdd = () => {
    const num = (staff.length + 1).toString().padStart(2, '0');
    setEditItem(null);
    setForm({ MaNV:'NV'+num, HoTen:'', SoDienThoai:'', ViTri:'Phục vụ', TenDangNhap:'', MatKhau:'123456', QuyenHan:'phucvu' });
    setShowModal(true);
  };
  const openEdit = (s) => {
    setEditItem(s);
    setForm({ MaNV:s.MaNV, HoTen:s.HoTen, SoDienThoai:s.SoDienThoai||'', ViTri:s.ViTri, TenDangNhap:s.TAIKHOAN?.[0]?.TenDangNhap||'', MatKhau:'', QuyenHan:s.TAIKHOAN?.[0]?.QuyenHan||'phucvu' });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editItem) { await api.updateStaff(form.MaNV, { HoTen:form.HoTen, SoDienThoai:form.SoDienThoai, ViTri:form.ViTri }); showToast('success','Đã cập nhật'); }
      else { await api.addStaff(form); showToast('success','Đã thêm nhân viên'); }
      setShowModal(false); fetchStaff();
    } catch (err) { showToast('error',err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa nhân viên này?')) return;
    try { await api.deleteStaff(id); fetchStaff(); showToast('success','Đã xóa'); } catch (err) { showToast('error',err.message); }
  };

  const showToast = (type,msg) => { setToast({type,msg}); setTimeout(()=>setToast(null),3000); };
  const roleLabel = (r) => ({admin:'Quản lý',thungan:'Thu ngân',phucvu:'Phục vụ',barista:'Barista'}[r]||r);

  return (
    <DesktopLayout>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      <div className="page-header">
        <h1><Users size={28} /> Quản lý Nhân viên</h1>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={18} /> Thêm NV</button>
      </div>

      {loading ? <div className="page-loading"><div className="spinner" /></div> : (
        <table className="data-table">
          <thead><tr><th>Mã NV</th><th>Họ tên</th><th>SĐT</th><th>Vị trí</th><th>Tài khoản</th><th>Quyền</th><th>Thao tác</th></tr></thead>
          <tbody>
            {staff.map(s => (
              <tr key={s.MaNV}>
                <td><strong>{s.MaNV}</strong></td>
                <td>{s.HoTen}</td>
                <td>{s.SoDienThoai || '—'}</td>
                <td>{s.ViTri}</td>
                <td>{s.TAIKHOAN?.[0]?.TenDangNhap || '—'}</td>
                <td><span className="badge badge-success">{roleLabel(s.TAIKHOAN?.[0]?.QuyenHan)}</span></td>
                <td className="actions">
                  <button className="btn btn-sm btn-outline" onClick={() => openEdit(s)}><Edit size={14} /></button>
                  <button className="btn btn-sm btn-ghost" style={{color:'var(--danger)'}} onClick={() => handleDelete(s.MaNV)}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>{editItem ? 'Sửa nhân viên' : 'Thêm nhân viên'}</h3><button className="btn btn-icon btn-ghost" onClick={() => setShowModal(false)}><X size={18}/></button></div>
            <div className="modal-body" style={{display:'flex',flexDirection:'column',gap:14}}>
              <div className="input-group"><label>Mã NV</label><input className="input-field" value={form.MaNV} onChange={e=>setForm({...form,MaNV:e.target.value})} disabled={!!editItem} /></div>
              <div className="input-group"><label>Họ tên</label><input className="input-field" value={form.HoTen} onChange={e=>setForm({...form,HoTen:e.target.value})} autoFocus /></div>
              <div className="input-group"><label>Số điện thoại</label><input className="input-field" value={form.SoDienThoai} onChange={e=>setForm({...form,SoDienThoai:e.target.value})} /></div>
              <div className="input-group"><label>Vị trí</label>
                <select className="input-field" value={form.ViTri} onChange={e=>setForm({...form,ViTri:e.target.value})}>
                  <option>Quản lý</option><option>Thu ngân</option><option>Phục vụ</option><option>Barista</option>
                </select>
              </div>
              {!editItem && (
                <>
                  <div className="input-group"><label>Tên đăng nhập</label><input className="input-field" value={form.TenDangNhap} onChange={e=>setForm({...form,TenDangNhap:e.target.value})} /></div>
                  <div className="input-group"><label>Mật khẩu</label><input className="input-field" value={form.MatKhau} onChange={e=>setForm({...form,MatKhau:e.target.value})} /></div>
                  <div className="input-group"><label>Quyền hạn</label>
                    <select className="input-field" value={form.QuyenHan} onChange={e=>setForm({...form,QuyenHan:e.target.value})}>
                      <option value="admin">Quản lý</option><option value="thungan">Thu ngân</option><option value="phucvu">Phục vụ</option><option value="barista">Barista</option>
                    </select>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleSave}>{editItem ? 'Cập nhật' : 'Thêm mới'}</button>
            </div>
          </div>
        </div>
      )}
    </DesktopLayout>
  );
}
