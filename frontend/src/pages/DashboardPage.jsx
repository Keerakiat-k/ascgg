import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Users, UserPlus, ShieldAlert,
  FileText, Calendar, Wallet, CheckCircle, 
  Clock, AlertCircle, BarChart3, TrendingUp
} from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  
  // ดึงค่ามาจาก AdminLayout ผ่าน Context
  const { userRole, userName } = useOutletContext();
  const [pendingTicketsCount, setPendingTicketsCount] = useState(0);
  const [stats, setStats] = useState({ totalEmployees: 0, newThisMonth: 0, resigned: 0 });

  useEffect(() => {
    // โหลดข้อมูลภาพรวมสำหรับ Admin/HR
    const fetchStats = async () => {
      try {
        if (userRole === '1' || userRole === '2') {
          const empRes = await fetch('http://localhost:5000/api/employees');
          const empData = await empRes.json();
          if (empRes.ok) {
            const emps = empData.data || [];
            setStats({
              totalEmployees: emps.filter(e => e.status === 'Active').length,
              newThisMonth: Math.floor(Math.random() * 10), // Mock
              resigned: emps.filter(e => e.status === 'Inactive').length
            });
          }
        }
        
        if (userRole === '1') {
          const ticketRes = await fetch('http://localhost:5000/api/it-support');
          const ticketData = await ticketRes.json();
          if (ticketRes.ok) {
            setPendingTicketsCount(ticketData.data.filter(t => t.status === 'รอรับเรื่อง').length);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard stats', error);
      }
    };
    fetchStats();
  }, [userRole]);

  // ==========================================
  // 1. หน้าจอสำหรับ: พนักงานทั่วไป (Employee)
  // ==========================================
  const renderEmployeeDashboard = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">สวัสดี, {userName} 👋</h2>
          <p className="text-blue-100 max-w-lg">ยินดีต้อนรับเข้าสู่ระบบจัดการบุคลากร ตรวจสอบข้อมูลส่วนตัวหรือวันลาคงเหลือได้ที่นี่</p>
        </div>
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4">
          <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Calendar size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">วันลาคงเหลือ</h3>
          <p className="text-slate-500 text-sm mt-1">พักร้อน 5 วัน | ลากิจ 3 วัน</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Wallet size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">สลิปเงินเดือน</h3>
          <p className="text-slate-500 text-sm mt-1">ดูสลิปเงินเดือนเดือนล่าสุดและย้อนหลัง</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FileText size={24} />
          </div>
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-slate-900">ภาพรวมทรัพยากรบุคคล</h2>
        <p className="text-slate-500">สถิติและข้อมูลพนักงานประจำเดือน</p>
      </div>

      {/* Info Boxes (AdminLTE style but modern) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-2 bg-indigo-500"></div>
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
            <Users size={28} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">พนักงานทั้งหมด (Active)</p>
            <h3 className="text-3xl font-bold text-slate-900">{stats.totalEmployees}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-2 bg-emerald-500"></div>
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
            <UserPlus size={28} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">พนักงานใหม่ (เดือนนี้)</p>
            <h3 className="text-3xl font-bold text-slate-900">{stats.newThisMonth}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-2 bg-amber-500"></div>
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center shrink-0">
            <Clock size={28} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">รออนุมัติวันลา</p>
            <h3 className="text-3xl font-bold text-slate-900">12</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-2 bg-rose-500"></div>
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center shrink-0">
            <AlertCircle size={28} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">พนักงานพ้นสภาพ</p>
            <h3 className="text-3xl font-bold text-slate-900">{stats.resigned}</h3>
          </div>
        </div>
      </div>

      {/* Chart/Activity Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2"><TrendingUp size={20} className="text-indigo-500" /> อัตราการเข้าออกพนักงาน</h3>
          </div>
          <div className="h-64 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-100 border-dashed">
            <span className="text-slate-400 font-medium">ส่วนแสดงกราฟสถิติ (รอเชื่อมต่อข้อมูล)</span>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2"><Clock size={20} className="text-amber-500" /> กิจกรรมล่าสุด</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((_, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-500">
                  <CheckCircle size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">อนุมัติวันลาของ สมชาย พนักงานบัญชี</p>
                  <p className="text-xs text-slate-500 mt-1">2 ชั่วโมงที่แล้ว</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ==========================================
  // 3. หน้าจอสำหรับ: ผู้ดูแลระบบ (Admin)
  // ==========================================
  const renderAdminDashboard = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-slate-900">System Dashboard</h2>
        <p className="text-slate-500">ภาพรวมระบบและการแจ้งเตือนสำหรับผู้ดูแลระบบ</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-indigo-100 font-medium mb-1">พนักงานในระบบ (Active)</p>
              <h3 className="text-4xl font-bold">{stats.totalEmployees}</h3>
            </div>
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Users size={24} className="text-white" />
            </div>
          </div>
          <svg className="absolute -bottom-4 -right-4 w-32 h-32 text-indigo-400 opacity-30" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
        </div>

        <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden cursor-pointer hover:shadow-xl transition-shadow" onClick={() => navigate('/admin/it-support')}>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-rose-100 font-medium mb-1">แจ้งซ่อม IT (รอดำเนินการ)</p>
              <h3 className="text-4xl font-bold">{pendingTicketsCount}</h3>
            </div>
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <ShieldAlert size={24} className="text-white" />
            </div>
          </div>
          <svg className="absolute -bottom-4 -right-4 w-32 h-32 text-rose-400 opacity-30" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
        </div>

        <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-slate-300 font-medium mb-1">สถานะเซิร์ฟเวอร์</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-2xl font-bold text-emerald-400">Online</span>
              </div>
            </div>
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <BarChart3 size={24} className="text-white" />
            </div>
          </div>
          <svg className="absolute -bottom-4 -right-4 w-32 h-32 text-slate-600 opacity-30" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.73,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg>
        </div>
      </div>

    </div>
  );  
  
  return (
    <>
      {/* 🌟 แสดงหน้าจอตามสิทธิ์ (Role) 🌟 */}
      {userRole === '1' && renderAdminDashboard()}
      {userRole === '2' && renderHRDashboard()}
      {userRole === '3' && renderEmployeeDashboard()}
    </>
  );
}