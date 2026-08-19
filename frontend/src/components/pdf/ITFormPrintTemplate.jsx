import React, { forwardRef } from 'react';
import { COMPANY_EMAIL_CONFIGS, generatePassword, getPhoneticThai } from '../../utils/companyEmailConfig';
import aiaLogo from '../../assets/AIA.png'; // Fallback

const ITFormPrintTemplate = forwardRef(({ employee, printDate }, ref) => {
  if (!employee) return <div ref={ref} style={{ display: 'none' }}></div>;

  const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
  const mockRole = localStorage.getItem('mockRole');
  const isAdmin = String(userInfo.role_id) === '1' || mockRole === '1';

  // แปลงวันที่ให้อยู่ในรูปแบบ dd/mm/yyyy
  const formattedDate = printDate ? new Date(printDate).toLocaleDateString('th-TH', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  }) : new Date().toLocaleDateString('th-TH', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
  // แยกชื่อจริง-นามสกุล โดยดึงจากฟิลด์แยก หรือ full_name
  const firstNameTh = employee.first_name_th || (employee.full_name_th || '').split(' ')[0] || '';
  const lastNameTh = employee.last_name_th || (employee.full_name_th || '').split(' ').slice(1).join(' ') || '';

  const firstNameEn = employee.first_name_en || (employee.full_name_en || '').split(' ')[0] || '';
  const lastNameEn = employee.last_name_en || (employee.full_name_en || '').split(' ').slice(1).join(' ') || '';

  // ดึง Prefix (คำนำหน้า) จากชื่อภาษาไทยแบบง่าย (ถ้ามีนาย นาง นางสาว)
  let titleTh = employee.title_th || '';
  let titleEn = employee.title_en || '';
  if (!titleTh && firstNameTh.startsWith('นาย')) { titleTh = 'นาย'; }
  else if (!titleTh && firstNameTh.startsWith('นางสาว')) { titleTh = 'นางสาว'; }
  else if (!titleTh && firstNameTh.startsWith('นาง')) { titleTh = 'นาง'; }

  // ตัดคำนำหน้าออกจากชื่อ
  const cleanFirstNameTh = firstNameTh.replace(/^(นาย|นางสาว|นาง)/, '');

  // ดึงข้อมูลบริษัท
  const compConfig = COMPANY_EMAIL_CONFIGS[employee.company_prefix] || COMPANY_EMAIL_CONFIGS['AIA'];
  const domainUsername = employee.email ? employee.email.split('@')[0] : '-';
  const computedPassword = generatePassword(firstNameEn, lastNameEn);
  const phoneticPassword = getPhoneticThai(computedPassword);

  const displayFullNameTh = `${titleTh}${cleanFirstNameTh} ${lastNameTh}`.trim();
  const displayFullNameEn = `${titleEn ? titleEn + ' ' : ''}${firstNameEn} ${lastNameEn}`.trim();

  return (
    <div ref={ref} className="bg-white text-black p-8 mx-auto" style={{ width: '210mm', minHeight: '297mm', fontFamily: '"Sarabun", "Tahoma", sans-serif' }}>
      
      {/* Header Section */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <img src={compConfig.logo || aiaLogo} alt={compConfig.nameEn} className="h-28 w-auto object-contain" />
        </div>
        
        <div className="text-center flex-1">
          <h2 className="text-sm font-semibold">{compConfig.nameEn}</h2>
          <h2 className="text-sm font-semibold mt-1">{compConfig.nameTh}</h2>
          <h3 className="text-sm font-bold mt-2">แบบแจ้ง User Name & Email</h3>
          <p className="text-xs mt-1">(เอกสารภายใน เฉพาะฝ่าย IT เท่านั้น)</p>
        </div>

        <div className="text-right text-xs pt-2">
          IT-FORM-002
        </div>
      </div>

      <div className="border border-black w-full text-sm">
        
        {/* Date Row */}
        <div className="flex justify-end p-2 border-b border-black">
          <div className="flex items-end gap-2">
            <span>Date</span>
            <span className="w-40 border-b border-black text-center text-xs pb-1">{formattedDate}</span>
          </div>
        </div>

        {/* Name Thai Row */}
        <div className="p-3 border-b border-black flex items-center gap-6">
          <span className="w-16">ชื่อ-สกุล</span>
          <span className="ml-2">(ภาษาไทย)</span>
          <div className="flex-1 border-b border-black border-dashed flex gap-4 text-base font-semibold px-2 pb-1">
            <span>{displayFullNameTh || '-'}</span>
          </div>
        </div>

        {/* Name Eng Row */}
        <div className="p-3 border-b border-black flex items-center gap-6">
          <span className="w-16">NAME</span>
          <span className="ml-2">(English)</span>
          <div className="flex-1 border-b border-black border-dashed flex gap-4 text-base font-semibold px-2 pb-1">
            <span>{displayFullNameEn || '-'}</span>
          </div>
        </div>

        {/* Position Row */}
        <div className="p-3 border-b border-black flex items-center">
          <span className="mr-2">ตำแหน่ง</span>
          <span className="w-48 border-b border-black border-dashed text-center px-2 pb-1">{employee.position || '-'}</span>
          <span className="ml-8 mr-2">แผนก</span>
          <span className="w-32 border-b border-black border-dashed text-center px-2 pb-1">{employee.department_name || '-'}</span>
          <span className="ml-8 mr-2">รหัสพนักงาน</span>
          <span className="flex-1 border-b border-black border-dashed text-center font-bold px-2 pb-1">{employee.employee_code || '-'}</span>
        </div>

        {/* Login Domain Section */}
        {isAdmin && (
          <div className="flex border-b border-black h-24">
            <div className="w-32 p-3 border-r border-black flex items-center flex-col justify-center text-xs">
              <div className="font-semibold mb-1">Login Domain</div>
              <div>(Office Only)</div>
            </div>
            <div className="flex-1 p-3 flex flex-col justify-between">
              <div className="flex items-end">
                <span className="w-32">User Name</span>
                <div className="flex-1 border-b border-black text-center font-bold px-2 pb-1 text-sm">{employee.use_domain ? domainUsername : '-'}</div>
              </div>
              <div className="flex items-end">
                <span className="w-32">Password</span>
                <div className="flex-1 border-b border-black text-xs text-center pb-1">(เปลี่ยน Password เข้าสู่ระบบ กด Ctrl+Alt+Del กดปุ่ม Change Password)</div>
              </div>
              <div className="flex items-end">
                <span className="w-32">Domain</span>
                <div className="flex-1 border-b border-black text-center font-bold px-2 pb-1 text-sm">
                  {employee.use_domain ? ((employee.company_prefix === 'AGC' || employee.company_prefix === 'AIA') ? 'ASCGGROUP' : '-') : '-'}
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Email Section */}
        <div className="flex border-b border-black">
          <div className="w-3/5 border-r border-black p-3">
            <div className="flex items-start mb-4">
              <div className="w-24 text-lg font-bold">Email</div>
              <div className="flex-1">
                <div className="flex items-end">
                  <span className="w-24 whitespace-nowrap">User Name</span>
                  <div className="flex-1 border-b border-black text-lg font-bold px-2 ml-2 pb-0.5">{employee.email || '-'}</div>
                </div>
                <div className="flex items-end mt-4">
                  <span className="whitespace-nowrap mr-2">Password*<sup className="text-[10px]">1</sup></span>
                  <div className="flex-1 font-bold text-lg">{computedPassword}</div>
                </div>
                <div className="mt-2 text-xs">
                  {phoneticPassword}
                </div>
              </div>
            </div>
          </div>
          <div className="w-2/5 p-3 text-xs flex flex-col justify-center">
            <div className="text-center font-bold mb-3">Outlook Setting : Email POP Server</div>
            <div className="mb-2">Incoming (POP3) : {compConfig.pop3?.server} Port:{compConfig.pop3?.port} {compConfig.pop3?.ssl}</div>
            <div>Outgoing(SMTP) : {compConfig.smtp?.server} Port : {compConfig.smtp?.port} {compConfig.smtp?.ssl}</div>
          </div>
        </div>

        {/* Instructions Section */}
        <div className="p-4 text-xs leading-relaxed space-y-2">
          <div>1 การเปลี่ยน Password Email เปิด Webmail http://mail.{compConfig.domain}, Login {employee.email || 'Username@'+compConfig.domain} , Setting , Password</div>
          <div className="ml-3">เปลี่ยนรหัสผ่านใส่ รหัสปัจจุบัน,ใส่รหัสใหม่,กด ตกลง</div>
          <div className="ml-3">*ท่านต้องจำ Password ที่ท่านได้เปลี่ยนแปลงให้ได้ หากผิดพลาดหรือลืม กรุณาติดต่อ IT เพื่อรีเซ็ท Password</div>
          <div>2 มีข้อสงสัย สอบถามรายละเอียดเพิ่มเติมได้ที่ฝ่าย IT Ext.2233</div>
        </div>

      </div>
    </div>
  );
});

ITFormPrintTemplate.displayName = 'ITFormPrintTemplate';

export default ITFormPrintTemplate;
