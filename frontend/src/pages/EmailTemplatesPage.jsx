import { useState, useEffect } from 'react';
import { Mail, Megaphone, Save, Info } from 'lucide-react';
import Swal from 'sweetalert2';

export default function EmailTemplatesPage() {
  const [activeTab, setActiveTab] = useState('welcome'); // 'welcome' or 'announcement'
  const [settings, setSettings] = useState({
    IT: null,
    HR: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(import.meta.env.VITE_API_BASE_URL + '/api/settings/email');
      const data = await res.json();
      if (data.status === 'success') {
        setSettings({
          IT: data.data.IT || { type: 'IT', announcement_template: '' },
          HR: data.data.HR || { type: 'HR', welcome_template: '' }
        });
      }
    } catch (error) {
      console.error('Error fetching email settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateChange = (e) => {
    const { name, value } = e.target;
    if (activeTab === 'welcome') {
      setSettings(prev => ({
        ...prev,
        HR: { ...prev.HR, [name]: value }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        IT: { ...prev.IT, [name]: value }
      }));
    }
  };

  const handleSave = async () => {
    try {
      const typeToSave = activeTab === 'welcome' ? 'HR' : 'IT';
      const dataToSave = settings[typeToSave];

      const res = await fetch(import.meta.env.VITE_API_BASE_URL + '/api/settings/email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave)
      });
      
      const data = await res.json();
      if (data.status === 'success') {
        Swal.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          text: 'บันทึกเทมเพลตอีเมลเรียบร้อยแล้ว',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      Swal.fire('ข้อผิดพลาด', error.message || 'ไม่สามารถบันทึกได้', 'error');
    }
  };

  const getPreviewHtml = () => {
    let template = '';
    if (activeTab === 'welcome') {
      template = settings.HR?.welcome_template || '<div style="color: #64748b; text-align: center; padding: 20px;">ไม่มีข้อมูลเทมเพลต (จะใช้ค่าเริ่มต้นของระบบ)</div>';
      return template
        .replace(/{{first_name}}/g, 'สมชาย')
        .replace(/{{last_name}}/g, 'ใจดี')
        .replace(/{{employee_code}}/g, 'EMP001')
        .replace(/{{position}}/g, 'Software Developer')
        .replace(/{{department}}/g, 'IT')
        .replace(/{{company}}/g, 'ASCG Co., Ltd.')
        .replace(/{{email}}/g, 'somchai@ascggroup.com')
        .replace(/{{start_date}}/g, '15/07/2569');
    } else {
      template = settings.IT?.announcement_template || '<div style="color: #64748b; text-align: center; padding: 20px;">ไม่มีข้อมูลเทมเพลต (จะใช้ค่าเริ่มต้นของระบบ)</div>';
      const imgHtml = `<div style="text-align: center; margin-bottom: 20px;"><div style="background: #e2e8f0; color: #64748b; padding: 40px; border-radius: 8px; border: 2px dashed #cbd5e1;">[ รูปภาพหน้าปกจะแสดงตรงนี้ ]</div></div>`;
      return template
        .replace(/{{title}}/g, 'ประกาศปรับปรุงระบบเซิร์ฟเวอร์ประจำเดือน')
        .replace(/{{content}}/g, 'เรียน ทีมงานที่เกี่ยวข้องทุกท่าน,\n\nขอแจ้งให้ทราบว่าระบบจะมีการปิดปรับปรุงในคืนนี้ เวลา 00:00 - 02:00 น. \nจึงขออภัยในความไม่สะดวกมา ณ ที่นี้')
        .replace(/{{cover_image}}/g, imgHtml)
        .replace(/{{created_at}}/g, '14/07/2569');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64 text-slate-500">กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">เทมเพลตอีเมล</h1>
          <p className="text-slate-500 mt-1">จัดการรูปแบบอีเมลอัตโนมัติที่ส่งจากระบบ</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('welcome')}
            className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm transition-colors whitespace-nowrap ${
              activeTab === 'welcome' ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Mail size={18} /> แจ้งพนักงานใหม่ (HR)
          </button>
          <button
            onClick={() => setActiveTab('announcement')}
            className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm transition-colors whitespace-nowrap ${
              activeTab === 'announcement' ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Megaphone size={18} /> ประกาศองค์กร (IT)
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left side: Editor */}
            <div>
              {activeTab === 'welcome' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">เทมเพลตอีเมลต้อนรับพนักงานใหม่ (HTML / Text)</label>
                    <textarea 
                      name="welcome_template"
                      value={settings.HR?.welcome_template || ''}
                      onChange={handleTemplateChange}
                      rows={18}
                      className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm font-mono text-slate-800 bg-slate-50"
                      placeholder="วางโค้ด HTML ของเทมเพลตที่นี่... หากปล่อยว่างระบบจะใช้ค่าเริ่มต้น"
                    ></textarea>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex gap-3 items-start">
                    <Info className="text-indigo-600 shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="text-sm font-semibold text-indigo-900 mb-2">ตัวแปรที่ใช้งานได้:</p>
                      <div className="flex flex-wrap gap-2 text-xs font-mono text-indigo-700">
                        <span className="bg-white px-2 py-1 rounded border border-indigo-200 shadow-sm">{`{{first_name}}`}</span>
                        <span className="bg-white px-2 py-1 rounded border border-indigo-200 shadow-sm">{`{{last_name}}`}</span>
                        <span className="bg-white px-2 py-1 rounded border border-indigo-200 shadow-sm">{`{{employee_code}}`}</span>
                        <span className="bg-white px-2 py-1 rounded border border-indigo-200 shadow-sm">{`{{position}}`}</span>
                        <span className="bg-white px-2 py-1 rounded border border-indigo-200 shadow-sm">{`{{department}}`}</span>
                        <span className="bg-white px-2 py-1 rounded border border-indigo-200 shadow-sm">{`{{company}}`}</span>
                        <span className="bg-white px-2 py-1 rounded border border-indigo-200 shadow-sm">{`{{email}}`}</span>
                        <span className="bg-white px-2 py-1 rounded border border-indigo-200 shadow-sm">{`{{start_date}}`}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">เทมเพลตการส่งประกาศ (HTML / Text)</label>
                    <textarea 
                      name="announcement_template"
                      value={settings.IT?.announcement_template || ''}
                      onChange={handleTemplateChange}
                      rows={18}
                      className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm font-mono text-slate-800 bg-slate-50"
                      placeholder="วางโค้ด HTML ของเทมเพลตที่นี่... หากปล่อยว่างระบบจะใช้ค่าเริ่มต้น"
                    ></textarea>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex gap-3 items-start">
                    <Info className="text-indigo-600 shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="text-sm font-semibold text-indigo-900 mb-2">ตัวแปรที่ใช้งานได้:</p>
                      <div className="flex flex-wrap gap-2 text-xs font-mono text-indigo-700">
                        <span className="bg-white px-2 py-1 rounded border border-indigo-200 shadow-sm">{`{{title}}`}</span>
                        <span className="bg-white px-2 py-1 rounded border border-indigo-200 shadow-sm">{`{{cover_image}}`}</span>
                        <span className="bg-white px-2 py-1 rounded border border-indigo-200 shadow-sm">{`{{content}}`}</span>
                        <span className="bg-white px-2 py-1 rounded border border-indigo-200 shadow-sm">{`{{created_at}}`}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right side: Preview */}
            <div className="flex flex-col">
              <label className="block text-sm font-semibold text-slate-700 mb-2">ตัวอย่างการแสดงผล (Preview)</label>
              <div className="flex-1 w-full border border-slate-300 rounded-xl bg-white relative shadow-inner overflow-hidden flex flex-col min-h-[500px]">
                {/* Browser-like header */}
                <div className="bg-slate-100 border-b border-slate-200 px-4 py-2.5 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="ml-4 bg-white px-3 py-1 text-xs text-slate-500 rounded-md shadow-sm border border-slate-200 flex-1 truncate">
                    Preview: {activeTab === 'welcome' ? 'Welcome Email' : 'Announcement Email'}
                  </div>
                </div>
                {/* Email Body */}
                <div className="p-6 bg-slate-50 flex-1 overflow-y-auto">
                  <div className="bg-white rounded shadow-sm border border-slate-200 p-6 mx-auto max-w-2xl" 
                       dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end pt-6 border-t border-slate-100">
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition-colors"
            >
              <Save size={18} /> บันทึกเทมเพลต
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
