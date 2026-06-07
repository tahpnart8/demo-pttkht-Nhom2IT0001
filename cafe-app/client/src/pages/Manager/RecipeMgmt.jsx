import { useState, useEffect } from 'react';
import DesktopLayout from '../../components/Layout/DesktopLayout';
import { ChefHat, Link, X, Trash2 } from 'lucide-react';
import { api } from '../../services/api';

export default function RecipeMgmt() {
  const [items, setItems] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [selectedMon, setSelectedMon] = useState(null);
  const [recipe, setRecipe] = useState([]); // [{ MaNL, TenNL, DinhLuong, DonViTinh }]

  const fetchData = async () => {
    try {
      const [itemData, invData] = await Promise.all([api.getItems(), api.getInventory()]);
      setItems(itemData);
      setInventory(invData);
    } catch (err) {
      showToast('error', 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3000); };

  const handleSelectMon = async (mon) => {
    setSelectedMon(mon);
    try {
      const data = await api.getRecipe(mon.MaMon);
      const mapped = data.map(d => ({
        MaNL: d.MaNL,
        TenNL: d.NGUYENLIEU?.TenNL || d.MaNL,
        DonViTinh: d.NGUYENLIEU?.DonViTinh || '',
        DinhLuong: d.DinhLuong
      }));
      setRecipe(mapped);
    } catch (err) {
      showToast('error', 'Không thể tải công thức');
    }
  };

  const addIngredientToRecipe = (nl) => {
    if (!recipe.find(r => r.MaNL === nl.MaNL)) {
      setRecipe([...recipe, { MaNL: nl.MaNL, TenNL: nl.TenNL, DonViTinh: nl.DonViTinh, DinhLuong: 1 }]);
    }
  };

  const updateDinhLuong = (MaNL, value) => {
    setRecipe(prev => prev.map(r => r.MaNL === MaNL ? { ...r, DinhLuong: Number(value) } : r));
  };

  const removeIngredient = (MaNL) => {
    setRecipe(prev => prev.filter(r => r.MaNL !== MaNL));
  };

  const handleSaveRecipe = async () => {
    try {
      const mappings = recipe.map(r => ({ MaNL: r.MaNL, DinhLuong: r.DinhLuong }));
      await api.updateRecipe({ MaMon: selectedMon.MaMon, mappings });
      showToast('success', 'Lưu công thức thành công');
      setSelectedMon(null);
    } catch (err) {
      showToast('error', err.message);
    }
  };

  return (
    <DesktopLayout>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      <div className="page-header">
        <h1><ChefHat size={28} /> Quản lý Công Thức</h1>
      </div>

      {loading ? <div className="page-loading"><div className="spinner" /></div> : (
        <div style={{ display: 'flex', gap: 20 }}>
          
          {/* List of menu items */}
          <div style={{ flex: 1, background: 'var(--surface)', padding: 20, borderRadius: 12, boxShadow: 'var(--shadow-sm)' }}>
            <h3>Chọn món để xem/sửa</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 15, maxHeight: '60vh', overflowY: 'auto' }}>
              {items.map(item => (
                <div 
                  key={item.MaMon} 
                  style={{ 
                    padding: 12, 
                    border: '1px solid var(--border)', 
                    borderRadius: 8, 
                    cursor: 'pointer',
                    background: selectedMon?.MaMon === item.MaMon ? 'var(--primary-light)' : 'transparent',
                    borderColor: selectedMon?.MaMon === item.MaMon ? 'var(--primary)' : 'var(--border)'
                  }}
                  onClick={() => handleSelectMon(item)}
                >
                  <strong>{item.TenMon}</strong>
                  <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{item.MENU?.TenMenu} - {item.TrangThai === 'ConMon' ? 'Còn món' : 'Hết món'}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recipe details */}
          <div style={{ flex: 2, background: 'var(--surface)', padding: 20, borderRadius: 12, boxShadow: 'var(--shadow-sm)' }}>
            {!selectedMon ? (
              <div style={{ textAlign: 'center', color: 'var(--text-light)', padding: 40 }}>
                <Link size={48} style={{ opacity: 0.5, marginBottom: 10 }} />
                <p>Chọn một món bên trái để thiết lập liên kết nguyên liệu</p>
                <p style={{ fontSize: 13, marginTop: 10 }}>Logic: Khi nhân viên báo xuất nguyên liệu, nếu tồn kho = 0 thì hệ thống sẽ tự tìm các món chứa nguyên liệu đó để khóa lại.</p>
              </div>
            ) : (
              <div>
                <h3>Công thức: <span style={{ color: 'var(--primary)' }}>{selectedMon.TenMon}</span></h3>
                <hr style={{ margin: '15px 0', borderColor: 'var(--border)' }} />
                
                <div style={{ display: 'flex', gap: 20 }}>
                  <div style={{ flex: 1 }}>
                    <h4>Kho Nguyên Liệu</h4>
                    <div style={{ maxHeight: '40vh', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, padding: 8, marginTop: 10 }}>
                      {inventory.map(nl => (
                        <div key={nl.MaNL} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                          <span>{nl.TenNL}</span>
                          <button className="btn btn-sm btn-outline" onClick={() => addIngredientToRecipe(nl)} disabled={recipe.some(r => r.MaNL === nl.MaNL)}>Thêm</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ flex: 1.5 }}>
                    <h4>Thành phần món ăn</h4>
                    {recipe.length === 0 ? <p style={{ marginTop: 10, color: 'var(--text-light)' }}>Chưa có nguyên liệu nào.</p> : (
                      <table className="data-table" style={{ marginTop: 10 }}>
                        <thead><tr><th>Nguyên liệu</th><th>Định lượng</th><th>Đơn vị</th><th>Xóa</th></tr></thead>
                        <tbody>
                          {recipe.map(r => (
                            <tr key={r.MaNL}>
                              <td>{r.TenNL}</td>
                              <td><input type="number" className="input-field" style={{ width: 80, padding: 4 }} value={r.DinhLuong} onChange={e => updateDinhLuong(r.MaNL, e.target.value)} min="0.1" step="0.1" /></td>
                              <td>{r.DonViTinh}</td>
                              <td><button className="btn btn-icon btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => removeIngredient(r.MaNL)}><Trash2 size={16}/></button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                    
                    <div style={{ marginTop: 20, textAlign: 'right' }}>
                      <button className="btn btn-ghost" onClick={() => setSelectedMon(null)}>Hủy</button>
                      <button className="btn btn-primary" onClick={handleSaveRecipe}>Lưu Công Thức</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </DesktopLayout>
  );
}
