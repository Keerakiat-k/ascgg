import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Users, GraduationCap, 
  Star, FileText, AlertCircle, Save,
  Building, Hash, Briefcase, Mail, ShieldCheck
} from 'lucide-react';
import Button from '../components/ui/Button';
import InputField from '../components/ui/InputField';
import SelectField from '../components/ui/SelectField';
import Swal from 'sweetalert2';

// นำเข้า Form Components
import PersonalInfoForm from '../components/forms/PersonalInfoForm';
import FamilyInfoForm from '../components/forms/FamilyInfoForm';
import EducationExperienceForm from '../components/forms/EducationExperienceForm';
import SkillsAbilitiesForm from '../components/forms/SkillsAbilitiesForm';
import OthersReferencesForm from '../components/forms/OthersReferencesForm';

export default function AddEmployeePage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('personal');
  const [companyOptions, setCompanyOptions] = useState([]);

  // ดึงข้อมูล Role จาก LocalStorage เพื่อตรวจสอบว่าเป็น Admin หรือไม่
  const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
  const isAdmin = String(userInfo.role_id) === '1';

  // 🌟 ดึงรายชื่อบริษัทสำหรับ Master Header จาก Database
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/companies');
        const result = await response.json();
        
        if (response.ok && result.status === 'success') {
          // แปลงข้อมูลจาก { prefix, name } เป็น { value, label } เพื่อให้เข้ากับ SelectField
          const formattedOptions = result.data.map(company => ({
            value: company.prefix,
            label: company.name
          }));
          setCompanyOptions(formattedOptions);
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
      }
    };

    fetchCompanies();
  }, []);

  // Master State: เก็บข้อมูลทั้งหมดของฟอร์ม
  const [formData, setFormData] = useState({
    // --- ข้อมูลองค์กร (Master Header) ---
    companyPrefix: '', employeeCode: '', email: '', 
    position: '', // <-- เพิ่มฟิลด์ตำแหน่งตรงนี้
    departmentId: '', roleId: '3',

    // --- แท็บที่ 1: ข้อมูลส่วนบุคคล ---
    titleThai: '', firstName: '', lastName: '',
    titleEnglish: '', englishFirstName: '', englishLastName: '',
    nickname: '', dateOfBirth: '', nationalId: '',
    height: '', weight: '', bloodGroup: '', religion: '', maritalStatus: '', militaryStatus: '',
    mobile: '', homePhone: '', personalEmail: '', homeAddress: '', currentAddress: '',

    // --- แท็บที่ 2: ข้อมูลครอบครัว ---
    parentStatus: 'อยู่ด้วยกัน', 
    fatherName: '', fatherAge: '', fatherOccupation: '',
    motherName: '', motherAge: '', motherOccupation: '',
    totalSiblings: '', maleSiblings: '', femaleSiblings: '', siblingRank: '',
    spouseName: '', spouseWorkplace: '', totalChildren: '', studyingChildren: '',
    emergencyName: '', emergencyRelation: '', emergencyPhone: '', emergencyWorkplace: '',

    // --- แท็บที่ 3: การศึกษา/ทำงาน ---
    educations: [], experiences: [],

    // --- แท็บที่ 4: ทักษะความสามารถ ---
    thaiSpeak: '', thaiWrite: '', thaiRead: '',
    engSpeak: '', engWrite: '', engRead: '',
    otherLangName: '', otherSpeak: '', otherWrite: '', otherRead: '',
    typingThai: '', typingEng: '', computerSkill: '', officeMachine: '',
    driveCar: 'ไม่ได้', carLicense: '', carReg: '',
    driveMoto: 'ไม่ได้', motoLicense: '', motoReg: '',
    hobbies: '', sports: '', trainings: [],

    // --- แท็บที่ 5: ข้อมูลอื่นๆ ---
    severeIllness: 'ไม่เคย', illnessDetail: '',
    prevApplied: 'ไม่เคย', prevAppliedWhen: '',
    jobSource: '', expectedSalary: '',
    friendInCompany: '', friendRelation: '',
    ref1Name: '', ref1Occupation: '', ref1Relation: '', ref1Address: '', ref1Phone: '',
    ref2Name: '', ref2Occupation: '', ref2Relation: '', ref2Address: '', ref2Phone: '',
    houseType: '', relocationPlan: '', relocationDetail: '', selfIntroduction: ''
  });

  // Auto-Generate รหัสพนักงาน
  useEffect(() => {
    if (!formData.companyPrefix) {
      setFormData(prev => ({ ...prev, employeeCode: '' }));
      return;
    }
    const fetchNextEmployeeCode = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/employees/next-code?prefix=${formData.companyPrefix}`);
        const data = await response.json();
        if (response.ok && data.status === 'success') {
          setFormData(prev => ({ ...prev, employeeCode: data.nextCode }));
        }
      } catch (err) {
        console.error('Fetch Next Code Error:', err);
      }
    };
    const timeoutId = setTimeout(() => fetchNextEmployeeCode(), 300);
    return () => clearTimeout(timeoutId);
  }, [formData.companyPrefix]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(''); // เก็บ state error เดิมไว้เผื่อใช้แสดงใต้ Header

    // 1. ตรวจสอบข้อมูลเบื้องต้น (Validation)
    if (!formData.companyPrefix || !formData.firstName || !formData.lastName || !formData.position) {
      setIsLoading(false);
      window.scrollTo(0, 0);
      
      // แจ้งเตือน: กรอกข้อมูลไม่ครบ (สีส้ม)
      Swal.fire({
        title: 'ข้อมูลไม่ครบถ้วน!',
        text: 'กรุณากรอกข้อมูลสำคัญ (ชื่อ, นามสกุล, บริษัท และ ตำแหน่ง) ให้ครบถ้วน',
        icon: 'warning',
        confirmButtonColor: '#f59e0b',
        confirmButtonText: 'ตกลง'
      });
      return;
    }

    try {
      // ยิง API ไปยัง Backend
      const response = await fetch('http://localhost:5000/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        // แจ้งเตือน: บันทึกสำเร็จ (สีเขียว)
        Swal.fire({
          title: 'สำเร็จ!',
          text: 'บันทึกข้อมูลพนักงานเรียบร้อยแล้ว',
          icon: 'success',
          confirmButtonColor: '#2563eb', // ใช้สีน้ำเงินให้เข้ากับ Theme เว็บ
          confirmButtonText: 'ไปที่หน้าแดชบอร์ด',
          allowOutsideClick: false // บังคับให้กดปุ่มก่อนถึงจะไปต่อ
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/dashboard'); // เปลี่ยนหน้าเมื่อกดปุ่มตกลง
          }
        });
        
      } else {
        throw new Error(data.message || 'เกิดข้อผิดพลาดจากฝั่งเซิร์ฟเวอร์');
      }
    } catch (err) {
      // แจ้งเตือน: เกิดข้อผิดพลาด (สีแดง)
      Swal.fire({
        title: 'ผิดพลาด!',
        text: err.message || 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
        icon: 'error',
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'ลองใหม่อีกครั้ง'
      });
      setError(err.message || 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // ฟังก์ชันสำหรับทดสอบ (ลบออกตอนเอาขึ้น Production)
  // ==========================================
  const fillMockData = () => {
    setFormData(prev => ({
      ...prev,
      // ข้อมูลองค์กร
      companyPrefix: 'AEP',
      position: 'Full Stack Developer',
      departmentId: '1',
      roleId: '3',
      email: 'dev.test@ascggroup.com',
      
      // ข้อมูลส่วนตัว
      titleThai: 'นาย',
      firstName: 'ทดสอบ',
      lastName: 'ระบบงาน',
      titleEnglish: 'Mr.',
      englishFirstName: 'Test',
      englishLastName: 'System',
      nickname: 'เทส',
      dateOfBirth: '1995-05-15',
      nationalId: '1100112233445',
      height: '175',
      weight: '70',
      bloodGroup: 'O',
      religion: 'พุทธ',
      maritalStatus: 'โสด',
      militaryStatus: 'ผ่านเกณฑ์',
      mobile: '0812345678',
      personalEmail: 'test.system@gmail.com',
      homeAddress: '123/45 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กทม. 10110',
      currentAddress: 'เหมือนที่อยู่ตามทะเบียนบ้าน',

      // ข้อมูลครอบครัว
      parentStatus: 'อยู่ด้วยกัน',
      fatherName: 'สมชาย ระบบงาน', fatherAge: '60', fatherOccupation: 'พนักงานเอกชน',
      motherName: 'สมหญิง ระบบงาน', motherAge: '58', motherOccupation: 'แม่บ้าน',
      totalSiblings: '2', maleSiblings: '1', femaleSiblings: '1', siblingRank: '1',
      emergencyName: 'สมชาย ระบบงาน', emergencyRelation: 'บิดา', emergencyPhone: '0899999999',

      // การศึกษา
      educations: [
        { level: 'ปริญญาตรี', institution: 'มหาวิทยาลัยเทคโนโลยี', major: 'วิทยาการคอมพิวเตอร์', startDate: '2013-05-01', endDate: '2017-03-31', gpa: '3.50' }
      ],
      
      // ประสบการณ์ทำงาน
      experiences: [
        { company: 'บริษัท เทค ซอฟต์แวร์ จำกัด', businessType: 'Software House', startPosition: 'Junior Dev', endPosition: 'Senior Dev', startSalary: '25000', endSalary: '45000', startDate: '2017-06-01', endDate: '2023-12-31', description: 'พัฒนาเว็บแอปพลิเคชันด้วย React และ Node.js', reasonToLeave: 'ต้องการความท้าทายใหม่' }
      ],

      // ทักษะและความสามารถ
      thaiSpeak: 'ดี', thaiWrite: 'ดี', thaiRead: 'ดี',
      engSpeak: 'ปานกลาง', engWrite: 'ปานกลาง', engRead: 'ปานกลาง',
      typingThai: '45', typingEng: '40',
      computerSkill: 'React, Node.js, MySQL, Docker',
      driveCar: 'ได้', carLicense: '6543210', carReg: 'กข 1234 กทม',
      hobbies: 'เขียนโค้ด, เลี้ยงปลาสวยงาม, จัดสวน', sports: 'วิ่ง',

      // ข้อมูลอื่นๆ
      expectedSalary: '50000',
      houseType: 'บ้านเช่า/หอพัก',
      relocationPlan: 'ไม่โยกย้ายแน่ๆ'
    }));
  };

  const TABS = [
    { id: 'personal', label: 'ข้อมูลส่วนตัว', icon: User },
    { id: 'family', label: 'ครอบครัว', icon: Users },
    { id: 'education', label: 'การศึกษา/ทำงาน', icon: GraduationCap },
    { id: 'skills', label: 'ทักษะพิเศษ', icon: Star },
    { id: 'others', label: 'อื่นๆ', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <nav className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-900">ทะเบียนประวัติพนักงานใหม่</h1>
          </div>

          <div className="flex gap-3">
            {/* --- ปุ่มเสกข้อมูล (สำหรับเทส) --- */}
            <Button 
              type="button" 
              onClick={fillMockData} 
              className="!w-auto !bg-gray-200 !text-gray-700 hover:!bg-gray-300"
            >
              🪄 Auto Fill (Test)
            </Button>

            {/* --- ปุ่มบันทึกข้อมูลเดิม --- */}
            <Button type="button" onClick={handleSubmit} isLoading={isLoading} className="!w-auto flex items-center gap-2 px-6">
              <Save size={18} />
              บันทึกข้อมูลทั้งหมด
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-3 text-sm border border-red-200">
            <AlertCircle size={20} className="text-red-500 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* ============================================== */}
        {/* MASTER HEADER: ข้อมูลการว่าจ้างองค์กร (อยู่นอกสุด) */}
        {/* ============================================== */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6 border-l-4 border-l-blue-600">
          <div className="flex items-center gap-2 mb-4">
            <Building size={20} className="text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">ข้อมูลการว่าจ้างองค์กร (Employment Status)</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="md:col-span-2">
              <SelectField label="บริษัทต้นสังกัด (Company)" name="companyPrefix" value={formData.companyPrefix} onChange={handleChange} options={companyOptions} required disabled={isLoading} />
            </div>
            <InputField label="รหัสพนักงาน" name="employeeCode" icon={Hash} value={formData.employeeCode} onChange={() => {}} disabled={true} placeholder="Auto Generated" />
            <InputField label="ตำแหน่ง (Position)" name="position" icon={Briefcase} value={formData.position} onChange={handleChange} required disabled={isLoading} placeholder="เช่น Software Engineer" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SelectField
              label="แผนก (Department)" name="departmentId" value={formData.departmentId} onChange={handleChange} required disabled={isLoading}
              options={[{ value: '1', label: 'ไอทีและพัฒนาระบบ (IT)' }, { value: '2', label: 'ทรัพยากรบุคคล (HR)' }, { value: '3', label: 'การเงินและบัญชี (Finance)' }]}
            />
            <InputField label="อีเมลองค์กร (Company Email)" type="email" name="email" icon={Mail} value={formData.email} onChange={handleChange} disabled={isLoading || !isAdmin} placeholder="name@ascggroup.com" />
            <SelectField
              label="สิทธิ์การใช้งานระบบ (System Role)" name="roleId" value={formData.roleId} onChange={handleChange} required disabled={isLoading || !isAdmin}
              options={[{ value: '1', label: 'ผู้ดูแลระบบ (Admin)' }, { value: '2', label: 'ทรัพยากรบุคคล (HR)' }, { value: '3', label: 'พนักงานทั่วไป (Employee)' }]}
            />
          </div>
        </div>

        {/* ============================================== */}
        {/* TABS NAVIGATION & CONTENT */}
        {/* ============================================== */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex overflow-x-auto border-b border-gray-200 bg-gray-50/50">
            {TABS.map(tab => (
              <button
                key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                  ${activeTab === tab.id ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                <tab.icon size={18} className={activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-8">
            <form id="employee-form" onSubmit={handleSubmit}>
              <div className={activeTab === 'personal' ? 'block' : 'hidden'}>
                <PersonalInfoForm formData={formData} handleChange={handleChange} isLoading={isLoading} />
              </div>
              <div className={activeTab === 'family' ? 'block' : 'hidden'}>
                <FamilyInfoForm formData={formData} handleChange={handleChange} isLoading={isLoading} />
              </div>
              <div className={activeTab === 'education' ? 'block' : 'hidden'}>
                <EducationExperienceForm formData={formData} setFormData={setFormData} isLoading={isLoading} />
              </div>
              <div className={activeTab === 'skills' ? 'block' : 'hidden'}>
                <SkillsAbilitiesForm formData={formData} handleChange={handleChange} setFormData={setFormData} isLoading={isLoading} />
              </div>
              <div className={activeTab === 'others' ? 'block' : 'hidden'}>
                <OthersReferencesForm formData={formData} handleChange={handleChange} isLoading={isLoading} />
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}