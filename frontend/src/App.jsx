import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AddEmployeePage from './pages/AddEmployeePage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import EmployeeListPage from './pages/EmployeeListPage';
import EditEmployeePage from './pages/EditEmployeePage';
import AnnouncementPage from './pages/AnnouncementPage';
import ITSupportPage from './pages/ITSupportPage';
import ITSupportAdminPage from './pages/ITSupportAdminPage'


export default function App() {
  return (
    <Router>
      <Routes>
        {/* หน้าแรก (ข่าวสาร) */}
        <Route path="/" element={<AnnouncementPage />} />

        {/* 🌟 หน้าแจ้งปัญหา IT 🌟 */}
        <Route path="/it-support" element={<ITSupportPage />} />

        {/* 🌟  หน้า Login ย้ายมาที่นี่ */}
        <Route path="/login" element={<LoginPage />} />

        {/* 🌟  หน้าอื่นๆ ที่ต้อง Login ก่อนถึงจะเข้าได้ (หุ้มด้วย ProtectedRoute) */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/employee-list" element={<ProtectedRoute><EmployeeListPage /></ProtectedRoute>} />
        <Route path="/admin/it-support" element={<ITSupportAdminPage />} />
      </Routes>
    </Router>
  );
}