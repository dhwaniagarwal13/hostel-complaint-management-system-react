import React from 'react';
import { ChevronDown } from 'lucide-react';

const Select = ({ label, icon: Icon, error, options = [], className = '', containerClassName = '', ...props }) => {
  return (
    <div className={`space-y-2 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-semibold text-on-surface-variant tracking-wide">
          {label}
        </label>
      )}
      <div className="relative group transition-all duration-300">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors duration-300 pointer-events-none z-10">
            <Icon size={20} strokeWidth={2.5} />
          </div>
        )}
        <select
          className={`
            w-full bg-surface-container-low border border-outline/10 text-on-surface 
            rounded-xl py-3.5 px-4 ${Icon ? 'pl-12' : ''} pr-10
            transition-all duration-300 outline-none
            appearance-none cursor-pointer font-medium
            focus:bg-surface focus:border-primary/40 focus:ring-4 focus:ring-primary/10
            hover:border-primary/20
            ${error ? 'border-tertiary focus:ring-tertiary/10' : ''}
            ${className}
          `}
          {...props}
        >
          <option value="" disabled className="bg-surface text-on-surface-variant/40">Select Hostel...</option>
          {options.map((option) => (
            <option key={option} value={option} className="bg-surface text-on-surface">
              {option}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary pointer-events-none transition-colors duration-300">
          <ChevronDown size={18} strokeWidth={3} />
        </div>
      </div>
      {error && (
        <p className="text-xs font-medium text-tertiary mt-1 animate-in slide-in-from-top-1 duration-200">
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;
