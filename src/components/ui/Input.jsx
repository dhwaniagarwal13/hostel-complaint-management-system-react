import React from 'react';

const Input = ({ label, icon: Icon, error, className = '', containerClassName = '', ...props }) => {
  return (
    <div className={`space-y-2 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-semibold text-on-surface-variant tracking-wide">
          {label}
        </label>
      )}
      <div className="relative group transition-all duration-300">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors duration-300">
            <Icon size={20} strokeWidth={2} />
          </div>
        )}
        <input
          className={`
            w-full bg-surface-container-low border border-outline/10 text-on-surface 
            rounded-xl py-3 px-4 ${Icon ? 'pl-12' : ''}
            transition-all duration-300 outline-none
            placeholder:text-on-surface-variant/40
            focus:bg-surface focus:border-primary/40 focus:ring-4 focus:ring-primary/10
            hover:border-primary/20
            ${error ? 'border-tertiary focus:ring-tertiary/10' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs font-medium text-tertiary mt-1 animate-in slide-in-from-top-1 duration-200">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
