import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Megaphone, Plus, Edit, Trash2, Search, Mail, X } from 'lucide-react';
import Swal from 'sweetalert2';

export default function AnnouncementListPage() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Email Modal State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  
  const user = JSON.parse(localStorage.getItem('user_info') || '{}');
  const userRole = user.role || 'Admin'; // Admin, HR, etc.
  
  const [senderType, setSenderType] = useState(userRole === 'HR' ? 'HR' : 'IT');
  const [selectedBccList, setSelectedBccList] = useState([]);

  const [bccOptions, setBccOptions] = useState([]);

  const fetchBccOptions = async () => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      const response = await fetch(import.meta.env.VITE_API_BASE_URL + '/api/bcc-groups', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (response.ok && result.status === 'success') {
        setBccOptions(result.data.map(item => ({
          value: item.email,
          label: `${item.label} : ${item.email}`
        })));
      }
    } catch (error) {
      console.error('Error fetching bcc options:', error);
    }
  };

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(import.meta.env.VITE_API_BASE_URL + '/api/announcements?all=true');
      const result = await response.json();
      if (response.ok && result.status === 'success') {
        setAnnouncements(result.data);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      Swal.fire('ผิดพลาด', 'ไม่สามารถโหลดข้อมูลประกาศได้', 'error');
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    fetchAnnouncements();
    fetchBccOptions();
  }, []);

  // Reset to page 1 on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleDelete = (id, title) => {
    Swal.fire({
      title: 'ยืนยันการลบ?',
      text: `คุณต้องการลบประกาศ "${title}" ใช่หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#4f46e5',
      confirmButtonText: 'ลบเลย',
      cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/announcements/${id}`, {
            method: 'DELETE'
          });
          if (response.ok) {
            Swal.fire('ลบแล้ว!', 'ลบประกาศสำเร็จ', 'success');
            fetchAnnouncements();
          }
        } catch (error) {
          Swal.fire('ผิดพลาด', 'ไม่สามารถลบประกาศได้', 'error');
        }
      }
    });
  };

  const handleToggleStatus = async (item) => {
    const newStatus = item.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/announcements/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, status: newStatus })
      });
      if (response.ok) {
        fetchAnnouncements();
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      Swal.fire('ผิดพลาด', 'ไม่สามารถเปลี่ยนสถานะได้', 'error');
    }
  };

  const handleOpenEmailModal = (item) => {
    setSelectedAnnouncement(item);
    setSenderType(userRole === 'HR' ? 'HR' : 'IT');
    setSelectedBccList([]);
    setIsEmailModalOpen(true);
  };

  const handleBccToggle = (email) => {
    setSelectedBccList(prev => 
      prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
    );
  };

  const handleSelectAllBcc = (e) => {
    if (e.target.checked) {
      setSelectedBccList(bccOptions.map(o => o.value));
    } else {
      setSelectedBccList([]);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedAnnouncement) return;
    try {
      Swal.fire({ title: 'กำลังส่งอีเมล...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/announcements/${selectedAnnouncement.id}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          senderType, 
          selectedBccList 
        })
      });
      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        Swal.fire('ส่งสำเร็จ', data.message, 'success');
        setIsEmailModalOpen(false);
      } else {
        Swal.fire(data.status === 'warning' ? 'แจ้งเตือน' : 'ผิดพลาด', data.message, data.status === 'warning' ? 'warning' : 'error');
      }
    } catch (error) {
      Swal.fire('ผิดพลาด', error.message || 'ไม่สามารถส่งอีเมลได้', 'error');
    }
  };


  const filteredData = announcements.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="animate-fade-up">

      {/* Page Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <div style={{ width: 36, height: 36, background: '#fff7ed', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Megaphone size={18} style={{ color: '#f89919' }} />
            </div>
            จัดการประกาศองค์กร
          </h1>
          <p className="page-subtitle mt-1">จัดการประกาศ ข่าวสาร และกิจกรรมทั้งหมดในระบบ</p>
        </div>
        <button
          onClick={() => navigate('/admin/announcements/new')}
          className="btn-primary flex items-center gap-2 whitespace-nowrap w-fit"
        >
          <Plus size={16} />
          เพิ่มประกาศใหม่
        </button>
      </div>

      {/* Search bar */}
      <div style={{ background: '#ffffff', padding: '14px 16px', borderRadius: 14, border: '1px solid #e9ebee', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', marginBottom: 20 }}>
        <div style={{ position: 'relative', maxWidth: 360 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="ค้นหาหัวข้อประกาศ..."
            className="input-base"
            style={{ paddingLeft: 36 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#ffffff', borderRadius: 16, border: '1px solid #e9ebee', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafbfc', borderBottom: '1px solid #e9ebee' }}>
                {['หัวข้อ', 'ประเภท', 'สถานะ', 'วันที่ลงประกาศ', ''].map((h, i) => (
                  <th key={i} className="table-header-cell" style={{ textAlign: i === 4 ? 'right' : 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af', fontSize: 13 }}>กำลังโหลดข้อมูล...</td>
                </tr>
              ) : currentItems.length > 0 ? (
                currentItems.map((item) => (
                  <tr key={item.id} className="table-row" style={{ borderBottom: '1px solid #f4f5f7' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: '#111827' }}>{item.title}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '3px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 600,
                        ...(item.type === 'ประกาศสำคัญ' ? { background: '#fff1f2', color: '#be123c', border: '1px solid #fecdd3' } :
                           item.type === 'กิจกรรม' ? { background: '#fff7ed', color: '#c2690a', border: '1px solid #fed7aa' } :
                           { background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' })
                      }}>
                        {item.type}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button
                        onClick={() => handleToggleStatus(item)}
                        style={{
                          padding: '3px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 600,
                          border: '1px solid', cursor: 'pointer', transition: 'all 0.12s',
                          ...(item.status === 'Active'
                            ? { background: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0' }
                            : { background: '#fff1f2', color: '#be123c', borderColor: '#fecdd3' })
                        }}
                      >
                        {item.status === 'Active' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                      </button>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 12.5, color: '#9ca3af' }}>
                      {new Date(item.created_at).toLocaleDateString('th-TH')}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                        {[{ icon: <Mail size={15} />, title: 'ส่งอีเมล', action: () => handleOpenEmailModal(item), hoverColor: '#4f46e5', hoverBg: '#eef2ff' },
                          { icon: <Edit size={15} />, title: 'แก้ไข', action: () => navigate(`/admin/announcements/edit/${item.id}`), hoverColor: '#b45309', hoverBg: '#fff7ed' },
                          { icon: <Trash2 size={15} />, title: 'ลบ', action: () => handleDelete(item.id, item.title), hoverColor: '#dc2626', hoverBg: '#fff1f2' }
                        ].map((btn, i) => (
                          <button
                            key={i} onClick={btn.action} title={btn.title}
                            style={{ padding: '6px', borderRadius: 8, border: '1px solid transparent', background: 'transparent', color: '#9ca3af', cursor: 'pointer', transition: 'all 0.12s' }}
                            onMouseEnter={e => { e.currentTarget.style.color = btn.hoverColor; e.currentTarget.style.background = btn.hoverBg; e.currentTarget.style.borderColor = btn.hoverBg; }}
                            onMouseLeave={e => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                          >
                            {btn.icon}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af', fontSize: 13 }}>ไม่พบข้อมูล</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div style={{ padding: '14px 16px', borderTop: '1px solid #f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: '#9ca3af' }}>
              แสดง {((currentPage - 1) * itemsPerPage) + 1}–{Math.min(currentPage * itemsPerPage, filteredData.length)} จาก {filteredData.length} รายการ
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{ padding: '5px 12px', border: '1px solid #e9ebee', borderRadius: 8, fontSize: 12, fontWeight: 500, background: 'white', color: '#4b5563', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.4 : 1 }}
              >
                ก่อนหน้า
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page} onClick={() => setCurrentPage(page)}
                  style={{
                    width: 32, height: 32, borderRadius: 8, fontSize: 12, fontWeight: 600,
                    background: currentPage === page ? '#f89919' : 'white',
                    color: currentPage === page ? 'white' : '#4b5563',
                    border: `1px solid ${currentPage === page ? '#f89919' : '#e9ebee'}`,
                    cursor: 'pointer',
                  }}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{ padding: '5px 12px', border: '1px solid #e9ebee', borderRadius: 8, fontSize: 12, fontWeight: 500, background: 'white', color: '#4b5563', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.4 : 1 }}
              >
                ถัดไป
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Email Sending Modal */}
      {isEmailModalOpen && selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" style={{ background: 'rgba(10,8,5,0.6)', backdropFilter: 'blur(6px)' }}>
          <div className="animate-scale-in bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" style={{ border: '1px solid #e9ebee' }}>
            {/* Header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #f0f2f5', background: '#fafbfc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                <div style={{ width: 32, height: 32, background: '#eff6ff', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mail size={16} style={{ color: '#3b82f6' }} />
                </div>
                ส่งอีเมลแจ้งประกาศ
              </h3>
              <button onClick={() => setIsEmailModalOpen(false)} style={{ color: '#9ca3af', background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6 }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px 24px' }}>
              <p style={{ fontSize: 13, color: '#374151', marginBottom: 16 }}>
                เรื่องที่จะส่ง: <span style={{ fontWeight: 700, color: '#c2690a' }}>{selectedAnnouncement.title}</span>
              </p>

              {userRole === 'Admin' ? (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 6 }}>เลือกผู้ส่ง (Sender)</label>
                  <select
                    value={senderType}
                    onChange={(e) => setSenderType(e.target.value)}
                    className="input-base"
                    style={{ appearance: 'none' }}
                  >
                    <option value="IT">ส่งโดยอีเมล IT</option>
                    <option value="HR">ส่งโดยอีเมล HR</option>
                  </select>
                </div>
              ) : (
                <div style={{ marginBottom: 16, padding: '10px 14px', background: '#f9fafb', border: '1px solid #e9ebee', borderRadius: 10, fontSize: 13, color: '#4b5563' }}>
                  <strong>ผู้ส่ง:</strong> ส่งโดยอีเมล HR (บังคับตามสิทธิ์)
                </div>
              )}

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: '#374151' }}>เลือกอีเมล BCC เพิ่มเติม (ถ้ามี)</label>
                  {bccOptions.length > 0 && (
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#4f46e5', fontWeight: 500, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={selectedBccList.length === bccOptions.length && bccOptions.length > 0}
                        onChange={handleSelectAllBcc}
                        style={{ width: 14, height: 14, accentColor: '#f89919' }}
                      />
                      เลือกทั้งหมด
                    </label>
                  )}
                </div>
                <div className="custom-scrollbar" style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid #e9ebee', borderRadius: 10, background: '#fafbfc', padding: '6px 0' }}>
                  {bccOptions.map(option => (
                    <label key={option.value} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', cursor: 'pointer', transition: 'background 0.1s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedBccList.includes(option.value)}
                        onChange={() => handleBccToggle(option.value)}
                        style={{ width: 14, height: 14, accentColor: '#f89919', flexShrink: 0 }}
                      />
                      <span style={{ fontSize: 13, color: '#374151' }}>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 16, padding: '10px 14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, display: 'flex', gap: 10, fontSize: 12.5, color: '#92400e' }}>
                <span>⚠️</span>
                <span>ระบบจะดึงการตั้งค่าผู้รับ (To, CC, BCC) จากหน้าตั้งค่าระบบองค์กรของ "{senderType}" มารวมกับอีเมลที่คุณเลือกด้านบน</span>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid #f0f2f5', background: '#fafbfc', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setIsEmailModalOpen(false)} className="btn-ghost">ยกเลิก</button>
              <button onClick={handleSendEmail} className="btn-primary flex items-center gap-2">
                <Mail size={14} /> ยืนยันการส่ง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

