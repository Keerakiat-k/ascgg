import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, FileText, Megaphone, Image as ImageIcon } from 'lucide-react';
import Swal from 'sweetalert2';

export default function AddAnnouncementPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'ข่าวสาร',
    content: ''
  });
  const [coverImage, setCoverImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire('ขนาดไฟล์เกิน', 'กรุณาอัปโหลดรูปภาพขนาดไม่เกิน 5MB', 'warning');
        e.target.value = null;
        return;
      }
      setCoverImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      Swal.fire('ข้อมูลไม่ครบ', 'กรุณากรอกหัวข้อและเนื้อหาประกาศ', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('type', formData.type);
      submitData.append('content', formData.content);
      if (coverImage) {
        submitData.append('coverImage', coverImage);
      }

      const response = await fetch('http://localhost:5000/api/announcements', {
        method: 'POST',
        body: submitData
      });
      
      const result = await response.json();
      
      if (response.ok && result.status === 'success') {
        Swal.fire('สำเร็จ', 'บันทึกประกาศเรียบร้อยแล้ว', 'success').then(() => {
          navigate('/dashboard'); 
        });
      } else {
        throw new Error(result.message || 'ไม่สามารถบันทึกได้');
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire('ผิดพลาด', 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600"
            title="กลับไปหน้าหลัก"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Megaphone className="text-indigo-600" /> เพิ่มประกาศใหม่
            </h1>
            <p className="text-slate-500 text-sm mt-1">สร้างประกาศข่าวสาร กิจกรรม หรือเรื่องสำคัญ แจ้งพนักงานในองค์กร</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">ภาพหน้าปก (Cover Image)</label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors">
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img src={imagePreview} alt="Preview" className="max-h-48 rounded-lg shadow-sm" />
                      <button 
                        type="button"
                        onClick={() => { setCoverImage(null); setImagePreview(null); }}
                        className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center text-slate-500">
                      <ImageIcon size={32} className="mb-2 text-slate-400" />
                      <span className="font-medium text-indigo-600">คลิกเพื่ออัปโหลดรูปภาพ</span>
                      <span className="text-xs mt-1">รองรับ JPG, PNG (ขนาดไม่เกิน 5MB)</span>
                      <input 
                        type="file" 
                        accept="image/jpeg, image/png, image/webp" 
                        onChange={handleImageChange}
                        className="hidden" 
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">หัวข้อประกาศ <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="เช่น เชิญร่วมงานเลี้ยงปีใหม่..." 
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">ประเภทประกาศ</label>
                <select 
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
                >
                  <option value="ข่าวสาร">📰 ข่าวสารทั่วไป</option>
                  <option value="กิจกรรม">🎉 กิจกรรม</option>
                  <option value="ประกาศสำคัญ">📢 ประกาศสำคัญ</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">รายละเอียด <span className="text-red-500">*</span></label>
                <textarea 
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows="6"
                  placeholder="รายละเอียดของประกาศ..."
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-y"
                  required
                ></textarea>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                disabled={isSubmitting}
              >
                ยกเลิก
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกประกาศ'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
