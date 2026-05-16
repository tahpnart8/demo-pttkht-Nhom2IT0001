import { useState, useEffect } from 'react';
import DesktopLayout from '../../components/Layout/DesktopLayout';
import { UtensilsCrossed, Plus, Edit, Trash2, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { api } from '../../services/api';

export default function MenuMgmt() {
  const [menus, setMenus] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ MaMon:'', TenMon:'', DonGia:'', MaMenu:'', HinhAnh:'', TrangThai:'ConMon' });
  const [toast, setToast] = useState(null);

  const fetchData = async () => {
    const [menuData, itemData] = await Promise.all([api.getMenu(), api.getItems()]);
    setMenus(menuData);
    setItems(itemData);
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditItem(null); setForm({ MaMon:'MON'+(items.length+1).toString().padStart(2,'0'), TenMon:'', DonGia:'', MaMenu:menus[0]?.MaMenu||'', HinhAnh:'', TrangThai:'ConMon' }); setShowModal(true); };
  const openEdit = (item) => { setEditItem(item); setForm({ MaMon:item.MaMon, TenMon:item.TenMon, DonGia:item.DonGia, MaMenu:item.MaMenu, HinhAnh:item.HinhAnh||'', TrangThai:item.TrangThai }); setShowModal(true); };

  const handleSave = async () => {
    try {
      if (editItem) {
        await api.updateItem(form.MaMon, { TenMon:form.TenMon, DonGia:Number(form.DonGia), MaMenu:form.MaMenu, HinhAnh:form.HinhAnh||form.MaMon+'.jpg', TrangThai:form.TrangThai });
        showToast('success', 'Đã cập nhật món');
      } else {
        await api.addItem({ ...form, DonGia:Number(form.DonGia), HinhAnh:form.HinhAnh||form.MaMon+'.jpg' });
        showToast('success', 'Đã thêm món mới');
      }
      setShowModal(false);
      fetchData();
    } catch (err) { showToast('error', err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa món này?')) return;
    try { await api.deleteItem(id); fetchData(); showToast('success','Đã xóa'); } catch (err) { showToast('error',err.message); }
  };

  const toggleStatus = async (item) => {
    const newStatus = item.TrangThai === 'ConMon' ? 'HetMon' : 'ConMon';
    await api.toggleItemStatus(item.MaMon, newStatus);
    setItems(prev => prev.map(i => i.MaMon === item.MaMon ? {...i, TrangThai: newStatus} : i));
  };

  const showToast = (type, msg) => { setToast({type, msg}); setTimeout(() => setToast(null), 3000); };
  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + 'đ';

  return (
    <DesktopLayout>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      <div className="page-header">
        <h1><UtensilsCrossed size={28} /> Quản lý Menu</h1>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={18} /> Thêm món</button>
      </div>

      {loading ? <div className="page-loading"><div className="spinner" /></div> : (
        <table className="data-table">
          <thead><tr><th>Mã</th><th>Tên món</th><th>Giá</th><th>Nhóm</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
          <tbody>
            {items.map(item => (
              <tr key={item.MaMon}>
                <td><strong>{item.MaMon}</strong></td>
                <td>{item.TenMon}</td>
                <td style={{fontWeight:600}}>{formatPrice(item.DonGia)}</td>
                <td><span className="badge badge-success">{item.MENU?.TenMenu || item.MaMenu}</span></td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => toggleStatus(item)} style={{color: item.TrangThai==='ConMon' ? 'var(--success)' : 'var(--danger)'}}>
                    {item.TrangThai==='ConMon' ? <><ToggleRight size={18}/> Còn</> : <><ToggleLeft size={18}/> Hết</>}
                  </button>
                </td>
                <td className="actions">
                  <button className="btn btn-sm btn-outline" onClick={() => openEdit(item)}><Edit size={14} /></button>
                  <button className="btn btn-sm btn-ghost" style={{color:'var(--danger)'}} onClick={() => handleDelete(item.MaMon)}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>{editItem ? 'Sửa món' : 'Thêm món mới'}</h3><button className="btn btn-icon btn-ghost" onClick={() => setShowModal(false)}><X size={18}/></button></div>
            <div className="modal-body" style={{display:'flex',flexDirection:'column',gap:14}}>
              <div className="input-group"><label>Mã món</label><input className="input-field" value={form.MaMon} onChange={e=>setForm({...form,MaMon:e.target.value})} disabled={!!editItem} /></div>
              <div className="input-group"><label>Tên món</label><input className="input-field" value={form.TenMon} onChange={e=>setForm({...form,TenMon:e.target.value})} autoFocus /></div>
              <div className="input-group"><label>Đơn giá (VNĐ)</label><input className="input-field" type="number" value={form.DonGia} onChange={e=>setForm({...form,DonGia:e.target.value})} /></div>
              <div className="input-group"><label>Nhóm menu</label>
                <select className="input-field" value={form.MaMenu} onChange={e=>setForm({...form,MaMenu:e.target.value})}>
                  {menus.map(m => <option key={m.MaMenu} value={m.MaMenu}>{m.TenMenu}</option>)}
                </select>
              </div>
              <div className="input-group"><label>Tên file ảnh</label><input className="input-field" value={form.HinhAnh} onChange={e=>setForm({...form,HinhAnh:e.target.value})} placeholder="VD: MON01.jpg" /></div>
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
