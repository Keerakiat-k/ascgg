export default function SelectField({ 
  label, 
  name,       // <-- 1. รับค่า name เข้ามาเป็น Props
  value, 
  onChange, 
  options, 
  icon: Icon, 
  required, 
  disabled 
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Icon size={20} />
          </div>
        )}
        <select
          name={name} // <-- 2. ผูก name เข้ากับ HTML Select Attribute
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`block w-full ${Icon ? 'pl-10' : 'pl-3'} pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors disabled:bg-gray-100 disabled:text-gray-500`}
        >
          <option value="" disabled>-- กรุณาเลือก --</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}