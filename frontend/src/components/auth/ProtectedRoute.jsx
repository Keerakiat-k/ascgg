import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  // ตรวจสอบว่ามี Token หรือไม่ (จำลองสถานะการล็อคอิน)
  const token = localStorage.getItem('auth_token');
  
  // ถ้าไม่มี Token ให้เด้งกลับไปหน้า Login และแทนที่ History (replace) เพื่อไม่ให้กด Back กลับมาได้
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ถ้ามี Token ให้อนุญาตเข้าสู่หน้า Component นั้นๆ ได้
  return children;
}