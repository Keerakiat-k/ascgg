import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AddEmployeePage from './pages/AddEmployeePage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import EmployeeListPage from './pages/EmployeeListPage';
import EditEmployeePage from './pages/EditEmployeePage';
import AnnouncementPage from './pages/AnnouncementPage';
import AddAnnouncementPage from './pages/AddAnnouncementPage';
import ITSupportPage from './pages/ITSupportPage';
import ITSupportAdminPage from './pages/ITSupportAdminPage';
import SystemSettingsPage from './pages/SystemSettingsPage';
import AdminLayout from './components/layout/AdminLayout';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* หน้าแรก (ข่าวสาร) */}
        <Route path="/" element={<AnnouncementPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* 🌟 Layout สำหรับหน้าที่ต้อง Login (มี Sidebar & Navbar) 🌟 */}
        <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/employee-list" element={<EmployeeListPage />} />
          <Route path="/employees/new" element={<AddEmployeePage />} />
          <Route path="/edit-employee/:id" element={<EditEmployeePage />} />
          <Route path="/it-support" element={<ITSupportPage />} />
          <Route path="/admin/it-support" element={<ITSupportAdminPage />} />
          <Route path="/admin/announcements/new" element={<AddAnnouncementPage />} />
          <Route path="/settings" element={<SystemSettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}