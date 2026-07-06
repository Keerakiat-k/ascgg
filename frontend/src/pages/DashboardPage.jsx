import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, UserPlus, Settings, ShieldAlert,
  FileText, Calendar, Wallet, Bell,
  LogOut, ShieldCheck, UserCheck, LayoutDashboard
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function DashboardPage() {
  const navigate = useNavigate();

  // 🌟 (จำลอง) ดึงสิทธิ์ผู้ใช้จาก LocalStorage หรือตั้งค่าเริ่มต้น
  // ในระบบจริง คุณจะดึงค่านี้มาจาก Token หลังจาก Login สำเร็จครับ
  const [userRole, setUserRole] = useState('1'); // 1 = Admin, 2 = HR, 3 = Employee
  const [userName, setUserName] = useState('แอดมิน ระบบ');

  const handleLogout = () => {
    Swal.fire({
      title: 'ออกจากระบบสำเร็จ',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    }).then(() => {
      navigate('/');
    });
  };

  // ==========================================
  // 1. หน้าจอสำหรับ: พนักงานทั่วไป (Employee)
  // ==========================================
  const renderEmployeeDashboard = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-6">
        <div className="h-20 w-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold">
          สญ
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{userName}</h2>
          <p className="text-slate-500">พนักงานบัญชี | แผนกการเงินและบัญชี</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <Calendar className="text-blue-500 mb-4" size={32} />
          <h3 className="text-lg font-bold text-slate-900">วันลาคงเหลือ</h3>
          <p className="text-slate-500 text-sm mt-1">พักร้อน 5 วัน | ลากิจ 3 วัน</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <Wallet className="text-green-500 mb-4" size={32} />
          <h3 className="text-lg font-bold text-slate-900">สลิปเงินเดือน</h3>
          <p className="text-slate-500 text-sm mt-1">ดูสลิปเงินเดือนเดือนล่าสุดและย้อนหลัง</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <FileText className="text-purple-500 mb-4" size={32} />
          <h3 className="text-lg font-bold text-slate-900">ข้อมูลส่วนตัว</h3>
          <p className="text-slate-500 text-sm mt-1">ตรวจสอบและขอแก้ไขประวัติส่วนตัว</p>
        </div>
      </div>
    </div>
  );

  // ==========================================
  // 2. หน้าจอสำหรับ: ทรัพยากรบุคคล (HR)
  // ==========================================
  const renderHRDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-indigo-500">
          <p className="text-slate-500 text-sm font-medium mb-1">พนักงานทั้งหมด</p>
          <h3 className="text-3xl font-bold text-slate-900">128 <span className="text-sm font-normal text-slate-500">คน</span></h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-green-500">
          <p className="text-slate-500 text-sm font-medium mb-1">พนักงานใหม่ (เดือนนี้)</p>
          <h3 className="text-3xl font-bold text-slate-900">5 <span className="text-sm font-normal text-slate-500">คน</span></h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-orange-500">
          <p className="text-slate-500 text-sm font-medium mb-1">รออนุมัติวันลา</p>
          <h3 className="text-3xl font-bold text-slate-900">12 <span className="text-sm font-normal text-slate-500">รายการ</span></h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-red-500">
          <p className="text-slate-500 text-sm font-medium mb-1">พนักงานที่ลาออก</p>
          <h3 className="text-3xl font-bold text-slate-900">2 <span className="text-sm font-normal text-slate-500">คน</span></h3>
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-900 mt-8 mb-4">เมนูด่วนสำหรับ HR</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          onClick={() => navigate('/employee-list')}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex items-center gap-4 group"
        >
          <div className="bg-indigo-50 p-4 rounded-xl group-hover:bg-indigo-100 transition-colors">
            <Users className="text-indigo-600" size={28} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900">จัดการรายชื่อพนักงาน</h4>
            <p className="text-sm text-slate-500">ดูรายชื่อ ค้นหา และแก้ไขประวัติพนักงาน</p>
          </div>
        </div>

        <div
          onClick={() => navigate('/employees/new')}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex items-center gap-4 group"
        >
          <div className="bg-blue-50 p-4 rounded-xl group-hover:bg-blue-100 transition-colors">
            <UserPlus className="text-blue-600" size={28} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900">เพิ่มพนักงานใหม่</h4>
            <p className="text-sm text-slate-500">บันทึกประวัติพนักงานใหม่เข้าสู่ระบบ</p>
          </div>
        </div>
      </div>
    </div>
  );

  // ==========================================
  // 3. หน้าจอสำหรับ: ผู้ดูแลระบบ (Admin)
  // ==========================================
  const renderAdminDashboard = () => (
    <div className="space-y-6">
      {/* แถบแจ้งสถานะระบบ */}
      <div className="bg-slate-900 p-6 rounded-2xl shadow-sm text-white flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="text-green-400" /> System Status: Online</h2>
          <p className="text-slate-400 mt-1">ระบบฐานข้อมูลและ API ทำงานปกติ (Uptime: 99.9%)</p>
        </div>
        <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-700">
          ดู Log ระบบ
        </button>
      </div>

      {/* เมนูการตั้งค่าระบบและ IT Helpdesk */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <Settings className="text-slate-700 mb-4" size={32} />
          <h3 className="text-lg font-bold text-slate-900">ตั้งค่าระบบองค์กร</h3>
          <p className="text-slate-500 text-sm mt-1">จัดการบริษัท, แผนก, และโครงสร้างองค์กร</p>
        </div>
        
        <div 
          onClick={() => navigate('/admin/it-support')}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
        >
          <div className="absolute top-6 right-6 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse shadow-sm">
            3 งานใหม่
          </div>
          <div className="bg-indigo-50 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <ShieldAlert className="text-indigo-600" size={28} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">ระบบแจ้งซ่อม IT</h3>
          <p className="text-slate-500 text-sm mt-1">จัดการคำร้อง, อัปเดตสถานะ และให้ความช่วยเหลือ</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <ShieldAlert className="text-red-500 mb-4" size={32} />
          <h3 className="text-lg font-bold text-slate-900">ความปลอดภัยระบบ</h3>
          <p className="text-slate-500 text-sm mt-1">ตั้งค่า Password Policy และ 2FA</p>
        </div>
      </div>

      {/* 🌟 เมนูจัดการบัญชีผู้ใช้งานสำหรับ Admin (เอาปุ่มเพิ่มพนักงานออกแล้ว) 🌟 */}
      <h3 className="text-lg font-bold text-slate-900 mt-8 mb-4">การจัดการบัญชีผู้ใช้งาน (User Management)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          onClick={() => navigate('/employee-list')}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex items-center gap-4 group"
        >
          <div className="bg-indigo-50 p-4 rounded-xl group-hover:bg-indigo-100 transition-colors">
            <Users className="text-indigo-600" size={28} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900">จัดการบัญชีและรายชื่อพนักงาน</h4>
            <p className="text-sm text-slate-500">ดูรายชื่อพนักงานทั้งหมด, สร้างอีเมลองค์กร และรีเซ็ตรหัสผ่าน</p>
          </div>
        </div>
      </div>
      
    </div>
  );  
  
  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* --- NAVBAR --- */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="text-indigo-600" size={24} />
            <span className="text-lg font-bold text-slate-900 tracking-tight">ASCG Portal</span>

            {/* แสดงป้ายบอกสถานะสิทธิ์ */}
            <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold ${userRole === '1' ? 'bg-red-100 text-red-700' :
              userRole === '2' ? 'bg-indigo-100 text-indigo-700' :
                'bg-blue-100 text-blue-700'
              }`}>
              {userRole === '1' ? 'Admin' : userRole === '2' ? 'HR' : 'Employee'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <LogOut size={16} />
            ออกจากระบบ
          </button>
        </div>
      </nav>

      {/* --- 🛠️ แถบสำหรับเทสเปลี่ยนสิทธิ์ (ลบออกตอนใช้งานจริง) 🛠️ --- */}
      <div className="bg-indigo-50 border-b border-indigo-100 p-3">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 text-sm">
          <span className="font-semibold text-indigo-900">🔧 จำลองมุมมอง (Test Roles):</span>
          <button onClick={() => { setUserRole('1'); setUserName('แอดมิน ระบบ'); }} className={`px-3 py-1 rounded-md transition-colors ${userRole === '1' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 hover:bg-indigo-100'}`}>Admin</button>
          <button onClick={() => { setUserRole('2'); setUserName('สมหญิง ทรัพยากรบุคคล'); }} className={`px-3 py-1 rounded-md transition-colors ${userRole === '2' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 hover:bg-indigo-100'}`}>HR</button>
          <button onClick={() => { setUserRole('3'); setUserName('สมชาย พนักงานบัญชี'); }} className={`px-3 py-1 rounded-md transition-colors ${userRole === '3' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 hover:bg-indigo-100'}`}>Employee</button>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">สวัสดี, {userName} 👋</h1>
          <p className="text-slate-500 mt-1">ยินดีต้อนรับเข้าสู่ระบบจัดการบุคลากร ASCG Group</p>
        </div>

        {/* 🌟 แสดงหน้าจอตามสิทธิ์ (Role) 🌟 */}
        {userRole === '1' && renderAdminDashboard()}
        {userRole === '2' && renderHRDashboard()}
        {userRole === '3' && renderEmployeeDashboard()}

      </main>
    </div>
  );
}