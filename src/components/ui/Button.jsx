import React from 'react';

const Button = ({ children, variant = 'primary', size = 'default', className = '', isLoading = false, ...props }) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-300 outline-none focus:ring-4 focus:ring-primary/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30',
    secondary: 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest border border-outline/10',
    outline: 'bg-transparent border-2 border-primary text-primary hover:bg-primary/5',
    ghost: 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface',
    danger: 'bg-tertiary text-white hover:bg-tertiary/90 shadow-lg shadow-tertiary/20'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    default: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-2xl',
    icon: 'p-3 rounded-xl'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} relative overflow-hidden`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
