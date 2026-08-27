import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, UserMinus, Search, ArrowLeft, Printer, Users, Mail, CalendarRange, X, User } from 'lucide-react';
import Swal from 'sweetalert2';
import { useReactToPrint } from 'react-to-print';
import ITFormPrintTemplate from '../components/pdf/ITFormPrintTemplate';

export default function EmployeeListPage() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showResigned, setShowResigned] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ดึงข้อมูล Role เพื่อใช้เช็คสิทธิ์
  const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
  const mockRole = localStorage.getItem('mockRole');
  const isAdmin = String(userInfo.role_id) === '1' || mockRole === '1';

  // Print Setup
  const componentRef = useRef();
  const [selectedEmpForPrint, setSelectedEmpForPrint] = useState(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'IT-FORM-002',
    onAfterPrint: () => setSelectedEmpForPrint(null),
  });

  const triggerPrint = async (employee) => {
    try {
      Swal.fire({ title: 'กำลังโหลดข้อมูล...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/employees/${employee.id}`);
      const result = await response.json();
      Swal.close();
      if (response.ok && result.status === 'success') {
        setSelectedEmpForPrint(result.data);
        setTimeout(() => {
          handlePrint();
        }, 300); // Wait for state to update and render the template
      } else {
        Swal.fire('ผิดพลาด', 'ไม่พบข้อมูลพนักงาน', 'error');
      }
    } catch (error) {
      console.error('Error fetching employee for print:', error);
      Swal.fire('ผิดพลาด', 'ไม่สามารถดึงข้อมูลสำหรับพิมพ์ได้', 'error');
    }
  };

  // 1. ฟังก์ชันดึงข้อมูลพนักงานทั้งหมดมาแสดงในตาราง
  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(import.meta.env.VITE_API_BASE_URL + '/api/employees');
      const result = await response.json();
      if (response.ok && result.status === 'success') {
        setEmployees(result.data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      Swal.fire('ผิดพลาด', 'ไม่สามารถโหลดข้อมูลพนักงานได้', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // ดึงข้อมูลครั้งแรกเมื่อเปิดหน้าเว็บ
  useEffect(() => {
    fetchEmployees();
  }, []);

  // 2. ฟังก์ชันจัดการพนักงานลาออก
  const handleResign = (id, empName) => {
    Swal.fire({
      title: 'ระบุวันที่ลาออก',
      html: `
        <div class="text-sm text-gray-500 mb-2">กรุณาระบุวันที่ ${empName} พ้นสภาพพนักงาน:</div>
        <input type="date" id="resign-date" class="swal2-input" value="${new Date().toISOString().split('T')[0]}">
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'ยืนยันการลาออก',
      cancelButtonText: 'ยกเลิก',
      preConfirm: () => {
        const date = Swal.getPopup().querySelector('#resign-date').value;
        if (!date) {
          Swal.showValidationMessage('กรุณาระบุวันที่ลาออก');
        }
        return { date };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/employees/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Resigned', resignationDate: result.value.date })
          });

          const data = await response.json();

          if (response.ok && data.status === 'success') {
            Swal.fire('สำเร็จ!', 'อัปเดตสถานะและวันที่ลาออกเรียบร้อยแล้ว', 'success');
            fetchEmployees(); // 🌟 รีเฟรชตารางใหม่ทันที 🌟
          } else {
            throw new Error(data.message);
          }
        } catch (error) {
          Swal.fire('ผิดพลาด', 'ไม่สามารถอัปเดตสถานะได้', 'error');
        }
      }
    });
  };

  // กรองข้อมูลตามช่องค้นหา (รหัส หรือ ชื่อ) และสถานะการลาออก
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = (emp.employee_code && emp.employee_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (emp.full_name_th && emp.full_name_th.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // ถ้าระบุว่าไม่แสดงคนออก (showResigned = false) คนที่สถานะไม่ใช่ Active จะถูกซ่อน
    const matchesStatus = showResigned ? true : emp.status === 'Active';
    
    return matchesSearch && matchesStatus;
  });

  // 3. ฟังก์ชันส่งอีเมลต้อนรับพนักงานใหม่
  const handleSendWelcomeEmail = async (employee) => {
    Swal.fire({
      title: 'ยืนยันการส่งอีเมล',
      text: `ต้องการส่งอีเมลต้อนรับพนักงานใหม่ไปที่ ${employee.full_name_th} ใช่หรือไม่?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ใช่, ส่งเลย!',
      cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          Swal.fire({ title: 'กำลังส่งอีเมล...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/employees/${employee.id}/send-welcome-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
          const result = await response.json();
          if (response.ok && result.status === 'success') {
            Swal.fire('สำเร็จ!', result.message || 'ส่งอีเมลต้อนรับเรียบร้อยแล้ว', 'success');
          } else {
            Swal.fire('ผิดพลาด', result.message || 'ไม่สามารถส่งอีเมลได้', 'error');
          }
        } catch (error) {
          console.error('Error sending welcome email:', error);
          Swal.fire('ผิดพลาด', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', 'error');
        }
      }
    });
  };

  // Pagination Logic
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // รีเซ็ตหน้ากลับไปหน้าแรก เมื่อมีการค้นหาใหม่
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentEmployees = filteredEmployees.slice(startIndex, startIndex + itemsPerPage);

  // Leave Balances Logic
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [selectedLeaveEmp, setSelectedLeaveEmp] = useState(null);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [isSavingLeave, setIsSavingLeave] = useState(false);

  const handleOpenLeaveModal = async (employee) => {
    setSelectedLeaveEmp(employee);
    setLeaveBalances([]);
    setShowLeaveModal(true);
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/leave/employee/${employee.id}/balances`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setLeaveBalances(data.data);
      } else {
        throw new Error(data.message || 'ไม่สามารถโหลดข้อมูลวันลาได้');
      }
    } catch (err) {
      Swal.fire('ผิดพลาด', err.message, 'error');
      setShowLeaveModal(false);
    }
  };

  const handleLeaveBalanceChange = (id, newDays) => {
    setLeaveBalances(prev => prev.map(b => b.id === id ? { ...b, total_days: Number(newDays) } : b));
  };

  const handleSaveLeaveBalances = async () => {
    setIsSavingLeave(true);
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      const payload = {
        balances: leaveBalances.map(b => ({ id: b.id, total_days: b.total_days }))
      };
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/leave/employee/${selectedLeaveEmp.id}/balances`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        Swal.fire('สำเร็จ', 'บันทึกวันลาเรียบร้อยแล้ว', 'success');
        setShowLeaveModal(false);
      } else {
        throw new Error(data.message || 'เกิดข้อผิดพลาด');
      }
    } catch (err) {
      Swal.fire('ผิดพลาด', err.message, 'error');
    } finally {
      setIsSavingLeave(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Hidden Print Template */}
        <div style={{ display: 'none' }}>
          <ITFormPrintTemplate ref={componentRef} employee={selectedEmpForPrint} />
        </div>

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="text-[#f89919]" />
            รายการผู้ใช้งานระบบ (System Users)
          </h1>
          <p className="text-[#ae8a68] mt-1">รายชื่อผู้ใช้งานและสิทธิ์การถือครองทรัพย์สินบริษัท (PC / Notebook / IT Assets)</p>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-[#dfe0df] shadow-sm mb-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ae8a68]" size={18} />
              <input 
                type="text" 
                placeholder="ค้นหารหัส หรือ ชื่อผู้ใช้..." 
                className="pl-10 pr-4 py-2 border border-[#dfe0df] rounded-xl focus:ring-2 focus:ring-[#f89919]/40 focus:border-[#f89919] outline-none w-full text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm text-slate-600 hover:text-slate-900 bg-[#fff8f0] px-3 py-2 rounded-xl border border-[#dfe0df] transition-colors">
              <input 
                type="checkbox" 
                checked={showResigned} 
                onChange={(e) => setShowResigned(e.target.checked)}
                className="w-4 h-4 text-[#f89919] rounded border-[#dfe0df] focus:ring-[#f89919]"
              />
              <span>แสดงผู้ใช้ที่ปิดใช้งาน (Resigned)</span>
            </label>
          </div>
          
          <button 
            onClick={() => navigate('/employees/new')}
            className="w-full sm:w-auto bg-[#f89919] hover:bg-[#d97c08] text-white px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors font-semibold text-sm shadow-sm"
          >
            <Plus size={18} />
            เพิ่มผู้ใช้งานใหม่
          </button>
        </div>

        {/* Table & Mobile Cards Section */}
        <div className="bg-white rounded-2xl border border-[#dfe0df] shadow-sm overflow-hidden">
          
          {/* 💻 Desktop Table View (md:block) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fff8f0] border-b border-[#dfe0df] text-sm text-slate-700">
                  <th className="px-6 py-4 font-semibold">รหัสผู้ใช้</th>
                  <th className="px-6 py-4 font-semibold">ผู้ใช้งานระบบ</th>
                  <th className="px-6 py-4 font-semibold">บริษัท / แผนก</th>
                  <th className="px-6 py-4 font-semibold">ตำแหน่ง</th>
                  <th className="px-6 py-4 font-semibold">อีเมลองค์กร</th>
                  <th className="px-6 py-4 font-semibold">ทรัพย์สินที่ถือครอง</th>
                  <th className="px-6 py-4 font-semibold">สถานะ</th>
                  <th className="px-6 py-4 font-semibold text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dfe0df]">
                {isLoading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-12 text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#f89919] border-t-transparent"></div>
                        <span>กำลังโหลดข้อมูลผู้ใช้งานระบบ...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentEmployees.length > 0 ? (
                  currentEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900">{employee.employee_code}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {employee.profile_image ? (
                            <img src={`${import.meta.env.VITE_API_BASE_URL}${employee.profile_image}`} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                              <User size={18} className="text-slate-400" />
                            </div>
                          )}
                          <div>
                            <div className="text-slate-900 font-bold">{employee.full_name_th}</div>
                            {employee.nickname && <div className="text-xs text-slate-400">({employee.nickname})</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-medium">
                        <div>{employee.company_prefix}</div>
                        <div className="text-xs text-slate-400">{employee.department_name || 'ทั่วไป'}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm">{employee.position || '-'}</td>
                      <td className="px-6 py-4 text-slate-600 text-xs font-mono">{employee.email || '-'}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-[#f89919] border border-amber-200 rounded-lg text-xs font-bold">
                          💻 {employee.asset_count || 0} เครื่อง
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap shadow-xs ${
                          employee.status === 'Active' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${
                            employee.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                          }`} />
                          {employee.status === 'Active' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          {isAdmin && (
                            <button 
                              onClick={() => handleSendWelcomeEmail(employee)}
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="ส่งอีเมลต้อนรับผู้ใช้ใหม่"
                            >
                              <Mail size={18} />
                            </button>
                          )}

                          <button 
                            onClick={() => navigate(`/edit-employee/${employee.id}`)}
                            className="p-2 text-slate-400 hover:text-[#f89919] hover:bg-[#fff8f0] rounded-lg transition-colors"
                            title="แก้ไขข้อมูลผู้ใช้งาน"
                          >
                            <Edit size={18} />
                          </button>
                          
                          {employee.status !== 'Inactive' && (
                            <button 
                              onClick={() => handleResign(employee.id, employee.full_name_th)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="พ้นสภาพ/ลาออก"
                            >
                              <UserMinus size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-12 text-slate-400">ไม่พบข้อมูลพนักงาน</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 📱 Mobile Card View (md:hidden) */}
          <div className="block md:hidden divide-y divide-slate-100">
            {isLoading ? (
              <div className="py-12 text-center text-slate-400">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#f89919] border-t-transparent mx-auto mb-2"></div>
                <span className="text-xs">กำลังโหลดข้อมูลผู้ใช้...</span>
              </div>
            ) : currentEmployees.length > 0 ? (
              currentEmployees.map((employee) => (
                <div key={employee.id} className="p-4 space-y-3 hover:bg-slate-50 transition-colors">
                  
                  {/* Top: Avatar + Name + Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {employee.profile_image ? (
                        <img src={`${import.meta.env.VITE_API_BASE_URL}${employee.profile_image}`} alt="Profile" className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0">
                          <User size={20} className="text-slate-400" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {employee.employee_code}
                          </span>
                          <span className="text-xs font-bold text-orange-600">{employee.company_prefix}</span>
                        </div>
                        <div className="font-bold text-slate-900 text-sm mt-0.5">
                          {employee.full_name_th} {employee.nickname && <span className="text-slate-400 text-xs">({employee.nickname})</span>}
                        </div>
                      </div>
                    </div>

                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${
                      employee.status === 'Active' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        employee.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                      }`} />
                      {employee.status === 'Active' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10.5px]">แผนก / ตำแหน่ง</span>
                      <span className="font-medium text-slate-700">{employee.department_name || '-'} • {employee.position || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10.5px]">ทรัพย์สินถือครอง</span>
                      <span className="font-bold text-[#f89919]">💻 {employee.asset_count || 0} เครื่อง</span>
                    </div>
                    {employee.email && (
                      <div className="col-span-2 pt-1 border-t border-slate-200/50">
                        <span className="text-slate-400 block text-[10.5px]">อีเมล</span>
                        <span className="font-mono text-slate-600 text-[11px] break-all">{employee.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Mobile Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    {isAdmin && (
                      <button 
                        onClick={() => handleSendWelcomeEmail(employee)}
                        className="px-2.5 py-1.5 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1 border border-emerald-200"
                      >
                        <Mail size={13} /> ส่งอีเมล
                      </button>
                    )}
                    <button 
                      onClick={() => navigate(`/edit-employee/${employee.id}`)}
                      className="px-2.5 py-1.5 text-xs text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors flex items-center gap-1 border border-orange-200"
                    >
                      <Edit size={13} /> แก้ไข
                    </button>
                    {employee.status !== 'Inactive' && (
                      <button 
                        onClick={() => handleResign(employee.id, employee.full_name_th)}
                        className="px-2.5 py-1.5 text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1 border border-rose-200"
                      >
                        <UserMinus size={13} /> ปิดใช้งาน
                      </button>
                    )}
                  </div>

                </div>
              ))
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">ไม่พบข้อมูลพนักงาน</div>
            )}
          </div>

          {/* Pagination Controls */}
          {!isLoading && totalPages > 1 && (
            <div className="px-4 sm:px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs sm:text-sm text-slate-500 text-center sm:text-left">
                แสดง {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredEmployees.length)} จากทั้งหมด {filteredEmployees.length} รายการ
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm text-slate-600 transition-colors"
                >
                  ก่อนหน้า
                </button>
                <div className="flex gap-1 items-center overflow-x-auto max-w-[200px] sm:max-w-none">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs sm:text-sm font-medium transition-colors shrink-0 ${
                        currentPage === page
                          ? 'bg-[#f89919] text-white shadow-sm font-bold'
                          : 'hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm text-slate-600 transition-colors"
                >
                  ถัดไป
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Leave Balances Modal */}
        {showLeaveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <CalendarRange size={20} className="text-[#f89919]" />
                  จัดการโควต้าวันลา
                </h3>
                <button onClick={() => setShowLeaveModal(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <p className="text-sm text-slate-500">
                    พนักงาน: <span className="font-semibold text-slate-900">{selectedLeaveEmp?.full_name_th}</span>
                  </p>
                  <p className="text-sm text-slate-500">
                    ปี: <span className="font-semibold text-slate-900">{new Date().getFullYear()}</span>
                  </p>
                </div>

                <div className="space-y-4">
                  {leaveBalances.length === 0 ? (
                    <div className="text-center py-4 text-sm text-slate-500 flex flex-col items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-500 border-t-transparent mb-2"></div>
                      กำลังโหลดข้อมูล...
                    </div>
                  ) : (
                    leaveBalances.map(bal => (
                      <div key={bal.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-slate-50/50">
                        <span className="text-sm font-medium text-slate-700">{bal.leave_type_name}</span>
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            min="0"
                            step="0.5"
                            value={bal.total_days}
                            onChange={(e) => handleLeaveBalanceChange(bal.id, e.target.value)}
                            className="w-20 px-2 py-1 text-sm border border-slate-300 rounded text-center focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                          <span className="text-sm text-slate-500">วัน</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button 
                    onClick={() => setShowLeaveModal(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button 
                    onClick={handleSaveLeaveBalances}
                    disabled={isSavingLeave || leaveBalances.length === 0}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {isSavingLeave ? 'กำลังบันทึก...' : 'บันทึก'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

    </div>
  );
}