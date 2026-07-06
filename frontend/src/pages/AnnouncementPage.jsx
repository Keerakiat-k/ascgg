import { useState, useEffect } from 'react';
import { Megaphone, Calendar, Info, Clock, LogIn, ArrowRight, Headset } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png'; // โลโก้ของคุณ

export default function AnnouncementPage() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [filter, setFilter] = useState('ทั้งหมด');
  const [isLoading, setIsLoading] = useState(true);

  // ดึงข้อมูล (จำลอง หรือดึงจาก API จริง)
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/announcements');
        const result = await response.json();
        if (response.ok && result.status === 'success') {
          setAnnouncements(result.data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  // ดีไซน์ Badge แบบเรียบหรู ไม่ใช้สีสดเกินไป (Pastel/Muted tones)
  const getBadgeStyle = (type) => {
    switch (type) {
      case 'ประกาศสำคัญ': 
        return { color: 'bg-orange-50 text-orange-700 border-orange-100', icon: <Megaphone size={14} /> };
      case 'กิจกรรม': 
        return { color: 'bg-indigo-50 text-indigo-700 border-indigo-100', icon: <Calendar size={14} /> };
      default: 
        return { color: 'bg-slate-50 text-slate-700 border-slate-200', icon: <Info size={14} /> };
    }
  };

  const filteredData = filter === 'ทั้งหมด' 
    ? announcements 
    : announcements.filter(item => item.type === filter);

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans">
      
{/* --- NAVBAR --- */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={logo} alt="ASCG Group Logo" className="h-8 w-auto object-contain" />
            <span className="text-lg font-bold text-slate-900 tracking-tight">ASCG Group</span>
          </div>

          {/* 🌟 กลุ่มปุ่มเมนูด้านขวา 🌟 */}
          <div className="flex items-center gap-3">
            {/* ปุ่มแจ้งปัญหา IT (สไตล์ Outline) */}
            <button 
              onClick={() => navigate('/it-support')}
              className="hidden sm:flex items-center gap-2 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <Headset size={16} className="text-indigo-600" />
              แจ้งปัญหา IT
            </button>

            
            <button 
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <LogIn size={16} />
              เข้าสู่ระบบ
            </button>
          </div>
        </div>
      </nav>

      {/* --- HERO & FILTER SECTION --- */}
      {/* เน้น Whitespace มหาศาล จัดให้อยู่ตรงกลาง (Human-centered) */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            ข่าวสารและกิจกรรมองค์กร
          </h1>
          <p className="text-lg text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            ติดตามอัปเดตประกาศสำคัญ นโยบายใหม่ และกิจกรรมต่างๆ ภายใน ASCG Group เพื่อให้คุณไม่พลาดทุกความเคลื่อนไหว
          </p>

          {/* Filter แบบ Minimal Tabs */}
          <div className="inline-flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            {['ทั้งหมด', 'ประกาศสำคัญ', 'กิจกรรม', 'ข่าวสาร'].map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filter === type 
                    ? 'bg-white shadow-sm text-slate-900 ring-1 ring-slate-900/5' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT (CARD GRID) --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-slate-900 border-r-slate-900 border-b-transparent border-l-transparent mb-4"></div>
            <p className="text-sm font-medium">กำลังโหลดข้อมูล...</p>
          </div>
        ) : filteredData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredData.map((item) => (
              // Card แบบ Pro: Border บางๆ, Shadow อ่อนมาก, Border-radius พอดี
              <article 
                key={item.id} 
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col group cursor-pointer"
              >
                {/* Image Placeholder แบบมินิมอล */}
                <div className="aspect-[16/9] bg-slate-100 flex items-center justify-center relative overflow-hidden">
                  {item.cover_image ? (
                    <img src={`http://localhost:5000/uploads/announcements/${item.cover_image}`} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
                  ) : (
                    <Megaphone size={40} className="text-slate-300 transition-transform duration-500 group-hover:scale-110" />
                  )}
                  {/* Badge */}
                  <div className={`absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border backdrop-blur-md bg-white/90 ${getBadgeStyle(item.type).color}`}>
                    {getBadgeStyle(item.type).icon} {item.type}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                    <Clock size={12} />
                    {new Date(item.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-slate-500 text-sm flex-1 line-clamp-3 leading-relaxed mb-6">
                    {item.content}
                  </p>

                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center">
                    <span className="text-indigo-600 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                      อ่านต่อ <ArrowRight size={16} />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center max-w-2xl mx-auto">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <Megaphone size={24} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">ยังไม่มีประกาศในหมวดหมู่นี้</h3>
            <p className="text-slate-500 mt-2 text-sm">ประกาศและข่าวสารใหม่ๆ จะแสดงที่นี่เมื่อมีการอัปเดต</p>
          </div>
        )}
      </div>
    </div>
  );
}