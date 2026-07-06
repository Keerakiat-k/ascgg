import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import InputField from '../ui/InputField';
import Button from '../ui/Button';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // ยิง API ไปยัง Backend ที่เราเขียนไว้
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // ส่งข้อมูล email และ password ไปในรูปแบบ JSON
        body: JSON.stringify({ email, password }),
      });

      // แปลงข้อมูลที่ตอบกลับมาเป็น JSON
      const data = await response.json();

      if (response.ok && data.status === 'success') {
        // หากสำเร็จ เก็บ Token ลง localStorage
        localStorage.setItem('auth_token', data.token);
        // เก็บข้อมูล User เบื้องต้นไว้ใช้งานในระบบ
        localStorage.setItem('user_info', JSON.stringify(data.user));
        
        // เปลี่ยนหน้าไปที่ Dashboard
        navigate('/dashboard');
      } else {
        // หากไม่สำเร็จ (เช่น รหัสผิด) ให้แสดงข้อความ Error จาก Backend
        setError(data.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (err) {
      console.error('Login Fetch Error:', err);
      // กรณี Server ดาวน์ หรือ Network มีปัญหา
      setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      // ปิดสถานะ Loading ไม่ว่าจะสำเร็จหรือล้มเหลว
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-3 text-sm border border-red-200 animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={20} className="text-red-500 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <InputField
        label="อีเมลองค์กร"
        type="email"
        icon={Mail}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="name@company.com"
        required
        disabled={isLoading}
      />

      <InputField
        label="รหัสผ่าน"
        type="password"
        icon={Lock}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        required
        disabled={isLoading}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            disabled={isLoading}
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
            จดจำการเข้าสู่ระบบ
          </label>
        </div>
        <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
          ลืมรหัสผ่าน?
        </a>
      </div>

      <Button type="submit" isLoading={isLoading}>
        เข้าสู่ระบบ
      </Button>
    </form>
  );
}