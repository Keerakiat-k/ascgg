import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, UserPlus, ShieldAlert, 
  Settings, Megaphone, LogOut, Menu, X, Bell,
  User as UserIcon, Workflow, FileText
} from 'lucide-react';
import Swal from 'sweetalert2';
import aiaLogo from '../../assets/AIA.png';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 🌟 (จำลอง) ดึงสิทธิ์ผู้ใช้จาก LocalStorage
  const [userRole, setUserRole] = useState(localStorage.getItem('mockRole') || '1'); // 1=Admin, 2=HR, 3=Employee
  const [userName, setUserName] = useState(localStorage.getItem('mockName') || 'แอดมิน ระบบ');

  useEffect(() => {
    localStorage.setItem('mockRole', userRole);
    localStorage.setItem('mockName', userName);
    // แจ้ง event เพื่อให้ component อื่นอัปเดต (ถ้าต้องการ)
    window.dispatchEvent(new Event('roleChanged'));
  }, [userRole, userName]);

  const handleLogout = () => {
    Swal.fire({
      title: 'ออกจากระบบสำเร็จ',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    }).then(() => {
      navigate('/login');
    });
  };

  const menuItems = [
    { path: '/dashboard', name: 'หน้าหลัก', icon: LayoutDashboard, roles: ['1', '2', '3'] },
    { path: '/employee-list', name: 'รายชื่อพนักงาน', icon: Users, roles: ['1', '2'] },
    { path: '/employees/new', name: 'เพิ่มพนักงาน', icon: UserPlus, roles: ['1', '2'] },
    { path: '/it-support', name: 'แจ้งปัญหา IT', icon: ShieldAlert, roles: ['1', '2', '3'] },
    { path: '/admin/it-support', name: 'ระบบรับแจ้งซ่อม IT', icon: Workflow, roles: ['1'] },
    { path: '/admin/announcements/new', name: 'จัดการประกาศ', icon: Megaphone, roles: ['1', '2'] },
    { path: '/settings', name: 'ตั้งค่าระบบ', icon: Settings, roles: ['1'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-lg">
              <img src={aiaLogo} alt="ASCG Logo" className="h-8 object-contain" />
            </div>
            <span className="font-bold text-lg tracking-tight">ASCG Portal</span>
          </div>
          <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-500 rounded-full flex items-center justify-center font-bold text-white shadow-inner">
              {userName.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold truncate">{userName}</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 mt-1 rounded-full w-max ${
                userRole === '1' ? 'bg-red-500/20 text-red-300' :
                userRole === '2' ? 'bg-indigo-500/20 text-indigo-300' :
                'bg-blue-500/20 text-blue-300'
              }`}>
                {userRole === '1' ? 'Administrator' : userRole === '2' ? 'HR Manager' : 'Employee'}
              </span>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1.5 overflow-y-auto h-[calc(100vh-140px)] custom-scrollbar">
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">เมนูหลัก</p>
          {filteredMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${isActive 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }
              `}
            >
              <item.icon size={18} className={location.pathname === item.path ? 'text-indigo-200' : 'text-slate-500'} />
              {item.name}
            </NavLink>
          ))}

          {/* Dummy menu for Employee */}
          {userRole === '3' && (
            <>
              <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-6 mb-2">ข้อมูลส่วนบุคคล</p>
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-all">
                <FileText size={18} className="text-slate-500" />
                สลิปเงินเดือน
              </a>
            </>
          )}
        </nav>
      </aside>

      {/* --- Overlay for Mobile --- */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* --- MAIN WRAPPER --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* TOP NAVBAR */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-lg transition-colors md:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            
            {/* 🛠️ Test Roles Switcher (For Dev/Demo) */}
            <div className="hidden lg:flex items-center gap-2 text-xs bg-slate-100 p-1 rounded-lg border border-slate-200">
              <span className="font-semibold text-slate-500 px-2">จำลองสิทธิ์:</span>
              <button onClick={() => { setUserRole('1'); setUserName('แอดมิน ระบบ'); navigate('/dashboard'); }} className={`px-2.5 py-1 rounded-md transition-colors ${userRole === '1' ? 'bg-white shadow-sm font-bold text-slate-900' : 'text-slate-500 hover:bg-slate-200'}`}>Admin</button>
              <button onClick={() => { setUserRole('2'); setUserName('สมหญิง ทรัพยากรบุคคล'); navigate('/dashboard'); }} className={`px-2.5 py-1 rounded-md transition-colors ${userRole === '2' ? 'bg-white shadow-sm font-bold text-slate-900' : 'text-slate-500 hover:bg-slate-200'}`}>HR</button>
              <button onClick={() => { setUserRole('3'); setUserName('สมชาย พนักงานบัญชี'); navigate('/dashboard'); }} className={`px-2.5 py-1 rounded-md transition-colors ${userRole === '3' ? 'bg-white shadow-sm font-bold text-slate-900' : 'text-slate-500 hover:bg-slate-200'}`}>Employee</button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-slate-600 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </button>
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-6 lg:p-8">
          <Outlet context={{ userRole, userName }} />
        </main>
        
      </div>
    </div>
  );
}
