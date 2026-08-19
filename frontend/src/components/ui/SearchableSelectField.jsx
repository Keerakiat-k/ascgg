import React from 'react';
import Select from 'react-select';

export default function SearchableSelectField({ 
  label, 
  name, 
  value, 
  onChange, 
  options, 
  icon: Icon, 
  required, 
  disabled,
  placeholder = "-- กรุณาเลือก --"
}) {
  const selectedOption = options?.find(opt => String(opt.value) === String(value)) || null;

  const handleChange = (selected) => {
    onChange({ target: { name, value: selected ? selected.value : '' } });
  };

  const customStyles = {
    control: (base, state) => ({
      ...base,
      paddingTop: '2px',
      paddingBottom: '2px',
      paddingLeft: Icon ? '2.5rem' : '0.5rem',
      borderRadius: '0.75rem',
      borderColor: state.isFocused ? '#f89919' : '#cbd5e1',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(248, 153, 25, 0.25)' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#f89919' : '#94a3b8'
      },
      backgroundColor: disabled ? '#f1f5f9' : '#ffffff',
    }),
    placeholder: (base) => ({
      ...base,
      color: '#94a3b8'
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#f89919' : state.isFocused ? '#fff8f0' : 'white',
      color: state.isSelected ? 'white' : '#0f172a',
      '&:active': {
        backgroundColor: '#f89919'
      }
    })
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 z-10">
            <Icon size={18} />
          </div>
        )}
        <Select
          name={name}
          value={selectedOption}
          onChange={handleChange}
          options={options}
          isDisabled={disabled}
          placeholder={placeholder}
          styles={customStyles}
          isClearable
          isSearchable
        />
      </div>
    </div>
  );
}
