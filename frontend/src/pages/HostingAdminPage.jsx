import { useState, useEffect } from 'react';
import { Server, Plus, Search, Edit, Trash2, Globe, Mail, Save, X, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';

export default function HostingAdminPage() {
  const [hostings, setHostings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    domain_name: '',
    website_url: '',
    website_username: '',
    website_password: '',
    email_provider: '',
    email_username: '',
    email_password: '',
    registration_date: '',
    expiration_date: '',
    status: 'Active',
    note: ''
  });

  const [showPassword, setShowPassword] = useState({});

  const togglePasswordVisibility = (id, field) => {
    setShowPassword(prev => ({
      ...prev,
      [`${id}_${field}`]: !prev[`${id}_${field}`]
    }));
  };

  const fetchHostings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(import.meta.env.VITE_API_BASE_URL + '/api/hostings');
      const result = await response.json();
      if (response.ok && result.status === 'success') {
        setHostings(result.data);
      }
    } catch (error) {
      console.error('Error fetching hostings:', error);
      Swal.fire('ผิดพลาด', 'ไม่สามารถโหลดข้อมูล Hosting ได้', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHostings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      domain_name: item.domain_name || '',
      website_url: item.website_url || '',
      website_username: item.website_username || '',
      website_password: item.website_password || '',
      email_provider: item.email_provider || '',
      email_username: item.email_username || '',
      email_password: item.email_password || '',
      registration_date: item.registration_date ? item.registration_date.split('T')[0] : '',
      expiration_date: item.expiration_date ? item.expiration_date.split('T')[0] : '',
      status: item.status || 'Active',
      note: item.note || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id, domain) => {
    Swal.fire({
      title: 'ยืนยันการลบ?',
      text: `คุณต้องการลบข้อมูลโดเมน "${domain}" ใช่หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#4f46e5',
      confirmButtonText: 'ลบเลย',
      cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/hostings/${id}`, { method: 'DELETE' });
          if (response.ok) {
            Swal.fire('ลบแล้ว!', 'ลบข้อมูลสำเร็จ', 'success');
            fetchHostings();
          }
        } catch (error) {
          Swal.fire('ผิดพลาด', 'ไม่สามารถลบข้อมูลได้', 'error');
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId 
        ? `${import.meta.env.VITE_API_BASE_URL}/api/hostings/${editingId}`
        : import.meta.env.VITE_API_BASE_URL + '/api/hostings';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        Swal.fire('สำเร็จ', 'บันทึกข้อมูลเรียบร้อยแล้ว', 'success');
        setIsModalOpen(false);
        fetchHostings();
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Error saving:', error);
      Swal.fire('ผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้', 'error');
    }
  };

  const openNewModal = () => {
    setEditingId(null);
    setFormData({
      domain_name: '',
      website_url: '',
      website_username: '',
      website_password: '',
      email_provider: '',
      email_username: '',
      email_password: '',
      registration_date: '',
      expiration_date: '',
      status: 'Active',
      note: ''
    });
    setIsModalOpen(true);
  };

  const filteredData = hostings.filter(item => 
    item.domain_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2.5">
            <Server className="text-[#f89919]" size={28} />
            จัดการระบบ Hosting & Domain
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">จัดการรหัสผ่านและตรวจสอบวันต่ออายุ Hosting ของบริษัทในเครือ</p>
        </div>
        <button 
          onClick={openNewModal}
          className="w-full sm:w-auto bg-[#f89919] hover:bg-[#d97c08] text-white px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-2xs"
        >
          <Plus size={18} />
          เพิ่มโดเมนใหม่
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อโดเมน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#f89919]/40 focus:border-[#f89919] outline-none transition-all bg-white"
            />
          </div>
        </div>

        {/* 💻 Desktop Table View (md:block) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <th className="px-6 py-4">Domain / Company</th>
                <th className="px-6 py-4">Website Access</th>
                <th className="px-6 py-4">Email Hosting</th>
                <th className="px-6 py-4">Expiration</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan="6" className="text-center py-8 text-slate-500">กำลังโหลดข้อมูล...</td></tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((item) => {
                  const isExpiringSoon = item.expiration_date && new Date(item.expiration_date) < new Date(new Date().setMonth(new Date().getMonth() + 1));
                  
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors align-top">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 text-base">{item.domain_name}</div>
                        {item.note && (
                          <div className="text-xs text-slate-500 mt-1 max-w-xs truncate" title={item.note}>
                            {item.note.includes('{') ? 'มีข้อมูลนำเข้าจาก Excel' : item.note}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm font-medium flex items-center gap-1 text-slate-700">
                            <Globe size={14} className="text-[#f89919]"/> {item.website_url || '-'}
                          </div>
                          <div className="text-xs text-slate-500">U: {item.website_username || '-'}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            P: {showPassword[`${item.id}_web`] ? item.website_password : '••••••••'} 
                            {item.website_password && (
                              <button onClick={() => togglePasswordVisibility(item.id, 'web')} className="text-[#f89919] hover:text-orange-700">
                                {showPassword[`${item.id}_web`] ? <EyeOff size={12}/> : <Eye size={12}/>}
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm font-medium flex items-center gap-1 text-slate-700">
                            <Mail size={14} className="text-[#f89919]"/> {item.email_provider || '-'}
                          </div>
                          <div className="text-xs text-slate-500">U: {item.email_username || '-'}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            P: {showPassword[`${item.id}_email`] ? item.email_password : '••••••••'}
                            {item.email_password && (
                              <button onClick={() => togglePasswordVisibility(item.id, 'email')} className="text-[#f89919] hover:text-orange-700">
                                {showPassword[`${item.id}_email`] ? <EyeOff size={12}/> : <Eye size={12}/>}
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm ${isExpiringSoon ? 'text-red-600 font-bold' : 'text-slate-600'}`}>
                          {item.expiration_date ? new Date(item.expiration_date).toLocaleDateString('th-TH') : 'ไม่ระบุ'}
                        </div>
                        {isExpiringSoon && <div className="text-xs text-red-500 mt-1">ใกล้หมดอายุ/หมดอายุแล้ว</div>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          item.status === 'Active' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                          item.status === 'Expired' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEdit(item)} className="p-2 text-slate-400 hover:text-[#f89919] hover:bg-orange-50 rounded-lg transition-colors" title="แก้ไข">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDelete(item.id, item.domain_name)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="ลบ">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan="6" className="text-center py-8 text-slate-500">ไม่พบข้อมูล</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 📱 Mobile Card View (md:hidden) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {isLoading ? (
            <div className="py-8 text-center text-slate-500 text-xs">กำลังโหลดข้อมูล...</div>
          ) : filteredData.length > 0 ? (
            filteredData.map((item) => {
              const isExpiringSoon = item.expiration_date && new Date(item.expiration_date) < new Date(new Date().setMonth(new Date().getMonth() + 1));
              
              return (
                <div key={item.id} className="p-4 space-y-3 hover:bg-slate-50 transition-colors">
                  
                  {/* Top: Domain + Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-900 text-base">{item.domain_name}</div>
                      {item.note && (
                        <div className="text-xs text-slate-400 mt-0.5">{item.note.includes('{') ? 'มีข้อมูลนำเข้าจาก Excel' : item.note}</div>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${
                      item.status === 'Active' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                      item.status === 'Expired' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  {/* Website & Email Access Details */}
                  <div className="grid grid-cols-1 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
                    
                    {/* Web Info */}
                    <div className="space-y-1">
                      <span className="font-bold text-slate-700 flex items-center gap-1 text-[11px]">
                        <Globe size={13} className="text-[#f89919]"/> เว็บไซต์: {item.website_url || '-'}
                      </span>
                      <div className="flex items-center justify-between text-slate-500 text-[11.5px]">
                        <span>U: {item.website_username || '-'}</span>
                        <div className="flex items-center gap-1">
                          <span>P: {showPassword[`${item.id}_web`] ? item.website_password : '••••••••'}</span>
                          {item.website_password && (
                            <button onClick={() => togglePasswordVisibility(item.id, 'web')} className="text-[#f89919] p-0.5">
                              {showPassword[`${item.id}_web`] ? <EyeOff size={12}/> : <Eye size={12}/>}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Email Info */}
                    <div className="pt-2 border-t border-slate-200/50 space-y-1">
                      <span className="font-bold text-slate-700 flex items-center gap-1 text-[11px]">
                        <Mail size={13} className="text-[#f89919]"/> อีเมล: {item.email_provider || '-'}
                      </span>
                      <div className="flex items-center justify-between text-slate-500 text-[11.5px]">
                        <span>U: {item.email_username || '-'}</span>
                        <div className="flex items-center gap-1">
                          <span>P: {showPassword[`${item.id}_email`] ? item.email_password : '••••••••'}</span>
                          {item.email_password && (
                            <button onClick={() => togglePasswordVisibility(item.id, 'email')} className="text-[#f89919] p-0.5">
                              {showPassword[`${item.id}_email`] ? <EyeOff size={12}/> : <Eye size={12}/>}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expiration */}
                    <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between">
                      <span className="text-slate-400 text-[10.5px]">วันหมดอายุ:</span>
                      <span className={`text-[11.5px] font-medium ${isExpiringSoon ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                        {item.expiration_date ? new Date(item.expiration_date).toLocaleDateString('th-TH') : 'ไม่ระบุ'}
                        {isExpiringSoon && ' ⚠️'}
                      </span>
                    </div>

                  </div>

                  {/* Mobile Actions */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button 
                      onClick={() => handleEdit(item)} 
                      className="px-2.5 py-1.5 text-xs text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors flex items-center gap-1 border border-orange-200"
                    >
                      <Edit size={13} /> แก้ไข
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id, item.domain_name)} 
                      className="px-2.5 py-1.5 text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1 border border-rose-200"
                    >
                      <Trash2 size={13} /> ลบ
                    </button>
                  </div>

                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">ไม่พบข้อมูล</div>
          )}
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
              <h2 className="text-xl font-bold text-slate-900">{editingId ? 'แก้ไขข้อมูล Hosting' : 'เพิ่มโดเมนใหม่'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อโดเมน / บริษัท *</label>
                  <input type="text" name="domain_name" value={formData.domain_name} onChange={handleChange} required className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. ascggroup.com" />
                </div>

                {/* Website Section */}
                <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 space-y-4">
                  <h3 className="font-semibold text-indigo-900 flex items-center gap-2"><Globe size={18}/> Website Access</h3>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">URL สำหรับ Login (เช่น WordPress, DirectAdmin)</label>
                    <input type="text" name="website_url" value={formData.website_url} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Username</label>
                    <input type="text" name="website_username" value={formData.website_username} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
                    <input type="text" name="website_password" value={formData.website_password} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-indigo-500" />
                  </div>
                </div>

                {/* Email Section */}
                <div className="bg-indigo-50/50 p-4 rounded-2xl border border-blue-100 space-y-4">
                  <h3 className="font-semibold text-blue-900 flex items-center gap-2"><Mail size={18}/> Email Hosting</h3>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">ผู้ให้บริการ (Provider)</label>
                    <input type="text" name="email_provider" value={formData.email_provider} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Username (Email หลัก/Admin)</label>
                    <input type="text" name="email_username" value={formData.email_username} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
                    <input type="text" name="email_password" value={formData.email_password} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-indigo-500" />
                  </div>
                </div>

                {/* Details Section */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">วันที่จดทะเบียน</label>
                  <input type="date" name="registration_date" value={formData.registration_date} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">วันหมดอายุ / วันต่ออายุ</label>
                  <input type="date" name="expiration_date" value={formData.expiration_date} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">สถานะ</label>
                  <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="Active">Active (เปิดใช้งาน)</option>
                    <option value="Expired">Expired (หมดอายุ)</option>
                    <option value="Cancelled">Cancelled (ยกเลิก)</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">บันทึกเพิ่มเติม (Notes) / ข้อมูลดิบจาก Excel</label>
                  <textarea name="note" value={formData.note} onChange={handleChange} rows="5" className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-xs"></textarea>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors">
                  ยกเลิก
                </button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2 transition-colors">
                  <Save size={18} /> บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

