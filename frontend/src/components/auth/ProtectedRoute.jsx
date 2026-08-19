import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ children, requiredPermission }) {
  // ตรวจสอบว่ามี Token หรือไม่
  const token = localStorage.getItem('auth_token');
  let user = {};
  try {
    const stored = localStorage.getItem('user_info');
    if (stored && stored !== 'undefined' && stored !== 'null') {
      user = JSON.parse(stored);
    }
  } catch (e) {
    user = {};
  }
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ตรวจสอบ Permission
  if (requiredPermission) {
    // กำหนดให้ Admin เข้าได้ทุกหน้า (God Mode) หรือผ่านตาม Permission
    if (user.role === 'Admin') return children ? children : <Outlet />;

    const permissions = user.permissions || [];
    if (!permissions.includes(requiredPermission)) {
      return <Navigate to="/403" replace />;
    }
  }

  return children ? children : <Outlet />;
}