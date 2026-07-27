import React from 'react';
import { Clock, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const s = status?.toLowerCase().replace(' ', '_');
  
  const config = {
    pending: {
      style: 'bg-tertiary/10 text-tertiary border-tertiary/20 shadow-tertiary/5',
      icon: Clock,
      label: 'Pending'
    },
    in_progress: {
      style: 'bg-secondary/10 text-secondary border-secondary/20 shadow-secondary/5',
      icon: TrendingUp,
      label: 'Active'
    },
    resolved: {
      style: 'bg-success/10 text-success border-success/20 shadow-success/5',
      icon: CheckCircle2,
      label: 'Resolved'
    },
    escalated: {
      style: 'bg-tertiary/20 text-white bg-tertiary border-tertiary shadow-tertiary/20',
      icon: AlertCircle,
      label: 'Priority'
    }
  };

  const active = config[s] || config.pending;
  const Icon = active.icon;

  return (
    <span className={`
      inline-flex items-center gap-1.5 px-3 py-1 text-[10px] uppercase tracking-[0.15em] font-black rounded-lg border backdrop-blur-md shadow-sm transition-all duration-300
      ${active.style}
    `}>
      <Icon size={12} strokeWidth={3} />
      {active.label}
    </span>
  );
};

export default StatusBadge;
