import React from 'react';

export const Card = ({ children, className = '', variant = 'glass', ...props }) => {
  const variants = {
    default: 'bg-surface border border-outline/10 shadow-sm shadow-slate-900/5 hover:shadow-md transition-shadow duration-300 card-glow-effect',
    glass: 'glass-panel shadow-2xl shadow-indigo-950/10 hover:shadow-indigo-950/20 transition-all duration-500',
    elevated: 'bg-surface-container-low border border-outline/10 shadow-lg hover:shadow-xl transition-all duration-300 card-glow-effect'
  }

  return (
    <div 
      className={`${variants[variant]} rounded-2xl p-8 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, icon: Icon, action, className = '' }) => (
  <div className={`flex justify-between items-start mb-8 ${className}`}>
    <div className="flex gap-4 items-center">
      {Icon && (
        <div className="p-3 bg-primary/10 text-primary rounded-xl ring-4 ring-primary/5">
          <Icon size={24} strokeWidth={2.5} />
        </div>
      )}
      <div>
        <h3 className="display-font text-xl font-extrabold text-on-surface tracking-tight leading-tight uppercase tracking-wider">{title}</h3>
        {subtitle && <p className="text-on-surface-variant text-sm mt-1.5 font-medium">{subtitle}</p>}
      </div>
    </div>
    {action && <div className="self-center">{action}</div>}
  </div>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`mt-8 pt-6 border-t border-outline/10 ${className}`}>
    {children}
  </div>
);
