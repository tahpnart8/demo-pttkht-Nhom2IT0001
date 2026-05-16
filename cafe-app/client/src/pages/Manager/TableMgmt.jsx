import { useState, useEffect } from 'react';
import DesktopLayout from '../../components/Layout/DesktopLayout';
import { LayoutGrid, Plus, Edit, Trash2, X } from 'lucide-react';
import { api } from '../../services/api';
import './TableMgmt.css';

export default function TableMgmt() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ MaBan:'', TenBan:'', TrangThai:'Trong', QRCode:'' });
  const [toast, setToast] = useState(null);

  const fetchTables = async () => { const data = await api.getTables(); setTables(data); setLoading(false); };
  useEffect(() => { fetchTables(); }, []);

  const openAdd = () => {
    const num = (tables.length + 1).toString().padStart(2, '0');
    setEditItem(null);
    setForm({ MaBan: 'B' + num, TenBan: 'Bàn ' + num, TrangThai: 'Trong', QRCode: 'QR_B' + num });
    setShowModal(true);
  };
  const openEdit = (t) => { setEditItem(t); setForm({ MaBan:t.MaBan, TenBan:t.TenBan, TrangThai:t.TrangThai, QRCode:t.QRCode||'' }); setShowModal(true); };

  const handleSave = async () => {
    try {
      if (editItem) { await api.updateTable(form.MaBan, form); showToast('success','Đã cập nhật'); }
      else { await api.addTable(form); showToast('success','Đã thêm bàn'); }
      setShowModal(false); fetchTables();
    } catch (err) { showToast('error',err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa bàn này?')) return;
    try { await api.deleteTable(id); fetchTables(); showToast('success','Đã xóa'); } catch (err) { showToast('error',err.message); }
  };

  const showToast = (type, msg) => { setToast({type,msg}); setTimeout(()=>setToast(null),3000); };

  return (
    <DesktopLayout>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      <div className="page-header">
        <h1><LayoutGrid size={28} /> Quản lý Bàn</h1>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={18} /> Thêm bàn</button>
      </div>

      {loading ? <div className="page-loading"><div className="spinner" /></div> : (
        <div className="table-card-grid">
          {tables.map(t => (
            <div key={t.MaBan} className={`table-card-mgmt ${t.TrangThai === 'DangCoKhach' ? 'occupied' : 'free'}`}>
              <div className="tcm-header">
                <h3>{t.TenBan}</h3>
                <span className={`badge ${t.TrangThai === 'Trong' ? 'badge-success' : 'badge-cho'}`}>
                  {t.TrangThai === 'Trong' ? 'Trống' : 'Có khách'}
                </span>
              </div>
              <p className="tcm-id">{t.MaBan}</p>
              <div className="tcm-actions">
                <button className="btn btn-sm btn-outline" onClick={() => openEdit(t)}><Edit size={14} /> Sửa</button>
                <button className="btn btn-sm btn-ghost" style={{color:'var(--danger)'}} onClick={() => handleDelete(t.MaBan)}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>{editItem ? 'Sửa bàn' : 'Thêm bàn mới'}</h3><button className="btn btn-icon btn-ghost" onClick={() => setShowModal(false)}><X size={18}/></button></div>
            <div className="modal-body" style={{display:'flex',flexDirection:'column',gap:14}}>
              <div className="input-group"><label>Mã bàn</label><input className="input-field" value={form.MaBan} onChange={e=>setForm({...form,MaBan:e.target.value})} disabled={!!editItem} /></div>
              <div className="input-group"><label>Tên bàn</label><input className="input-field" value={form.TenBan} onChange={e=>setForm({...form,TenBan:e.target.value})} autoFocus /></div>
              <div className="input-group"><label>Trạng thái</label>
                <select className="input-field" value={form.TrangThai} onChange={e=>setForm({...form,TrangThai:e.target.value})}>
                  <option value="Trong">Trống</option><option value="DangCoKhach">Đang có khách</option>
                </select>
              </div>
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
