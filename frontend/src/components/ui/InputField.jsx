import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function InputField({ 
  label, 
  name,
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  icon: Icon, 
  required, 
  disabled,
  list
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const currentType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon size={18} />
          </div>
        )}
        <input
          name={name}
          type={currentType}
          value={value}
          onChange={onChange}
          className={`
            w-full py-2.5 rounded-xl border border-slate-300
            focus:ring-2 focus:ring-[#f89919]/30 focus:border-[#f89919]
            transition-all duration-200 outline-none text-slate-900 text-sm bg-white
            ${Icon ? 'pl-10' : 'pl-4'}
            ${isPassword ? 'pr-10' : 'pr-4'}
            ${disabled ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200' : 'hover:border-slate-400'}
          `}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          list={list}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-[#f89919] focus:outline-none transition-colors"
            onClick={() => setShowPassword(!showPassword)}
            disabled={disabled}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
}