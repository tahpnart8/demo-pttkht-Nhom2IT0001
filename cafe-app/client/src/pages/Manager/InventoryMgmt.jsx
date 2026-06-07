import { useState, useEffect } from 'react';
import DesktopLayout from '../../components/Layout/DesktopLayout';
import { PackageOpen, ArrowDownToLine, ArrowUpFromLine, X, Trash2 } from 'lucide-react';
import { api } from '../../services/api';

export default function InventoryMgmt() {
  const [inventory, setInventory] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(null); // 'nhap' | 'xuat' | null
  const [toast, setToast] = useState(null);

  // Form states
  const [selectedItems, setSelectedItems] = useState([]);
  const [form, setForm] = useState({ MaPN: '', MaPX: '', MaNCC: '', LyDo: 'Xuất quầy', TongTienNhap: 0 });

  const fetchData = async () => {
    try {
      const [invData, supData] = await Promise.all([api.getInventory(), api.getSuppliers()]);
      setInventory(invData);
      setSuppliers(supData);
    } catch (err) {
      showToast('error', 'Không thể tải dữ liệu kho');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3000); };

  const addItemToForm = (nl) => {
    if (!selectedItems.find(i => i.MaNL === nl.MaNL)) {
      setSelectedItems([...selectedItems, { ...nl, SoLuong: 1, DonGiaNhap: 0 }]);
    }
  };

  const updateItemQty = (MaNL, field, value) => {
    setSelectedItems(prev => prev.map(i => {
      if (i.MaNL === MaNL) {
        const updated = { ...i, [field]: Number(value) };
        return updated;
      }
      return i;
    }));
  };

  // Calculate total whenever items change (for import)
  useEffect(() => {
    if (showModal === 'nhap') {
      const total = selectedItems.reduce((sum, i) => sum + (i.SoLuong * i.DonGiaNhap), 0);
      setForm(prev => ({ ...prev, TongTienNhap: total }));
    }
  }, [selectedItems, showModal]);

  const handleSubmit = async () => {
    if (selectedItems.length === 0) return showToast('error', 'Vui lòng chọn ít nhất 1 nguyên liệu');
    try {
      if (showModal === 'nhap') {
        if (!form.MaPN || !form.MaNCC) return showToast('error', 'Điền thiếu thông tin phiếu nhập');
        await api.importInventory({
          MaPN: form.MaPN,
          MaNCC: form.MaNCC,
          TongTienNhap: form.TongTienNhap,
          ChiTiet: selectedItems
        });
        showToast('success', 'Nhập kho thành công');
      } else {
        if (!form.MaPX) return showToast('error', 'Điền thiếu mã phiếu xuất');
        // Validate stock
        for (let item of selectedItems) {
          const inStock = inventory.find(i => i.MaNL === item.MaNL)?.SoLuongTon || 0;
          if (item.SoLuong > inStock) return showToast('error', `Nguyên liệu ${item.TenNL} không đủ tồn kho!`);
        }
        await api.exportInventory({
          MaPX: form.MaPX,
          LyDo: form.LyDo,
          ChiTiet: selectedItems
        });
        showToast('success', 'Xuất kho thành công');
      }
      setShowModal(null);
      setSelectedItems([]);
      fetchData();
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const openModal = (type) => {
    setShowModal(type);
    setSelectedItems([]);
    setForm({ MaPN: `PN${Date.now()}`, MaPX: `PX${Date.now()}`, MaNCC: suppliers[0]?.MaNCC || '', LyDo: 'Xuất quầy', TongTienNhap: 0 });
  };

  return (
    <DesktopLayout>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      <div className="page-header">
        <h1><PackageOpen size={28} /> Quản lý Kho</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" onClick={() => openModal('nhap')}><ArrowDownToLine size={18} /> Nhập Kho</button>
          <button className="btn btn-outline" onClick={() => openModal('xuat')}><ArrowUpFromLine size={18} /> Xuất Kho</button>
        </div>
      </div>

      {loading ? <div className="page-loading"><div className="spinner" /></div> : (
        <table className="data-table">
          <thead><tr><th>Mã NL</th><th>Tên Nguyên Liệu</th><th>Đơn vị</th><th>Tồn Kho</th><th>Ngưỡng Cảnh Báo</th><th>Trạng thái</th></tr></thead>
          <tbody>
            {inventory.map(item => (
              <tr key={item.MaNL}>
                <td><strong>{item.MaNL}</strong></td>
                <td>{item.TenNL}</td>
                <td>{item.DonViTinh}</td>
                <td style={{ fontWeight: 600, color: item.SoLuongTon <= item.MucToiThieu ? 'var(--danger)' : 'var(--text)' }}>
                  {item.SoLuongTon}
                </td>
                <td>{item.MucToiThieu}</td>
                <td>
                  {item.SoLuongTon === 0 ? <span className="badge badge-danger">Hết hàng</span> :
                   item.SoLuongTon <= item.MucToiThieu ? <span className="badge badge-warning">Sắp hết</span> :
                   <span className="badge badge-success">Bình thường</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(null)}>
          <div className="modal-content" style={{ maxWidth: 800 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{showModal === 'nhap' ? 'Lập Phiếu Nhập Kho' : 'Lập Phiếu Xuất Kho'}</h3>
              <button className="btn btn-icon btn-ghost" onClick={() => setShowModal(null)}><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', gap: 20 }}>
              
              {/* Left Column: Form Info */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {showModal === 'nhap' ? (
                  <>
                    <div className="input-group"><label>Mã Phiếu Nhập</label><input className="input-field" value={form.MaPN} onChange={e => setForm({...form, MaPN: e.target.value})} /></div>
                    <div className="input-group"><label>Nhà Cung Cấp</label>
                      <select className="input-field" value={form.MaNCC} onChange={e => setForm({...form, MaNCC: e.target.value})}>
                        {suppliers.map(s => <option key={s.MaNCC} value={s.MaNCC}>{s.TenNCC}</option>)}
                      </select>
                    </div>
                    <div className="input-group"><label>Tổng Tiền (VNĐ)</label><input className="input-field" value={form.TongTienNhap} disabled /></div>
                  </>
                ) : (
                  <>
                    <div className="input-group"><label>Mã Phiếu Xuất</label><input className="input-field" value={form.MaPX} onChange={e => setForm({...form, MaPX: e.target.value})} /></div>
                    <div className="input-group"><label>Lý do xuất</label>
                      <select className="input-field" value={form.LyDo} onChange={e => setForm({...form, LyDo: e.target.value})}>
                        <option value="Xuất quầy">Xuất ra quầy pha chế</option>
                        <option value="Xuất hủy">Xuất hủy (Hư hỏng/Hết hạn)</option>
                      </select>
                    </div>
                  </>
                )}
                
                <hr style={{ borderColor: 'var(--border)' }} />
                <h4>Chọn nguyên liệu</h4>
                <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, padding: 8 }}>
                  {inventory.map(nl => (
                    <div key={nl.MaNL} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                      <span>{nl.TenNL} ({nl.SoLuongTon} {nl.DonViTinh})</span>
                      <button className="btn btn-sm btn-outline" onClick={() => addItemToForm(nl)}>Chọn</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Selected Items */}
              <div style={{ flex: 1.5, background: 'var(--surface-50)', padding: 16, borderRadius: 8 }}>
                <h4>Chi tiết phiếu</h4>
                {selectedItems.length === 0 ? <p style={{ color: 'var(--text-light)', marginTop: 20 }}>Chưa chọn nguyên liệu nào.</p> : (
                  <table className="data-table" style={{ marginTop: 10 }}>
                    <thead><tr><th>Tên NL</th><th>Số lượng</th>{showModal==='nhap' && <th>Đơn giá</th>}<th>Xóa</th></tr></thead>
                    <tbody>
                      {selectedItems.map(item => (
                        <tr key={item.MaNL}>
                          <td>{item.TenNL}</td>
                          <td><input type="number" className="input-field" style={{ width: 70, padding: 4 }} value={item.SoLuong} onChange={e => updateItemQty(item.MaNL, 'SoLuong', e.target.value)} min="1" /></td>
                          {showModal === 'nhap' && (
                            <td><input type="number" className="input-field" style={{ width: 100, padding: 4 }} value={item.DonGiaNhap} onChange={e => updateItemQty(item.MaNL, 'DonGiaNhap', e.target.value)} min="0" /></td>
                          )}
                          <td><button className="btn btn-icon btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => setSelectedItems(prev => prev.filter(i => i.MaNL !== item.MaNL))}><Trash2 size={16}/></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

            </div>
            <div className="modal-footer" style={{ marginTop: 20 }}>
              <button className="btn btn-ghost" onClick={() => setShowModal(null)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleSubmit}>Xác nhận {showModal === 'nhap' ? 'Nhập Kho' : 'Xuất Kho'}</button>
            </div>
          </div>
        </div>
      )}
    </DesktopLayout>
  );
}
