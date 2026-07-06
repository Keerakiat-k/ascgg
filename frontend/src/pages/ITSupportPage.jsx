import { useState } from 'react';
import { ArrowLeft, Wrench, Send, Monitor, Wifi, Database, Smartphone } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom'; // 🌟 เพิ่ม useLocation
import Swal from 'sweetalert2';

export default function ITSupportPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const isFromAdmin = location.state?.fromAdmin;
    const returnPath = isFromAdmin ? '/admin/it-support' : '/';
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        department: '',
        category: 'อุปกรณ์คอมพิวเตอร์ (Hardware)',
        urgency: 'ปานกลาง',
        description: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 🌟 1. ประกาศตัวแปร response เพื่อรับค่าจากการยิง API
      const response = await fetch('http://localhost:5000/api/it-support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      // 🌟 2. แปลงข้อมูลที่ได้กลับมาให้อ่านง่าย
      const result = await response.json();

      // 🌟 3. เช็คสถานะ response ที่ประกาศไว้ข้างบน
      if (response.ok && result.status === 'success') {
        Swal.fire('ส่งเรื่องสำเร็จ!', `รหัสอ้างอิงของคุณคือ: ${result.ticket_no}`, 'success')
          .then(() => navigate(returnPath)); // (หรือ navigate('/') ถ้าโค้ดเดิมคุณเป็นแบบนั้น)
      } else {
        // กรณี API ตอบกลับมาว่าไม่สำเร็จ
        Swal.fire('ผิดพลาด', result.message || 'ไม่สามารถส่งข้อมูลได้', 'error');
      }

    } catch (error) {
      console.error('Submit Error:', error);
      Swal.fire('ผิดพลาด', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', 'error');
    } finally {
      setIsLoading(false);
    }
  };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Wrench className="text-indigo-600" size={24} />
                        แจ้งปัญหา IT (IT Helpdesk)
                    </h1>
                    <p className="text-slate-500 mt-1">กรอกรายละเอียดเพื่อแจ้งปัญหาให้ทีม IT เข้าตรวจสอบและแก้ไข</p>
                </div>
            </div>

            {/* --- MAIN FORM --- */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

                    <div className="bg-slate-900 px-8 py-6 text-white">
                        <h2 className="text-xl font-bold mb-2">เปิดทิกเก็ตแจ้งปัญหาใหม่</h2>
                        <p className="text-slate-300 text-sm">กรุณากรอกรายละเอียดให้ครบถ้วน เพื่อความรวดเร็วในการตรวจสอบและแก้ไขปัญหา</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8">
                        {/* ข้อมูลผู้แจ้ง */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">ชื่อ-นามสกุล (ผู้แจ้ง) *</label>
                                <input
                                    type="text" required name="name" value={formData.name} onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="เช่น สมชาย ใจดี"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">แผนก / ฝ่าย *</label>
                                <input
                                    type="text" required name="department" value={formData.department} onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="เช่น บัญชี"
                                />
                            </div>
                        </div>

                        <hr className="border-slate-100 mb-8" />

                        {/* รายละเอียดปัญหา */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">หมวดหมู่ปัญหา *</label>
                                <div className="relative">
                                    <select
                                        required name="category" value={formData.category} onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none bg-white"
                                    >
                                        <option value="อุปกรณ์คอมพิวเตอร์ (Hardware)">อุปกรณ์คอมพิวเตอร์ (Hardware)</option>
                                        <option value="โปรแกรมและซอฟต์แวร์ (Software)">โปรแกรมและซอฟต์แวร์ (Software)</option>
                                        <option value="อินเทอร์เน็ตและเครือข่าย (Network)">อินเทอร์เน็ตและเครือข่าย (Network)</option>
                                        <option value="ระบบฐานข้อมูล (Database/ERP)">ระบบฐานข้อมูล (Database/ERP)</option>
                                        <option value="อื่นๆ (Others)">อื่นๆ (Others)</option>
                                    </select>
                                    <Monitor className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">ระดับความเร่งด่วน *</label>
                                <select
                                    required name="urgency" value={formData.urgency} onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                                >
                                    <option value="ต่ำ (ไม่กระทบการทำงาน)">🟢 ต่ำ (ไม่กระทบการทำงานหลัก)</option>
                                    <option value="ปานกลาง">🟡 ปานกลาง (พอทำงานอื่นทดแทนได้)</option>
                                    <option value="สูง (ทำงานต่อไม่ได้)">🔴 สูง (ทำงานต่อไม่ได้เลย)</option>
                                </select>
                            </div>
                        </div>

                        <div className="mb-8">
                            <label className="block text-sm font-medium text-slate-700 mb-2">รายละเอียดปัญหาที่พบ (ระบุให้ชัดเจน) *</label>
                            <textarea
                                required name="description" value={formData.description} onChange={handleChange} rows="5"
                                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                                placeholder="เช่น เปิดคอมพิวเตอร์ไม่ติด มีเสียงร้องตี๊ดๆ 3 ครั้ง, ปรินเตอร์ชั้น 2 พิมพ์ไม่ออก..."
                            ></textarea>
                        </div>

                        {/* ปุ่ม Submit */}
                        <div className="flex justify-end gap-3">
                            <button 
                type="button" onClick={() => navigate(returnPath)} // 🌟 เปลี่ยนเป็น returnPath
                className="px-6 py-2.5 rounded-lg text-slate-600 font-medium hover:bg-slate-100 transition-colors"
              >
                ยกเลิก
              </button>
                            <button
                                type="submit" disabled={isLoading}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-70"
                            >
                                {isLoading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-white border-r-white border-b-transparent border-l-transparent"></div>
                                ) : (
                                    <Send size={18} />
                                )}
                                {isLoading ? 'กำลังส่งข้อมูล...' : 'ส่งแจ้งปัญหา'}
                            </button>
                        </div>
                    </form>

            </div>
        </div>
    );
}