import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, UserMinus, Search, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';

export default function EmployeeListPage() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // 1. ฟังก์ชันดึงข้อมูลพนักงานทั้งหมดมาแสดงในตาราง
  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/employees');
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
      title: 'ยืนยันการทำรายการ?',
      text: `คุณต้องการเปลี่ยนสถานะของ ${empName} เป็น "ออกแล้ว" ใช่หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'ใช่, เปลี่ยนสถานะ',
      cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`http://localhost:5000/api/employees/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Inactive' })
          });

          const data = await response.json();

          if (response.ok && data.status === 'success') {
            Swal.fire('สำเร็จ!', 'อัปเดตสถานะพนักงานเรียบร้อยแล้ว', 'success');
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

  // กรองข้อมูลตามช่องค้นหา (รหัส หรือ ชื่อ)
  const filteredEmployees = employees.filter(emp => 
    (emp.employee_code && emp.employee_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (emp.full_name_th && emp.full_name_th.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')} 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 flex-shrink-0"
              title="กลับไปหน้าหลัก"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">รายชื่อพนักงานทั้งหมด</h1>
              <p className="text-gray-500 text-sm mt-1">จัดการประวัติและสถานะของพนักงานในระบบ</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="ค้นหารหัส หรือ ชื่อ..." 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button 
              onClick={() => navigate('/employees/new')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium whitespace-nowrap"
            >
              <Plus size={18} />
              เพิ่มพนักงานใหม่
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
                  <th className="px-6 py-4 font-medium">รหัสพนักงาน</th>
                  <th className="px-6 py-4 font-medium">ชื่อ-นามสกุล</th>
                  <th className="px-6 py-4 font-medium">บริษัท</th>
                  <th className="px-6 py-4 font-medium">ตำแหน่ง</th>
                  <th className="px-6 py-4 font-medium">สถานะ</th>
                  <th className="px-6 py-4 font-medium text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500">กำลังโหลดข้อมูล...</td>
                  </tr>
                ) : filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">{employee.employee_code}</span>
                      </td>
                      <td className="px-6 py-4">{employee.full_name_th}</td>
                      <td className="px-6 py-4">{employee.company_prefix}</td>
                      <td className="px-6 py-4">{employee.position}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          employee.status === 'Active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {employee.status === 'Active' ? 'ทำงานอยู่' : 'ออกแล้ว'}
                        </span>
                      </td>
                      
                      {/* 🌟 จุดที่แก้ไข: ปุ่มจัดการ (Edit / Resign) 🌟 */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => navigate(`/edit-employee/${employee.id}`)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="แก้ไขประวัติ"
                          >
                            <Edit size={18} />
                          </button>
                          
                          {/* ซ่อนปุ่มลาออก ถ้าสถานะเป็น Inactive (ลาออกไปแล้ว) */}
                          {employee.status !== 'Inactive' && (
                            <button 
                              onClick={() => handleResign(employee.id, employee.full_name_th)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                    <td colSpan="6" className="text-center py-8 text-gray-500">ไม่พบข้อมูลพนักงาน</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}