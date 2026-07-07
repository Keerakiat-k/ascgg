import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

export default function EditEmployeePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('personal');
  
  const [companyOptions, setCompanyOptions] = useState([]);
  
  // ดึงข้อมูล Role จาก LocalStorage เพื่อตรวจสอบว่าเป็น Admin หรือไม่
  const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
  const isAdmin = String(userInfo.role_id) === '1';
  
  // 🌟 เพิ่ม State จำค่าดั้งเดิม (สำหรับทางเลือก B)
  const [originalCompany, setOriginalCompany] = useState('');
  const [originalCode, setOriginalCode] = useState('');

  // 1. ดึงข้อมูลบริษัท
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/companies');
        const result = await response.json();
        
        if (response.ok && result.status === 'success') {
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

  const [formData, setFormData] = useState({
    companyPrefix: '', employeeCode: '', email: '', 
    position: '', departmentId: '', roleId: '3',
    titleThai: '', firstName: '', lastName: '',
    titleEnglish: '', englishFirstName: '', englishLastName: '',
    nickname: '', dateOfBirth: '', nationalId: '',
    height: '', weight: '', bloodGroup: '', religion: '', maritalStatus: '', militaryStatus: '',
    mobile: '', homePhone: '', personalEmail: '', homeAddress: '', currentAddress: '',
    parentStatus: 'อยู่ด้วยกัน', fatherName: '', fatherAge: '', fatherOccupation: '',
    motherName: '', motherAge: '', motherOccupation: '',
    totalSiblings: '', maleSiblings: '', femaleSiblings: '', siblingRank: '',
    spouseName: '', spouseWorkplace: '', totalChildren: '', studyingChildren: '',
    emergencyName: '', emergencyRelation: '', emergencyPhone: '', emergencyWorkplace: '',
    educations: [], experiences: [],
    thaiSpeak: '', thaiWrite: '', thaiRead: '', engSpeak: '', engWrite: '', engRead: '',
    otherLangName: '', otherSpeak: '', otherWrite: '', otherRead: '',
    typingThai: '', typingEng: '', computerSkill: '', officeMachine: '',
    driveCar: 'ไม่ได้', carLicense: '', carReg: '', driveMoto: 'ไม่ได้', motoLicense: '', motoReg: '',
    hobbies: '', sports: '', trainings: [],
    severeIllness: 'ไม่เคย', illnessDetail: '', prevApplied: 'ไม่เคย', prevAppliedWhen: '',
    jobSource: '', expectedSalary: '', friendInCompany: '', friendRelation: '',
    ref1Name: '', ref1Occupation: '', ref1Relation: '', ref1Address: '', ref1Phone: '',
    ref2Name: '', ref2Occupation: '', ref2Relation: '', ref2Address: '', ref2Phone: '',
    houseType: '', relocationPlan: '', relocationDetail: '', selfIntroduction: ''
  });

  // 2. ดึงข้อมูลพนักงานเก่ามาใส่ฟอร์ม
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/employees/${id}`);
        const result = await response.json();
        
        if (response.ok && result.status === 'success') {
          const dbData = result.data;
          
          // 🌟 จำค่าบริษัทและรหัสพนักงานเดิมไว้
          setOriginalCompany(dbData.company_prefix || '');
          setOriginalCode(dbData.employee_code || '');

          setFormData(prev => ({
            ...prev,
            companyPrefix: dbData.company_prefix || '',
            employeeCode: dbData.employee_code || '',
            email: dbData.email || '',
            position: dbData.position || '',
            departmentId: dbData.department_id?.toString() || '',
            roleId: dbData.role_id?.toString() || '',
            titleThai: dbData.title_th || '',
            firstName: dbData.first_name_th || '',
            lastName: dbData.last_name_th || '',
            titleEnglish: dbData.title_en || '',
            englishFirstName: dbData.first_name_en || '',
            englishLastName: dbData.last_name_en || '',
            nickname: dbData.nickname || '',
            dateOfBirth: dbData.date_of_birth ? new Date(dbData.date_of_birth).toISOString().split('T')[0] : '',
            nationalId: dbData.national_id || '',
            height: dbData.height || '',
            weight: dbData.weight || '',
            bloodGroup: dbData.blood_group || '',
            religion: dbData.religion || '',
            maritalStatus: dbData.marital_status || '',
            militaryStatus: dbData.military_status || '',
            mobile: dbData.mobile || '',
            homePhone: dbData.home_phone || '',
            personalEmail: dbData.personal_email || '',
            homeAddress: dbData.home_address || '',
            currentAddress: dbData.current_address || ''
          }));
        }
      } catch (error) {
        Swal.fire('ผิดพลาด', 'ไม่สามารถดึงข้อมูลพนักงานได้', 'error');
      }
    };
    fetchEmployeeData();
  }, [id]);

  // 🌟 3. ระบบเช็คและดึงรหัสใหม่เมื่อมีการเปลี่ยนบริษัท (ทางเลือก B)
  useEffect(() => {
    if (!formData.companyPrefix || !originalCompany) return;

    if (formData.companyPrefix === originalCompany) {
      setFormData(prev => ({ ...prev, employeeCode: originalCode }));
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
  }, [formData.companyPrefix, originalCompany, originalCode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(''); 

    if (!formData.companyPrefix || !formData.firstName || !formData.lastName || !formData.position) {
      setIsLoading(false);
      window.scrollTo(0, 0);
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
      const response = await fetch(`http://localhost:5000/api/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        Swal.fire({
          title: 'อัปเดตสำเร็จ!',
          text: 'แก้ไขข้อมูลพนักงานเรียบร้อยแล้ว',
          icon: 'success',
          confirmButtonColor: '#2563eb',
          confirmButtonText: 'ไปที่หน้ารายชื่อพนักงาน', // แก้ข้อความปุ่ม
          allowOutsideClick: false 
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/employee-list'); // 🌟 แก้ตรงนี้ให้ไปหน้า employee-list ด้วย 🌟
          }
        });
      } else {
        throw new Error(data.message || 'เกิดข้อผิดพลาดจากฝั่งเซิร์ฟเวอร์');
      }
    } catch (err) {
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

  const TABS = [
    { id: 'personal', label: 'ข้อมูลส่วนตัว', icon: User },
    { id: 'family', label: 'ครอบครัว', icon: Users },
    { id: 'education', label: 'การศึกษา/ทำงาน', icon: GraduationCap },
    { id: 'skills', label: 'ทักษะพิเศษ', icon: Star },
    { id: 'others', label: 'อื่นๆ', icon: FileText },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Page Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Edit className="text-indigo-600" />
            แก้ไขประวัติพนักงาน
          </h1>
          <p className="text-gray-500 mt-1">แก้ไขข้อมูลส่วนบุคคลและข้อมูลองค์กรของพนักงาน</p>
        </div>

        <div className="flex gap-3">
          <Button type="button" onClick={handleSubmit} isLoading={isLoading} className="!w-auto flex items-center gap-2 px-6">
            <Save size={18} />
            บันทึกการแก้ไข
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-4">
        {error && (
          <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-3 text-sm border border-red-200">
            <AlertCircle size={20} className="text-red-500 shrink-0" />
            <p>{error}</p>
          </div>
        )}

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
      </div>
    </div>
  );
}