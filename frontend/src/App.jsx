import { useEffect, useState, useCallback } from 'react';
import './App.css';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const STATUSES = ['Đang sử dụng', 'Hư hỏng', 'Đang sửa chữa', 'Ngừng sử dụng'];
const EMPTY = { deviceId: '', name: '', deviceType: '', room: '', brand: '', model: '',
  quantity: 1, status: 'Đang sử dụng', purchaseDate: '', description: '' };
const badge = s => ({ 'Đang sử dụng': 'green', 'Hư hỏng': 'red', 'Đang sửa chữa': 'orange', 'Ngừng sử dụng': 'gray' }[s]);

async function api(path, options) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' }, ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error([data.message, ...(data.details || [])].filter(Boolean).join(': ') || 'Có lỗi xảy ra');
  return data;
}

export default function App() {
  const [devices, setDevices] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [detail, setDetail] = useState(null);

  const load = useCallback(async (q = '') => {
    setLoading(true); setError('');
    try {
      setDevices(await api(`/api/devices${q ? `?search=${encodeURIComponent(q)}` : ''}`));
    } catch (e) { setError(e.message === 'Failed to fetch' ? 'Không kết nối được máy chủ' : e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const notify = msg => { setMessage(msg); setTimeout(() => setMessage(''), 3000); };

  const openAdd = () => { setForm({ ...EMPTY }); setEditingId(null); setDetail(null); };
  const openEdit = d => {
    setForm({ ...d, purchaseDate: d.purchaseDate ? d.purchaseDate.slice(0, 10) : '' });
    setEditingId(d._id); setDetail(null);
  };

  const submit = async e => {
    e.preventDefault(); setError('');
    try {
      const body = JSON.stringify({ ...form, quantity: Number(form.quantity), purchaseDate: form.purchaseDate || undefined });
      if (editingId) await api(`/api/devices/${editingId}`, { method: 'PUT', body });
      else await api('/api/devices', { method: 'POST', body });
      notify(editingId ? 'Cập nhật thiết bị thành công' : 'Thêm thiết bị thành công');
      setForm(null); load(search);
    } catch (e) { setError(e.message); }
  };

  const remove = async d => {
    if (!window.confirm(`Xóa thiết bị ${d.name}?`)) return;
    try { await api(`/api/devices/${d._id}`, { method: 'DELETE' }); notify('Đã xóa thiết bị'); load(search); }
    catch (e) { setError(e.message); }
  };

  const view = async d => {
    try { setDetail(await api(`/api/devices/${d._id}`)); setForm(null); }
    catch (e) { setError(e.message); }
  };

  const change = e => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="container">
      <h1>Quản lý thiết bị phòng học</h1>

      <div className="toolbar">
        <input placeholder="Tìm theo mã, tên, loại, phòng..." value={search}
          onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load(search)} />
        <button onClick={() => load(search)}>Tìm kiếm</button>
        <button onClick={() => { setSearch(''); load(''); }}>Đặt lại</button>
        <button className="primary" onClick={openAdd}>+ Thêm thiết bị</button>
      </div>

      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}

      {form && (
        <form className="card" onSubmit={submit}>
          <h3>{editingId ? 'Cập nhật thiết bị' : 'Thêm thiết bị'}</h3>
          <div className="grid">
            <label>Mã thiết bị *<input name="deviceId" value={form.deviceId} onChange={change} required /></label>
            <label>Tên thiết bị *<input name="name" value={form.name} onChange={change} required /></label>
            <label>Loại thiết bị *<input name="deviceType" value={form.deviceType} onChange={change} required /></label>
            <label>Phòng học *<input name="room" value={form.room} onChange={change} required /></label>
            <label>Hãng<input name="brand" value={form.brand} onChange={change} /></label>
            <label>Model<input name="model" value={form.model} onChange={change} /></label>
            <label>Số lượng *<input type="number" min="0" name="quantity" value={form.quantity} onChange={change} required /></label>
            <label>Tình trạng
              <select name="status" value={form.status} onChange={change}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </label>
            <label>Ngày mua<input type="date" name="purchaseDate" value={form.purchaseDate} onChange={change} /></label>
            <label>Mô tả<input name="description" value={form.description} onChange={change} /></label>
          </div>
          <button className="primary" type="submit">Lưu</button>
          <button type="button" onClick={() => setForm(null)}>Hủy</button>
        </form>
      )}

      {detail && (
        <div className="card">
          <h3>Chi tiết: {detail.name}</h3>
          <p><b>Mã:</b> {detail.deviceId} | <b>Loại:</b> {detail.deviceType} | <b>Phòng:</b> {detail.room}</p>
          <p><b>Hãng:</b> {detail.brand} | <b>Model:</b> {detail.model} | <b>Số lượng:</b> {detail.quantity}</p>
          <p><b>Tình trạng:</b> <span className={`badge ${badge(detail.status)}`}>{detail.status}</span></p>
          <p><b>Ngày mua:</b> {detail.purchaseDate ? new Date(detail.purchaseDate).toLocaleDateString('vi-VN') : '-'}</p>
          <p><b>Mô tả:</b> {detail.description}</p>
          <button onClick={() => setDetail(null)}>Đóng</button>
        </div>
      )}

      {loading ? <p>Đang tải dữ liệu...</p> : (
        <table>
          <thead><tr><th>Mã</th><th>Tên</th><th>Loại</th><th>Phòng</th><th>SL</th><th>Tình trạng</th><th>Thao tác</th></tr></thead>
          <tbody>
            {devices.length === 0 && <tr><td colSpan="7">Không có thiết bị nào</td></tr>}
            {devices.map(d => (
              <tr key={d._id}>
                <td>{d.deviceId}</td><td>{d.name}</td><td>{d.deviceType}</td><td>{d.room}</td><td>{d.quantity}</td>
                <td><span className={`badge ${badge(d.status)}`}>{d.status}</span></td>
                <td>
                  <button onClick={() => view(d)}>Xem</button>
                  <button onClick={() => openEdit(d)}>Sửa</button>
                  <button className="danger" onClick={() => remove(d)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
