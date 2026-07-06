import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function InputField({ 
  label, 
  name,       // <-- 1. เพิ่มการรับค่า name
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  icon: Icon, 
  required, 
  disabled 
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const currentType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          {Icon && <Icon size={20} />}
        </div>
        <input
          name={name} // <-- 2. ผูก name เข้ากับ HTML Input
          type={currentType}
          value={value}
          onChange={onChange}
          className={`block w-full ${Icon ? 'pl-10' : 'pl-3'} pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:text-gray-500`}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
            onClick={() => setShowPassword(!showPassword)}
            disabled={disabled}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </div>
  );
}