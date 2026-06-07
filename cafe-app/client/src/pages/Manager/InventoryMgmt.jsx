import { useState, useEffect } from 'react';
import DesktopLayout from '../../components/Layout/DesktopLayout';
import { PackageOpen, ArrowDownToLine, ArrowUpFromLine, X, Trash2, ClipboardCheck, Plus, AlertTriangle, Calendar, Edit2 } from 'lucide-react';
import { api } from '../../services/api';

export default function InventoryMgmt() {
  const [inventory, setInventory] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(null); // 'nhap' | 'xuat' | 'kiemkho' | 'nl' | null
  const [toast, setToast] = useState(null);
  const [startDateKK, setStartDateKK] = useState(new Date(new Date().setDate(1)).toISOString().slice(0, 10));

  // Form states
  const [selectedItems, setSelectedItems] = useState([]);
  const [form, setForm] = useState({ MaPN: '', MaPX: '', MaPKK: '', MaNCC: '', LyDo: 'Xuất quầy', TongTienNhap: 0 });
  const [formNL, setFormNL] = useState({ MaNL: '', TenNL: '', DonViTinh: 'Gram', SoLuongTon: 0, MucToiThieu: 0, isEdit: false });

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
      if (showModal === 'kiemkho') {
        setSelectedItems([...selectedItems, { ...nl, SLThucTe: nl.SoLuongTon, SLLyThuyet: nl.SoLuongTon, GhiChu: '' }]);
      } else {
        setSelectedItems([...selectedItems, { ...nl, SoLuong: 1, DonGiaNhap: 0 }]);
      }
    }
  };

  const updateItemQty = (MaNL, field, value) => {
    setSelectedItems(prev => prev.map(i => {
      if (i.MaNL === MaNL) {
        return { ...i, [field]: field === 'GhiChu' ? value : Number(value) };
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

  const handleSaveNL = async () => {
    if (!formNL.MaNL || !formNL.TenNL) return showToast('error', 'Vui lòng nhập đủ thông tin');
    try {
      if (formNL.isEdit) {
        await api.updateNguyenLieu(formNL.MaNL, formNL);
        showToast('success', 'Đã cập nhật nguyên liệu');
      } else {
        await api.addNguyenLieu(formNL);
        showToast('success', 'Đã thêm nguyên liệu');
      }
      setShowModal(null);
      fetchData();
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleDeleteNL = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa nguyên liệu này?')) return;
    try {
      await api.deleteNguyenLieu(id);
      showToast('success', 'Đã xóa nguyên liệu');
      fetchData();
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const loadTonLyThuyet = async () => {
    try {
      const data = await api.getTonLyThuyet(startDateKK + 'T00:00:00.000Z');
      const newItems = selectedItems.map(item => {
        const found = data.find(d => d.MaNL === item.MaNL);
        return found ? { ...item, SLLyThuyet: found.TonLyThuyet } : item;
      });
      setSelectedItems(newItems);
      showToast('success', 'Đã tính Tồn Lý Thuyết');
    } catch (err) {
      showToast('error', err.message);
    }
  };

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
      } else if (showModal === 'xuat') {
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
      } else if (showModal === 'kiemkho') {
        if (!form.MaPKK) return showToast('error', 'Điền thiếu mã phiếu kiểm kho');
        await api.checkInventory({
          MaPKK: form.MaPKK,
          ChiTiet: selectedItems
        });
        showToast('success', 'Kiểm kho thành công');
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
    setForm({ MaPN: `PN${Date.now()}`, MaPX: `PX${Date.now()}`, MaPKK: `PKK${Date.now()}`, MaNCC: suppliers[0]?.MaNCC || '', LyDo: 'Xuất quầy', TongTienNhap: 0 });
  };

  const lowStockItems = inventory.filter(i => i.SoLuongTon <= i.MucToiThieu);

  return (
    <DesktopLayout>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      <div className="page-header">
        <h1><PackageOpen size={28} /> Quản lý Kho</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline" style={{ borderStyle: 'dashed' }} onClick={() => { setFormNL({ MaNL: '', TenNL: '', DonViTinh: 'Gram', SoLuongTon: 0, MucToiThieu: 0, isEdit: false }); setShowModal('nl'); }}><Plus size={18} /> Thêm NL</button>
          <button className="btn btn-primary" onClick={() => openModal('nhap')}><ArrowDownToLine size={18} /> Nhập Kho</button>
          <button className="btn btn-outline" onClick={() => openModal('xuat')}><ArrowUpFromLine size={18} /> Xuất Kho</button>
          <button className="btn" style={{ background: 'var(--warning)', color: 'white', borderColor: 'var(--warning)' }} onClick={() => openModal('kiemkho')}><ClipboardCheck size={18} /> Kiểm Kho</button>
        </div>
      </div>

      {lowStockItems.length > 0 && (
        <div style={{ background: 'var(--danger-light)', border: '1px solid var(--danger)', padding: '12px 20px', borderRadius: 8, marginBottom: 20, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <AlertTriangle size={24} color="var(--danger)" style={{ flexShrink: 0 }} />
          <div>
            <h4 style={{ color: 'var(--danger)', margin: '0 0 4px 0' }}>Cảnh báo: Có {lowStockItems.length} nguyên liệu sắp hết!</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--danger)' }}>
              {lowStockItems.map(i => `${i.TenNL} (còn ${i.SoLuongTon} ${i.DonViTinh})`).join(', ')}
            </p>
          </div>
        </div>
      )}

      {loading ? <div className="page-loading"><div className="spinner" /></div> : (
        <table className="data-table">
          <thead><tr><th>Mã NL</th><th>Tên Nguyên Liệu</th><th>Đơn vị</th><th>Tồn Kho</th><th>Ngưỡng Cảnh Báo</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
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
                <td>
                  <button className="btn btn-icon btn-ghost" onClick={() => { setFormNL({ ...item, isEdit: true }); setShowModal('nl'); }}><Edit2 size={16} /></button>
                  <button className="btn btn-icon btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => handleDeleteNL(item.MaNL)}><Trash2 size={16} /></button>
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
              <h3>{showModal === 'nhap' ? 'Lập Phiếu Nhập Kho' : showModal === 'xuat' ? 'Lập Phiếu Xuất Kho' : showModal === 'kiemkho' ? 'Lập Phiếu Kiểm Kho' : formNL.isEdit ? 'Sửa Nguyên Liệu' : 'Thêm Nguyên Liệu'}</h3>
              <button className="btn btn-icon btn-ghost" onClick={() => setShowModal(null)}><X size={18} /></button>
            </div>
            
            {showModal === 'nl' ? (
              <div className="modal-body">
                <div className="input-group"><label>Mã NL</label><input className="input-field" value={formNL.MaNL} onChange={e => setFormNL({...formNL, MaNL: e.target.value})} disabled={formNL.isEdit} placeholder="VD: NL01" /></div>
                <div className="input-group"><label>Tên Nguyên Liệu</label><input className="input-field" value={formNL.TenNL} onChange={e => setFormNL({...formNL, TenNL: e.target.value})} /></div>
                <div className="input-group"><label>Đơn vị tính</label>
                  <select className="input-field" value={formNL.DonViTinh} onChange={e => setFormNL({...formNL, DonViTinh: e.target.value})}>
                    {['Gram', 'Kg', 'Lon', 'Hộp', 'Lít', 'ml', 'Chai', 'Túi', 'Quả'].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                {!formNL.isEdit && <div className="input-group"><label>Tồn kho ban đầu</label><input type="number" className="input-field" value={formNL.SoLuongTon} onChange={e => setFormNL({...formNL, SoLuongTon: Number(e.target.value)})} min="0" /></div>}
                <div className="input-group"><label>Mức tối thiểu (Cảnh báo)</label><input type="number" className="input-field" value={formNL.MucToiThieu} onChange={e => setFormNL({...formNL, MucToiThieu: Number(e.target.value)})} min="0" /></div>
              </div>
            ) : (
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
                ) : showModal === 'xuat' ? (
                  <>
                    <div className="input-group"><label>Mã Phiếu Xuất</label><input className="input-field" value={form.MaPX} onChange={e => setForm({...form, MaPX: e.target.value})} /></div>
                    <div className="input-group"><label>Lý do xuất</label>
                      <select className="input-field" value={form.LyDo} onChange={e => setForm({...form, LyDo: e.target.value})}>
                        <option value="Xuất quầy">Xuất ra quầy pha chế</option>
                        <option value="Xuất hủy">Xuất hủy (Hư hỏng/Hết hạn)</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="input-group"><label>Mã Phiếu Kiểm Kho</label><input className="input-field" value={form.MaPKK} onChange={e => setForm({...form, MaPKK: e.target.value})} /></div>
                    <div className="input-group">
                      <label>Kỳ kiểm kho (Từ ngày)</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input type="date" className="input-field" value={startDateKK} onChange={e => setStartDateKK(e.target.value)} />
                        <button className="btn btn-primary btn-sm" onClick={loadTonLyThuyet} style={{ whiteSpace: 'nowrap' }}>Tải Tồn Lý Thuyết</button>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 10 }}>
                      Chọn ngày bắt đầu kỳ để tính Tồn Lý Thuyết chính xác (Tồn đầu kỳ + Nhập - Tiêu thụ).
                    </p>
                  </>
                )}
                
                <hr style={{ borderColor: 'var(--border)' }} />
                <h4>Chọn nguyên liệu {showModal === 'xuat' && '(chỉ hiển thị kho còn tồn)'}</h4>
                <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, padding: 8 }}>
                  {inventory.filter(nl => showModal === 'xuat' ? nl.SoLuongTon > 0 : true).map(nl => (
                    <div key={nl.MaNL} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                      <span>{nl.TenNL} <span style={{ color: 'var(--text-light)', fontSize: '0.85em' }}>({nl.SoLuongTon} {nl.DonViTinh})</span></span>
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
                    <thead>
                      <tr>
                        <th>Tên NL</th>
                        {showModal === 'kiemkho' ? (
                          <>
                            <th>SL Lý Thuyết</th>
                            <th>SL Thực Tế</th>
                            <th>Ghi chú</th>
                          </>
                        ) : (
                          <>
                            <th>Số lượng</th>
                            {showModal==='nhap' && <th>Đơn giá</th>}
                          </>
                        )}
                        <th>Xóa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedItems.map(item => (
                        <tr key={item.MaNL}>
                          <td>{item.TenNL}</td>
                          
                          {showModal === 'kiemkho' ? (
                            <>
                              <td>{item.SLLyThuyet}</td>
                              <td><input type="number" className="input-field" style={{ width: 70, padding: 4 }} value={item.SLThucTe} onChange={e => updateItemQty(item.MaNL, 'SLThucTe', e.target.value)} min="0" /></td>
                              <td><input type="text" className="input-field" style={{ width: 120, padding: 4 }} placeholder="Lý do lệch..." value={item.GhiChu} onChange={e => updateItemQty(item.MaNL, 'GhiChu', e.target.value)} /></td>
                            </>
                          ) : (
                            <>
                              <td><input type="number" className="input-field" style={{ width: 70, padding: 4 }} value={item.SoLuong} onChange={e => updateItemQty(item.MaNL, 'SoLuong', e.target.value)} min="1" /></td>
                              {showModal === 'nhap' && (
                                <td><input type="number" className="input-field" style={{ width: 100, padding: 4 }} value={item.DonGiaNhap} onChange={e => updateItemQty(item.MaNL, 'DonGiaNhap', e.target.value)} min="0" /></td>
                              )}
                            </>
                          )}
                          
                          <td><button className="btn btn-icon btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => setSelectedItems(prev => prev.filter(i => i.MaNL !== item.MaNL))}><Trash2 size={16}/></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

            </div>
            )}
            <div className="modal-footer" style={{ marginTop: 20 }}>
              <button className="btn btn-ghost" onClick={() => setShowModal(null)}>Hủy</button>
              {showModal === 'nl' ? (
                <button className="btn btn-primary" onClick={handleSaveNL}>Lưu Nguyên Liệu</button>
              ) : (
                <button className="btn btn-primary" onClick={handleSubmit}>Xác nhận {showModal === 'nhap' ? 'Nhập Kho' : showModal === 'xuat' ? 'Xuất Kho' : 'Kiểm Kho'}</button>
              )}
            </div>
          </div>
        </div>
      )}
    </DesktopLayout>
  );
}
