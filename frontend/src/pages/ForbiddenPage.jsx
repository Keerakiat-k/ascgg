import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-slate-200/50 max-w-md w-full text-center border border-slate-100 relative overflow-hidden">
        {/* Background Decorative */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-orange-500"></div>
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-50 rounded-full blur-2xl opacity-60"></div>
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-orange-50 rounded-full blur-2xl opacity-60"></div>

        <div className="relative">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-red-200">
            <ShieldAlert size={40} className="text-red-500" />
          </div>
          
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">403 Forbidden</h1>
          <p className="text-slate-600 mb-8 leading-relaxed">
            ขออภัยครับ คุณไม่มีสิทธิ์เข้าถึงหน้านี้ <br/>
            <span className="text-sm text-slate-500">กรุณาติดต่อผู้ดูแลระบบหากคุณคิดว่านี่คือข้อผิดพลาด</span>
          </p>

          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-6 rounded-xl transition-all shadow-md shadow-slate-900/20 hover:shadow-lg active:scale-[0.98]"
          >
            <ArrowLeft size={18} />
            กลับสู่หน้าแดชบอร์ด
          </button>
        </div>
      </div>
    </div>
  );
}
