import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, UserPlus, UserMinus, ShieldAlert, 
  Settings, Megaphone, LogOut, Menu, X, Bell, CheckCircle,
  User as UserIcon, Workflow, FileText, Server, Package, Network,
  Calendar, ClipboardList, ChevronDown, ChevronRight, History, Activity
} from 'lucide-react';
import Swal from 'sweetalert2';
import aiaLogo from '../../assets/AIA.png';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const [simulationRoles, setSimulationRoles] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    if (isNotifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotifOpen]);
  const [notifications, setNotifications] = useState({
    newEmployees: [],
    resignedEmployees: [],
    pendingTickets: []
  });
  
  const getSafeUserInfo = () => {
    try {
      const stored = localStorage.getItem('user_info');
      if (!stored || stored === 'undefined' || stored === 'null') return {};
      return JSON.parse(stored);
    } catch (e) {
      return {};
    }
  };
  
  const [userInfo, setUserInfo] = useState(getSafeUserInfo());
  const userRole = userInfo.role || 'Guest';
  const userName = userInfo.email ? userInfo.email.split('@')[0] : 'Guest';
  const permissions = userInfo.permissions || [];

  const getApiBase = () => {
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    if (envUrl && envUrl.trim() !== '') return envUrl.trim().replace(/\/$/, '');
    if (typeof window !== 'undefined' && window.location) {
      const { hostname, protocol } = window.location;
      if (hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.startsWith('192.168.')) {
        return '';
      }
      return `${protocol}//${hostname}:5000`;
    }
    return '';
  };

  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    const baseUrl = getApiBase();

    fetch(`${baseUrl}/api/settings/roles`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setSimulationRoles(data.data || []);
        }
      })
      .catch(err => console.error('Error fetching roles for simulation:', err));

    // Fetch Notifications (New Employees, Resigned Employees & IT Helpdesk Active Tickets)
    const fetchNotifications = async () => {
      try {
        const authHeaders = { 'Authorization': `Bearer ${token}` };
        if (userRole === 'Admin' || userRole === 'IT Support' || userRole === 'HR') {
          const [ticketRes, newEmpRes, resignedRes] = await Promise.all([
            fetch(`${baseUrl}/api/it-support`, { headers: authHeaders }),
            fetch(`${baseUrl}/api/employees/new/current-month`, { headers: authHeaders }),
            fetch(`${baseUrl}/api/employees/resigned/current-month`, { headers: authHeaders })
          ]);

          const tickets = ticketRes.ok ? (await ticketRes.json()).data || [] : [];
          const newEmps = newEmpRes.ok ? (await newEmpRes.json()).data || [] : [];
          const resignedEmps = resignedRes.ok ? (await resignedRes.json()).data || [] : [];

          // 🌟 คัดเฉพาะทิกเก็ตแจ้งซ่อมที่รอรับเรื่อง / กำลังดำเนินการ 🌟
          const activeTickets = tickets.filter(t => 
            t.status !== 'แก้ไขเสร็จสิ้น' && 
            t.status !== 'เสร็จสิ้น' && 
            t.status !== 'ยกเลิกรายการ' &&
            t.status !== 'ยกเลิก' &&
            t.status !== 'Closed' &&
            t.status !== 'Resolved'
          );

          setNotifications({
            pendingTickets: activeTickets,
            newEmployees: newEmps,
            resignedEmployees: resignedEmps
          });
        }
      } catch (err) {
        // Silent catch to prevent red console errors on minor network disconnect
      }
    };

    fetchNotifications();

    // ตั้งระบบ Auto-refresh ข้อมูลการแจ้งเตือนทุกๆ 8 วินาที
    const interval = setInterval(fetchNotifications, 8000);
    return () => clearInterval(interval);
  }, [userRole, location.pathname]);

  const ticketCount = (notifications && Array.isArray(notifications.pendingTickets)) ? notifications.pendingTickets.length : 0;
  const newEmpCount = (notifications && Array.isArray(notifications.newEmployees)) ? notifications.newEmployees.length : 0;
  const resignedCount = (notifications && Array.isArray(notifications.resignedEmployees)) ? notifications.resignedEmployees.length : 0;
  const totalNotifs = ticketCount + newEmpCount + resignedCount;

  // Handle Direct Action Popups from Notification Dropdown (Original Full Rich Modal)
  const handleGrantAccessFromNotif = async (emp) => {
    setIsNotifOpen(false);
    const domainMap = {
      'AEP': '@ascgengineering.com',
      'AGC': '@ascggroup.com',
      'AIA': '@interprocorp.com',
      'AIC': '@ascggroup.com',
      'CST': '@cstintergroup.com',
      'QPM': '@qpmprevention.com',
      'SQT': '@synergyqthai.com'
    };
    const suggestedDomain = domainMap[emp.company_prefix] || '';
    
    let autoUsername = '';
    if (emp.first_name_en && emp.last_name_en) {
      autoUsername = `${emp.first_name_en.trim().toLowerCase()}.${emp.last_name_en.trim().charAt(0).toLowerCase()}`;
    }
    const suggestedEmail = autoUsername ? `${autoUsername}${suggestedDomain}` : suggestedDomain;
    const roleOptions = (simulationRoles || []).map(r => `<option value="${r.id}" ${r.name === 'Employee' ? 'selected' : ''}>${r.name}</option>`).join('');

    await Swal.fire({
      title: '',
      width: 520,
      padding: '0',
      showCancelButton: false,
      showConfirmButton: false,
      background: 'transparent',
      backdrop: 'rgba(15,23,42,0.6)',
      customClass: { popup: '!bg-transparent !border-none !shadow-none !p-0' },
      html: `
        <div style="background: white; border-radius: 20px; overflow: hidden; font-family: 'Inter', 'Prompt', sans-serif; box-shadow: 0 25px 60px rgba(0,0,0,0.2); text-align: left;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #6366f1 100%); padding: 28px 32px 24px; position: relative; overflow: hidden;">
            <div style="position: absolute; top: -30px; right: -30px; width: 120px; height: 120px; background: rgba(255,255,255,0.08); border-radius: 50%;"></div>
            <div style="position: absolute; bottom: -20px; left: 40px; width: 80px; height: 80px; background: rgba(255,255,255,0.06); border-radius: 50%;"></div>
            <div style="position: relative; z-index: 1; display: flex; align-items: center; gap: 14px;">
              <div style="width: 48px; height: 48px; background: rgba(255,255,255,0.15); border-radius: 14px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2);">
                <svg width="24" height="24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M16 11h2a2 2 0 0 1 2 2v1"/><line x1="19" y1="8" x2="19" y2="14"/></svg>
              </div>
              <div>
                <h2 style="color: white; font-size: 18px; font-weight: 700; margin: 0; letter-spacing: -0.3px;">สร้างสิทธิ์การเข้าใช้งาน</h2>
                <p style="color: rgba(255,255,255,0.75); font-size: 13px; margin: 3px 0 0 0;">${emp.full_name_th}</p>
              </div>
            </div>
          </div>

          <!-- Body -->
          <div style="padding: 24px 28px;">
            
            <!-- Email Section -->
            <div style="margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <label style="font-size: 13px; font-weight: 600; color: #374151; display: flex; align-items: center; gap: 6px;">
                  <svg width="14" height="14" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  อีเมลบริษัท (Company Email)
                </label>
                <label style="display: flex; align-items: center; gap: 5px; font-size: 11.5px; color: #6b7280; cursor: pointer; background: #f3f4f6; padding: 4px 10px; border-radius: 20px; border: 1px solid #e5e7eb; transition: all 0.2s;">
                  <input type="checkbox" id="swal-no-email" style="width: 13px; height: 13px; cursor: pointer; accent-color: #ef4444;"
                    onchange="const emailInput = document.getElementById('swal-input-email'); emailInput.value = this.checked ? '-' : '${suggestedEmail}'; emailInput.disabled = this.checked; emailInput.style.opacity = this.checked ? '0.5' : '1';">
                  ไม่ใช้อีเมล
                </label>
              </div>
              <div style="position: relative;">
                <svg style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); pointer-events: none;" width="16" height="16" fill="none" stroke="#9ca3af" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input id="swal-input-email" type="email" value="${suggestedEmail}" placeholder="เช่น firstname.l${suggestedDomain}"
                  style="width: 100%; height: 44px; padding: 0 14px 0 42px; font-size: 14px; border: 1.5px solid #e5e7eb; border-radius: 10px; outline: none; box-sizing: border-box; color: #111827; background: #fafafa; transition: all 0.2s;"
                  onfocus="this.style.borderColor='#3b82f6'; this.style.boxShadow='0 0 0 3px rgba(59,130,246,0.1)'; this.style.background='white';"
                  onblur="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none'; this.style.background='#fafafa';">
              </div>
              <p style="font-size: 11.5px; color: #9ca3af; margin: 6px 0 0 4px;">* สามารถแก้ไขชื่ออีเมลได้ตามต้องการ</p>
            </div>

            <!-- Role Section -->
            <div style="margin-bottom: 20px;">
              <label style="font-size: 13px; font-weight: 600; color: #374151; display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
                <svg width="14" height="14" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                สิทธิ์การใช้งานระบบ (Role)
              </label>
              <div style="position: relative;">
                <svg style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); pointer-events: none;" width="16" height="16" fill="none" stroke="#9ca3af" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <select id="swal-input-role"
                  style="width: 100%; height: 44px; padding: 0 14px 0 42px; font-size: 14px; border: 1.5px solid #e5e7eb; border-radius: 10px; outline: none; box-sizing: border-box; color: #111827; background: #fafafa; appearance: none; cursor: pointer; transition: all 0.2s;"
                  onfocus="this.style.borderColor='#3b82f6'; this.style.boxShadow='0 0 0 3px rgba(59,130,246,0.1)'; this.style.background='white';"
                  onblur="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none'; this.style.background='#fafafa';">
                  ${roleOptions}
                </select>
                <svg style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); pointer-events: none;" width="16" height="16" fill="none" stroke="#9ca3af" stroke-width="2" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
            </div>

            <!-- Domain Checkbox -->
            <div style="background: #f8faff; border: 1.5px solid #e0e7ff; border-radius: 10px; padding: 12px 16px; margin-bottom: 24px;">
              <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                <input type="checkbox" id="swal-input-domain" checked style="width: 16px; height: 16px; accent-color: #3b82f6; cursor: pointer; flex-shrink: 0;">
                <div>
                  <span style="font-size: 13px; font-weight: 600; color: #1e40af; display: block;">ใช้งาน Login Domain (ASCGGROUP)</span>
                  <span style="font-size: 11.5px; color: #6b7280;">Login ผ่าน Windows Domain ของบริษัท</span>
                </div>
              </label>
            </div>

            <!-- Action Buttons -->
            <div style="display: flex; gap: 10px;">
              <button id="swal-cancel-btn" type="button"
                style="flex: 1; height: 44px; border: 1.5px solid #e5e7eb; background: white; color: #6b7280; font-size: 14px; font-weight: 600; border-radius: 10px; cursor: pointer; transition: all 0.2s;">
                ยกเลิก
              </button>
              <button id="swal-confirm-btn" type="button"
                style="flex: 2; height: 44px; background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; font-size: 14px; font-weight: 700; border: none; border-radius: 10px; cursor: pointer; transition: all 0.2s; letter-spacing: 0.2px; box-shadow: 0 4px 12px rgba(37,99,235,0.35);">
                💾 บันทึกและสร้างสิทธิ์
              </button>
            </div>

            <!-- Validation msg -->
            <div id="swal-validation" style="display: none; margin-top: 10px; background: #fef2f2; color: #dc2626; font-size: 12.5px; padding: 8px 12px; border-radius: 8px; border: 1px solid #fecaca;"></div>
          </div>
        </div>
      `,
      didOpen: () => {
        document.getElementById('swal-cancel-btn').addEventListener('click', () => {
          Swal.close();
        });
        document.getElementById('swal-confirm-btn').addEventListener('click', () => {
          const email = document.getElementById('swal-input-email').value;
          const useDomain = document.getElementById('swal-input-domain').checked;
          const roleId = document.getElementById('swal-input-role').value;
          const validationEl = document.getElementById('swal-validation');
          if (!email) {
            validationEl.innerText = '⚠ กรุณากรอกอีเมล หรือเลือก "ไม่ใช้อีเมล"';
            validationEl.style.display = 'block';
            return;
          }
          if (!roleId) {
            validationEl.innerText = '⚠ กรุณาเลือกสิทธิ์การใช้งาน';
            validationEl.style.display = 'block';
            return;
          }
          validationEl.style.display = 'none';
          Swal.fire({
            title: 'กำลังบันทึกข้อมูล...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
          });
          const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/employees/${emp.id}/grant-access`, {
            method: 'PUT',
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ email, useDomain, roleId })
          }).then(async res => {
            const data = await res.json();
            if (res.ok) {
              setNotifications(prev => ({
                ...prev,
                newEmployees: (prev.newEmployees || []).filter(e => e.id !== emp.id)
              }));
              Swal.fire({ title: 'สำเร็จ!', text: data.message || 'บันทึกอีเมลและสร้างสิทธิ์เรียบร้อยแล้ว', icon: 'success' });
            } else {
              Swal.fire('ผิดพลาด', data.message || 'เกิดข้อผิดพลาดในการบันทึก', 'error');
            }
          }).catch(() => {
            Swal.fire('ผิดพลาด', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้', 'error');
          });
        });
      }
    });
  };

  const handleRevokeAccessFromNotif = async (emp) => {
    setIsNotifOpen(false);
    
    await Swal.fire({
      title: '',
      width: 520,
      padding: '0',
      showCancelButton: false,
      showConfirmButton: false,
      background: 'transparent',
      backdrop: 'rgba(15,23,42,0.6)',
      customClass: { popup: '!bg-transparent !border-none !shadow-none !p-0' },
      html: `
        <div style="background: white; border-radius: 20px; overflow: hidden; font-family: 'Inter', 'Prompt', sans-serif; box-shadow: 0 25px 60px rgba(0,0,0,0.2); text-align: left;">
          
          <!-- Header Red Gradient -->
          <div style="background: linear-gradient(135deg, #991b1b 0%, #dc2626 50%, #f43f5e 100%); padding: 28px 32px 24px; position: relative; overflow: hidden;">
            <div style="position: absolute; top: -30px; right: -30px; width: 120px; height: 120px; background: rgba(255,255,255,0.08); border-radius: 50%;"></div>
            <div style="position: relative; z-index: 1; display: flex; align-items: center; gap: 14px;">
              <div style="width: 48px; height: 48px; background: rgba(255,255,255,0.15); border-radius: 14px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2);">
                <svg width="24" height="24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/></svg>
              </div>
              <div>
                <h2 style="color: white; font-size: 18px; font-weight: 700; margin: 0; letter-spacing: -0.3px;">ถอดสิทธิ์การเข้าใช้งานระบบ</h2>
                <p style="color: rgba(255,255,255,0.85); font-size: 13px; margin: 3px 0 0 0;">${emp.full_name_th} (${emp.employee_code || 'พนักงาน'})</p>
              </div>
            </div>
          </div>

          <!-- Body -->
          <div style="padding: 24px 28px;">
            
            <!-- Employee Detail Card -->
            <div style="background: #fdf2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
              <div style="font-size: 13px; font-weight: 700; color: #991b1b; margin-bottom: 6px;">รายละเอียดการถอดสิทธิ์:</div>
              <div style="font-size: 12.5px; color: #4b5563; space-y: 4px;">
                <div>🏢 สังกัด: <span style="font-weight: 600; color: #111827;">${emp.company_prefix || '-'}</span> | แผนก: <span style="font-weight: 600; color: #111827;">${emp.department_name || 'ทั่วไป'}</span></div>
                <div>💼 ตำแหน่ง: <span style="font-weight: 600; color: #111827;">${emp.position || '-'}</span></div>
                <div>📧 อีเมล: <span style="font-weight: 600; color: #111827;">${emp.email || '-'}</span></div>
              </div>
            </div>

            <!-- Warning Notice -->
            <div style="background: #fff1f2; border-left: 4px solid #e11d48; border-radius: 8px; padding: 12px 14px; margin-bottom: 24px;">
              <div style="font-size: 12px; font-weight: 700; color: #9f1239;">⚠️ ข้อควรระวัง:</div>
              <div style="font-size: 11.5px; color: #be123c; margin-top: 2px;">เมื่อกดถอดสิทธิ์ บัญชีผู้ใช้งานนี้จะไม่สามารถเข้าสู่ระบบหรือเข้าถึงข้อมูลทรัพย์สินบริษัทได้อีกต่อไป</div>
            </div>

            <!-- Action Buttons -->
            <div style="display: flex; gap: 10px;">
              <button id="swal-revoke-cancel" type="button"
                style="flex: 1; height: 44px; border: 1.5px solid #e5e7eb; background: white; color: #6b7280; font-size: 14px; font-weight: 600; border-radius: 10px; cursor: pointer; transition: all 0.2s;">
                ยกเลิก
              </button>
              <button id="swal-revoke-confirm" type="button"
                style="flex: 2; height: 44px; background: linear-gradient(135deg, #dc2626, #991b1b); color: white; font-size: 14px; font-weight: 700; border: none; border-radius: 10px; cursor: pointer; transition: all 0.2s; letter-spacing: 0.2px; box-shadow: 0 4px 12px rgba(220,38,38,0.35);">
                🗑️ ยืนยันถอดสิทธิ์การเข้าใช้งาน
              </button>
            </div>

          </div>
        </div>
      `,
      didOpen: () => {
        document.getElementById('swal-revoke-cancel').addEventListener('click', () => {
          Swal.close();
        });
        document.getElementById('swal-revoke-confirm').addEventListener('click', async () => {
          Swal.fire({
            title: 'กำลังถอดสิทธิ์...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
          });

          try {
            const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/employees/${emp.id}/revoke-access`, {
              method: 'PUT',
              headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' 
              }
            });

            if (res.ok) {
              setNotifications(prev => ({
                ...prev,
                resignedEmployees: (prev.resignedEmployees || []).filter(e => e.id !== emp.id)
              }));
              Swal.fire({ title: 'สำเร็จ!', text: 'ถอดสิทธิ์การเข้าใช้งานเรียบร้อยแล้ว', icon: 'success' });
            } else {
              throw new Error('Server error');
            }
          } catch (error) {
            console.error('Error revoking access:', error);
            Swal.fire('ผิดพลาด', 'เกิดข้อผิดพลาดในการถอดสิทธิ์', 'error');
          }
        });
      }
    });
  };

  const simulateRole = async (roleObj) => {
    try {
      Swal.fire({
        title: 'กำลังสลับสิทธิ์ทดสอบ...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      const baseUrl = getApiBase();
      
      let rolePerms = [];
      try {
        const res = await fetch(`${baseUrl}/api/settings/roles/${roleObj.id}/permissions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (res.ok && data.data) {
          const permRes = await fetch(`${baseUrl}/api/settings/permissions`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const permData = await permRes.json();
          if (permRes.ok && permData.data) {
            const allPerms = permData.data;
            rolePerms = data.data.map(id => {
              const p = allPerms.find(x => x.id === id);
              return p ? p.key_name : null;
            }).filter(Boolean);
          }
        }
      } catch (fetchErr) {
        console.warn('Could not fetch remote permissions list, using fallback:', fetchErr);
      }

      const realRole = userInfo.original_role || userInfo.role || 'Admin';
      const mockUser = {
        ...userInfo,
        role: roleObj.name,
        role_id: roleObj.id,
        permissions: rolePerms,
        original_role: realRole
      };
      
      localStorage.setItem('user_info', JSON.stringify(mockUser));
      localStorage.setItem('mockRole', String(roleObj.id));

      Swal.fire({
        icon: 'success',
        title: 'จำลองสิทธิ์สำเร็จ!',
        text: `สลับสิทธิ์การใช้งานเป็น: ${roleObj.name}`,
        timer: 1200,
        showConfirmButton: false
      }).then(() => {
        window.location.reload();
      });
      
    } catch (e) {
      console.error('Simulate Role Error:', e);
      Swal.fire('ผิดพลาด', 'ไม่สามารถจำลองสิทธิ์ได้', 'error');
    }
  };

  const resetRole = () => {
    const realRole = userInfo.original_role || 'Admin';
    const resetUser = {
      ...userInfo,
      role: realRole,
      role_id: 1,
      permissions: [],
      original_role: undefined
    };
    localStorage.setItem('user_info', JSON.stringify(resetUser));
    localStorage.removeItem('mockRole');
    Swal.fire({
      icon: 'info',
      title: 'คืนค่าสิทธิ์ดั้งเดิม',
      text: `กลับสู่สิทธิ์: ${realRole} เรียบร้อยแล้ว`,
      timer: 1200,
      showConfirmButton: false
    }).then(() => {
      window.location.reload();
    });
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'ออกจากระบบสำเร็จ',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    }).then(() => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
      navigate('/login');
    });
  };

  const hasPermission = (item) => {
    // Admin Mode -> Full Access
    if (userRole === 'Admin') return true;

    // Employee (พนักงานทั่วไป) -> ให้เห็นเฉพาะ หน้าหลัก และ แจ้งปัญหา IT
    if (userRole === 'Employee') {
      return ['/dashboard', '/it-support'].includes(item.path);
    }

    // Manager (หัวหน้างาน) -> ให้เห็นเฉพาะ หน้าหลัก และ แจ้งปัญหา IT
    if (userRole === 'Manager') {
      return ['/dashboard', '/it-support'].includes(item.path);
    }

    // HR Mode
    if (userRole === 'HR') {
      return ['/dashboard', '/it-support', '/employee-list', '/employees/new', '/admin/announcements'].includes(item.path);
    }

    // IT Support Mode
    if (userRole === 'IT Support') {
      return ['/dashboard', '/it-support', '/admin/it-health-check', '/admin/it-support', '/admin/network', '/admin/assets', '/admin/hostings'].includes(item.path);
    }

    if (!item.perm) return true;
    return permissions.includes(item.perm);
  };

  const menuGroups = [
    {
      group: 'ทั่วไป',
      items: [
        { path: '/dashboard', name: 'หน้าหลัก', icon: LayoutDashboard },
        { path: '/it-support', name: 'แจ้งปัญหา IT', icon: ShieldAlert },
      ]
    },
    {
      group: 'จัดการผู้ใช้งานระบบ (Users)',
      items: [
        { path: '/employee-list', name: 'รายการผู้ใช้งานระบบ', icon: Users, perm: 'manage_employees' },
        { path: '/employees/new', name: 'เพิ่มผู้ใช้งานใหม่', icon: UserPlus, perm: 'manage_employees' },
      ]
    },
    {
      group: 'ระบบจัดการส่วนกลาง (Admin)',
      items: [
        { path: '/admin/announcements', name: 'จัดการประกาศ', icon: Megaphone, perm: 'manage_announcements' },
        { path: '/admin/it-health-check', name: 'สถานะระบบ IT (Health Check)', icon: Activity, perm: 'manage_it_support' },
        { path: '/admin/it-support', name: 'ระบบรับแจ้งซ่อม IT', icon: Workflow, perm: 'manage_it_support' },
        { path: '/admin/network', name: 'จัดการเครือข่าย & IP', icon: Network, perm: 'manage_it_support' },
        { path: '/admin/assets', name: 'ทะเบียนทรัพย์สิน', icon: Package, perm: 'manage_assets' },
        { path: '/admin/hostings', name: 'จัดการ Hosting', icon: Server, perm: 'manage_assets' },
      ]
    },
    {
      group: 'ตั้งค่าระบบ',
      items: [
        { path: '/settings', name: 'ตั้งค่าทั่วไป', icon: Settings, perm: 'manage_settings' },
        { path: '/settings/email-templates', name: 'เทมเพลตอีเมล', icon: FileText, perm: 'manage_settings' },
      ]
    }
  ];

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f4f5f7', fontFamily: "'Inter', 'Prompt', system-ui, sans-serif" }}>
      
      {/* --- SIDEBAR --- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: '#ffffff', borderRight: '1px solid #e9ebee', boxShadow: '1px 0 0 0 #f0f2f5' }}
      >
        {/* Logo Area */}
        <div style={{ height: 60, borderBottom: '1px solid #f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', flexShrink: 0 }}>
          <div className="flex items-center gap-2.5">
            <div style={{ background: '#fff7ed', padding: '6px', borderRadius: '10px', border: '1px solid #fde68a' }}>
              <img src={aiaLogo} alt="ASCG Logo" className="h-7 object-contain" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', letterSpacing: '-0.3px', lineHeight: 1.2 }}>ASCG Portal</div>
              <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 500, letterSpacing: '0.04em' }}>HR & IT System</div>
            </div>
          </div>
          <button style={{ color: '#9ca3af', padding: 4, borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer' }} className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* User Area */}
        <div style={{ padding: '12px 14px', borderBottom: '1px solid #f0f2f5', background: '#fafbfc', flexShrink: 0 }}>
          <div className="flex items-center gap-2.5">
            {userInfo.profile_image ? (
              <img src={`${import.meta.env.VITE_API_BASE_URL}${userInfo.profile_image}`} alt="Profile"
                style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid #f89919' }} />
            ) : (
              <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #f89919, #d97c08)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: 14, flexShrink: 0 }}>
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</div>
              <span style={{
                display: 'inline-block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                padding: '2px 7px', borderRadius: 9999, marginTop: 2,
                ...(userRole === 'Admin' ? { background: '#fff3dc', color: '#b45309', border: '1px solid #fde68a' } :
                   userRole === 'HR' ? { background: '#fff7ed', color: '#c2690a', border: '1px solid #fed7aa' } :
                   userRole === 'Manager' ? { background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' } :
                   { background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' })
              }}>
                {userRole}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '10px 10px 16px' }}>
          {menuGroups.map((group, idx) => {
            const groupItems = group.items.filter(item => hasPermission(item));
            if (groupItems.length === 0) return null;

            return (
              <div key={idx} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#b0b7c3', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 10px 5px' }}>
                  {group.group}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {groupItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end
                      style={({ isActive }) => ({
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '7px 10px', borderRadius: 8,
                        fontSize: 13, fontWeight: isActive ? 600 : 500,
                        color: isActive ? '#c2690a' : '#4b5563',
                        background: isActive ? '#fff7ed' : 'transparent',
                        textDecoration: 'none',
                        transition: 'all 0.12s ease',
                      })}
                      className="sidebar-navlink-item"
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon size={16} style={{ color: isActive ? '#f89919' : '#9ca3af', flexShrink: 0, transition: 'color 0.12s' }} />
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
                          {isActive && <div style={{ width: 3, height: 14, background: '#f89919', borderRadius: 99, marginLeft: 'auto', flexShrink: 0 }} />}
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>
      </aside>

      {/* --- Overlay for Mobile --- */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* --- MAIN WRAPPER --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* TOP NAVBAR */}
        <header className="flex items-center justify-between px-5 sm:px-7 z-30" style={{ height: 60, background: '#ffffff', borderBottom: '1px solid #eef0f4', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-4">
            <button 
              className="text-slate-500 hover:text-[#f89919] hover:bg-slate-100 p-2 rounded-lg transition-colors md:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            
            {/* 🛠️ Test Roles Switcher */}
            {(userInfo.original_role === 'Admin' || userInfo.role === 'Admin' || String(userInfo.role_id) === '1' || Boolean(userInfo.original_role)) && (
              <div className="flex items-center gap-2 text-xs bg-slate-100 p-1.5 rounded-xl border border-slate-200 max-w-[60vw] sm:max-w-none">
                <span className="font-semibold text-slate-500 px-2 flex items-center gap-1">
                  <span>🎭</span> จำลองสิทธิ์:
                </span>
                <div className="flex items-center gap-1 overflow-x-auto max-w-[420px] custom-scrollbar pb-0.5">
                  {simulationRoles.filter(r => r.name !== 'Employee' && r.name !== 'Manager').map(r => (
                    <button 
                      key={r.id}
                      onClick={() => simulateRole(r)} 
                      className={`whitespace-nowrap px-2.5 py-1 rounded-lg transition-all ${userRole === r.name ? 'bg-[#f89919] text-white shadow-sm font-bold' : 'text-slate-600 hover:bg-white hover:text-[#f89919]'}`}
                    >
                      {r.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* 🔔 Interactive Notification Dropdown */}
            <div ref={notifRef} className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 text-slate-400 hover:text-[#f89919] hover:bg-slate-100 rounded-full transition-colors"
                title="การแจ้งเตือนระบบ"
              >
                <Bell size={20} />
                {totalNotifs > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs ring-2 ring-white animate-pulse">
                    {totalNotifs}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden text-xs">
                  <div className="p-3.5 bg-slate-900 text-white font-bold flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell size={16} className="text-[#f89919]" />
                      <span>การแจ้งเตือนระบบ ({totalNotifs})</span>
                    </div>
                    <button onClick={() => setIsNotifOpen(false)} className="text-slate-400 hover:text-white p-1">✕</button>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {totalNotifs === 0 ? (
                      <div className="p-6 text-center text-slate-400">
                        <CheckCircle size={28} className="mx-auto mb-2 text-emerald-500 opacity-60" />
                        <span>ไม่มีรายการแจ้งเตือนค้างอยู่</span>
                      </div>
                    ) : (
                      <>
                        {/* 1. New Employees Notification */}
                        {(notifications?.newEmployees || []).map(emp => (
                          <div 
                            key={`new-emp-${emp.id}`}
                            onClick={() => handleGrantAccessFromNotif(emp)}
                            className="p-3 hover:bg-emerald-50/60 cursor-pointer flex items-start gap-3 transition-colors group border-l-4 border-emerald-500"
                          >
                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                              <UserPlus size={16} />
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-slate-900 flex items-center justify-between">
                                <span>พนักงานเข้าใหม่: {emp.full_name_th}</span>
                                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">เข้าใหม่</span>
                              </div>
                              <div className="text-slate-600 font-semibold text-[11px] mt-0.5">
                                {emp.company_prefix} • {emp.position || 'พนักงานใหม่'}
                              </div>
                              <div className="text-[#f89919] font-bold text-[11px] mt-1 flex items-center gap-1">
                                ⚡ คลิกเพื่อสร้างสิทธิ์และบันทึกอีเมล →
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* 2. Resigned Employees Notification */}
                        {(notifications?.resignedEmployees || []).map(emp => (
                          <div 
                            key={`resigned-emp-${emp.id}`}
                            onClick={() => handleRevokeAccessFromNotif(emp)}
                            className="p-3 hover:bg-rose-50/60 cursor-pointer flex items-start gap-3 transition-colors group border-l-4 border-rose-500"
                          >
                            <div className="p-2 bg-rose-100 text-rose-600 rounded-xl shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                              <UserMinus size={16} />
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-slate-900 flex items-center justify-between">
                                <span>พนักงานพ้นสภาพ: {emp.full_name_th}</span>
                                <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full font-bold">พ้นสภาพ</span>
                              </div>
                              <div className="text-slate-600 font-semibold text-[11px] mt-0.5">
                                {emp.company_prefix} • ลาออก: {emp.resignation_date ? new Date(emp.resignation_date).toLocaleDateString('th-TH') : '-'}
                              </div>
                              <div className="text-rose-600 font-bold text-[11px] mt-1 flex items-center gap-1">
                                🗑️ คลิกเพื่อถอดสิทธิ์และเรียกคืนทรัพย์สิน →
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* 3. IT Helpdesk Pending Tickets */}
                        {(notifications?.pendingTickets || []).map(t => (
                          <div 
                            key={`ticket-${t.id}`}
                            onClick={() => { setIsNotifOpen(false); navigate('/admin/it-support'); }}
                            className="p-3 hover:bg-amber-50/60 cursor-pointer flex items-start gap-3 transition-colors border-l-4 border-amber-500"
                          >
                            <div className="p-2 bg-amber-100 text-amber-600 rounded-xl shrink-0 mt-0.5">
                              <ShieldAlert size={16} />
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-slate-900">แจ้งซ่อม IT: {t.ticket_no || 'Helpdesk'}</div>
                              <div className="text-slate-600 font-semibold text-[11px]">{t.name} • {t.category}</div>
                              <div className={`font-bold text-[11px] mt-0.5 ${t.status === 'กำลังดำเนินการ' ? 'text-indigo-600' : 'text-amber-600'}`}>
                                {t.status === 'กำลังดำเนินการ' ? '🛠️ กำลังดำเนินการ' : '⏳ รอรับเรื่อง'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-colors text-sm font-medium border border-transparent hover:border-rose-200"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </button>
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto custom-scrollbar" style={{ background: '#f4f5f7', padding: '24px 24px 32px' }}>
          <Outlet context={{ userRole, userName }} />
        </main>
        
      </div>
    </div>
  );
}
