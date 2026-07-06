import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, Building2, Users, Shield, Briefcase, 
  Workflow, ArrowLeft, Plus, Edit2, Trash2, X
} from 'lucide-react';
import Swal from 'sweetalert2';
import InputField from '../components/ui/InputField';
import SelectField from '../components/ui/SelectField';

export default function SystemSettingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('company_dept');
  
  // Data States
  const [companies, setCompanies] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [positions, setPositions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'company', 'department', 'role', 'position'
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [formData, setFormData] = useState({});

  const fetchSettingsData = async () => {
    try {
      setIsLoading(true);
      const [compRes, deptRes, roleRes, posRes] = await Promise.all([
        fetch('http://localhost:5000/api/settings/companies'),
        fetch('http://localhost:5000/api/settings/departments'),
        fetch('http://localhost:5000/api/settings/roles'),
        fetch('http://localhost:5000/api/settings/positions')
      ]);

      const compData = await compRes.json();
      const deptData = await deptRes.json();
      const roleData = await roleRes.json();
      const posData = await posRes.json();

      if (compRes.ok) setCompanies(compData.data || []);
      if (deptRes.ok) setDepartments(deptData.data || []);
      if (roleRes.ok) setRoles(roleData.data || []);
      if (posRes.ok) setPositions(posData.data || []);
    } catch (error) {
      console.error('Error fetching settings data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (isMounted) await fetchSettingsData();
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  // --- Handlers ---
  const openModal = (type, mode, data = {}) => {
    setModalType(type);
    setModalMode(mode);
    setFormData(data);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({});
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    let url = '';
    let method = modalMode === 'add' ? 'POST' : 'PUT';

    if (modalType === 'company') url = `http://localhost:5000/api/settings/companies${modalMode === 'edit' ? '/' + formData.id : ''}`;
    if (modalType === 'department') url = `http://localhost:5000/api/settings/departments${modalMode === 'edit' ? '/' + formData.id : ''}`;
    if (modalType === 'role') url = `http://localhost:5000/api/settings/roles/${formData.id}`;
    if (modalType === 'position') url = `http://localhost:5000/api/settings/positions${modalMode === 'edit' ? '/' + formData.id : ''}`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok && data.status === 'success') {
        Swal.fire({ title: 'สำเร็จ', text: data.message, icon: 'success', timer: 1500, showConfirmButton: false });
        closeModal();
        fetchSettingsData(); // Refresh Data
      } else {
        throw new Error(data.message || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      Swal.fire('ผิดพลาด', error.message, 'error');
    }
  };

  const handleDelete = (type, id) => {
    Swal.fire({
      title: 'ยืนยันการลบ?',
      text: "คุณจะไม่สามารถกู้คืนข้อมูลนี้ได้!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
      if (result.isConfirmed) {
        let url = '';
        if (type === 'company') url = `http://localhost:5000/api/settings/companies/${id}`;
        if (type === 'department') url = `http://localhost:5000/api/settings/departments/${id}`;
        if (type === 'position') url = `http://localhost:5000/api/settings/positions/${id}`;

        try {
          const res = await fetch(url, { method: 'DELETE' });
          const data = await res.json();
          if (res.ok && data.status === 'success') {
            Swal.fire({ title: 'ลบสำเร็จ!', text: data.message, icon: 'success', timer: 1500, showConfirmButton: false });
            fetchSettingsData();
          } else {
            throw new Error(data.message || 'เกิดข้อผิดพลาดในการลบ');
          }
        } catch (error) {
          Swal.fire('ลบไม่สำเร็จ', error.message, 'error');
        }
      }
    });
  };

  const TABS = [
    { id: 'company_dept', label: 'โครงสร้างบริษัทและแผนก', icon: Building2 },
    { id: 'roles_positions', label: 'ตำแหน่งและสิทธิ์', icon: Shield },
    { id: 'automation', label: 'ระบบอัตโนมัติและหมวดหมู่', icon: Workflow },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="text-indigo-600" />
          ตั้งค่าระบบองค์กร (System Settings)
        </h1>
        <p className="text-slate-500 mt-1">บริหารจัดการข้อมูลโครงสร้างบริษัท สิทธิ์ผู้ใช้งาน และค่าพื้นฐานของระบบ</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Tabs */}
        <div className="w-72 shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-2">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.id 
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <tab.icon size={18} className={activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400'} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {isLoading ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 flex flex-col items-center justify-center text-slate-400">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-indigo-600 border-r-indigo-600 border-b-transparent border-l-transparent mb-4"></div>
              <p className="font-medium">กำลังโหลดข้อมูลระบบ...</p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* TAB 1: Company & Dept */}
              {activeTab === 'company_dept' && (
                <div className="space-y-6">
                  {/* Companies Section */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                          <Building2 size={20} className="text-blue-600" />
                          บริษัทในเครือ (Companies)
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">รายชื่อบริษัทและรหัสอ้างอิงของบริษัท (Prefix)</p>
                      </div>
                      <button onClick={() => openModal('company', 'add')} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        <Plus size={16} /> เพิ่มบริษัท
                      </button>
                    </div>
                    <div className="p-0">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="px-6 py-4">Prefix</th>
                            <th className="px-6 py-4">ชื่อบริษัท</th>
                            <th className="px-6 py-4 text-center">สถานะ</th>
                            <th className="px-6 py-4 text-right">จัดการ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {companies.map(c => (
                            <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4 font-bold text-slate-700">{c.prefix}</td>
                              <td className="px-6 py-4 font-medium">{c.name}</td>
                              <td className="px-6 py-4 text-center">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${c.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                  {c.status || 'Active'}
                                </span>
                              </td>
                              <td className="px-6 py-4 flex justify-end gap-2">
                                <button onClick={() => openModal('company', 'edit', c)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete('company', c.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                              </td>
                            </tr>
                          ))}
                          {companies.length === 0 && (
                            <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">ไม่มีข้อมูลบริษัท</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Departments Section (Hidden for now)
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                          <Users size={20} className="text-indigo-600" />
                          แผนกองค์กร (Departments)
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">รายชื่อแผนกเพื่อใช้ในการจัดโครงสร้างและรายงาน</p>
                      </div>
                      <button onClick={() => openModal('department', 'add')} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        <Plus size={16} /> เพิ่มแผนก
                      </button>
                    </div>
                    <div className="p-0">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="px-6 py-4">รหัสแผนก</th>
                            <th className="px-6 py-4">ชื่อแผนก</th>
                            <th className="px-6 py-4 text-right">จัดการ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {departments.map(d => (
                            <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4 font-bold text-slate-700">{d.code}</td>
                              <td className="px-6 py-4 font-medium">{d.name}</td>
                              <td className="px-6 py-4 flex justify-end gap-2">
                                <button onClick={() => openModal('department', 'edit', d)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete('department', d.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                              </td>
                            </tr>
                          ))}
                          {departments.length === 0 && (
                            <tr><td colSpan="3" className="px-6 py-8 text-center text-slate-500">ไม่มีข้อมูลแผนก</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  */}
                </div>
              )}

              {/* TAB 2: Roles & Positions */}
              {activeTab === 'roles_positions' && (
                <div className="space-y-6">
                  {/* Roles Section */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                          <Shield size={20} className="text-emerald-600" />
                          สิทธิ์การใช้งาน (Roles)
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">สิทธิ์ในการเข้าถึงระบบ เช่น Admin, HR, Employee</p>
                      </div>
                    </div>
                    <div className="p-0">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="px-6 py-4 w-1/4">สิทธิ์การใช้งาน</th>
                            <th className="px-6 py-4">รายละเอียด</th>
                            <th className="px-6 py-4 text-right">จัดการ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {roles.map(r => (
                            <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4 font-bold text-slate-700">{r.name}</td>
                              <td className="px-6 py-4 text-slate-500">{r.description}</td>
                              <td className="px-6 py-4 flex justify-end gap-2">
                                <button onClick={() => openModal('role', 'edit', r)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                              </td>
                            </tr>
                          ))}
                          {roles.length === 0 && (
                            <tr><td colSpan="3" className="px-6 py-8 text-center text-slate-500">ไม่มีข้อมูลสิทธิ์</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {/* Positions Section (Hidden for now)
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                          <Briefcase size={20} className="text-amber-600" />
                          ตำแหน่งงาน (Positions)
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">รายชื่อตำแหน่งงานทั้งหมดในบริษัท</p>
                      </div>
                      <button onClick={() => openModal('position', 'add')} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        <Plus size={16} /> เพิ่มตำแหน่ง
                      </button>
                    </div>
                    <div className="p-0">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="px-6 py-4">ตำแหน่งงาน (Title)</th>
                            <th className="px-6 py-4">ระดับ (Level)</th>
                            <th className="px-6 py-4 text-right">จัดการ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {positions.map(p => (
                            <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4 font-bold text-slate-700">{p.title}</td>
                              <td className="px-6 py-4 font-medium text-slate-500">{p.level_name || '-'}</td>
                              <td className="px-6 py-4 flex justify-end gap-2">
                                <button onClick={() => openModal('position', 'edit', p)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete('position', p.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                              </td>
                            </tr>
                          ))}
                          {positions.length === 0 && (
                            <tr><td colSpan="3" className="px-6 py-8 text-center text-slate-500">ไม่มีข้อมูลตำแหน่งงาน</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  */}
                </div>
              )}

              {/* TAB 3: Automation & Categories */}
              {activeTab === 'automation' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-16 text-center">
                  <Workflow size={48} className="mx-auto text-slate-300 mb-4" />
                  <h3 className="text-xl font-bold text-slate-900">ระบบอัตโนมัติและหมวดหมู่</h3>
                  <p className="text-slate-500 mt-2 max-w-md mx-auto">
                    ส่วนนี้เตรียมไว้สำหรับตั้งค่าหมวดหมู่ IT Support (Hardware, Software) และประเภทประกาศข่าวสาร ในการอัปเดตเวอร์ชันถัดไป
                  </p>
                </div>
              )}

            </div>
          )}
        </div>
      </div>

      {/* --- Global Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">
                {modalMode === 'add' ? 'เพิ่ม' : 'แก้ไข'}
                {modalType === 'company' && 'บริษัท'}
                {modalType === 'department' && 'แผนก'}
                {modalType === 'role' && 'สิทธิ์การใช้งาน'}
                {modalType === 'position' && 'ตำแหน่งงาน'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              
              {modalType === 'company' && (
                <>
                  <InputField label="ตัวย่อบริษัท (Prefix)" name="prefix" value={formData.prefix || ''} onChange={handleFormChange} required placeholder="เช่น AEP" />
                  <InputField label="ชื่อบริษัท" name="name" value={formData.name || ''} onChange={handleFormChange} required placeholder="บริษัท ตัวอย่าง จำกัด" />
                  <SelectField label="สถานะ" name="status" value={formData.status || 'Active'} onChange={handleFormChange} options={[{value:'Active',label:'Active'},{value:'Inactive',label:'Inactive'}]} />
                </>
              )}

              {modalType === 'department' && (
                <>
                  <InputField label="รหัสแผนก" name="code" value={formData.code || ''} onChange={handleFormChange} required placeholder="เช่น IT, HR, FIN" />
                  <InputField label="ชื่อแผนก" name="name" value={formData.name || ''} onChange={handleFormChange} required placeholder="เทคโนโลยีสารสนเทศ" />
                </>
              )}

              {modalType === 'role' && (
                <>
                  <InputField label="ชื่อสิทธิ์" name="name" value={formData.name || ''} onChange={handleFormChange} required disabled={formData.id <= 3} />
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">รายละเอียด</label>
                    <textarea name="description" value={formData.description || ''} onChange={handleFormChange} rows="3" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-y"></textarea>
                  </div>
                  {formData.id <= 3 && <p className="text-xs text-amber-600 mt-2">* ไม่สามารถเปลี่ยนชื่อสิทธิ์พื้นฐานของระบบได้</p>}
                </>
              )}

              {modalType === 'position' && (
                <>
                  <InputField label="ชื่อตำแหน่งงาน" name="title" value={formData.title || ''} onChange={handleFormChange} required placeholder="เช่น Software Engineer" />
                  <InputField label="ระดับ (Level)" name="level_name" value={formData.level_name || ''} onChange={handleFormChange} placeholder="เช่น Junior, Senior, Manager" />
                </>
              )}

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition-colors">
                  ยกเลิก
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors">
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
