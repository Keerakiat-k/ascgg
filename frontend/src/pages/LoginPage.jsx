import { Users, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import logoImg from '../assets/logo.png';

export default function LoginPage() {
  const navigate = useNavigate(); // 🌟 เพิ่ม Hook สำหรับการเปลี่ยนหน้า

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
       <div className="flex justify-center">
          <img 
            src={logoImg} 
            alt="ASCG Group Logo" 
            className="h-32 w-auto object-contain drop-shadow-sm" // ปรับเป็น h-32 (ค่ามาตรฐานของ Tailwind)
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          ASCG Group - Employee Portal
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          กรุณาเข้าสู่ระบบด้วยบัญชีอีเมลองค์กรของคุณ
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100 flex flex-col gap-6">
          
          {/* ฟอร์มเข้าสู่ระบบ */}
          <LoginForm />

          {/* 🌟 เส้นคั่นแบ่งส่วน 🌟 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-400 font-medium">หรือ</span>
            </div>
          </div>

          {/* 🌟 ปุ่มกลับหน้าแรก 🌟 */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border border-slate-200 hover:border-slate-300"
          >
            <ArrowLeft size={16} className="text-slate-500" />
            กลับหน้าข่าวสารองค์กร
          </button>
          
        </div>
      </div>
    </div>
  );
}