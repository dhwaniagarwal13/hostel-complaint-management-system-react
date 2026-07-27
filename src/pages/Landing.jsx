import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { User, ShieldCheck, HardHat, BarChart3, ArrowRight } from 'lucide-react';

const roles = [
  {
    id: 'student',
    title: 'Hostel Student',
    description: 'File complaints & track resolutions.',
    path: '/student/login',
    icon: User,
    gradient: 'from-primary/20 to-primary/5',
    border: 'group-hover:border-primary/50'
  },
  {
    id: 'staff',
    title: 'Maintenance Staff',
    description: 'Manage tasks and update progress.',
    path: '/staff/login',
    icon: HardHat,
    gradient: 'from-secondary/20 to-secondary/5',
    border: 'group-hover:border-secondary/50'
  },
  {
    id: 'warden',
    title: 'Hostel Warden',
    description: 'Oversee operations & assign tasks.',
    path: '/warden/login',
    icon: ShieldCheck,
    gradient: 'from-success/20 to-success/5',
    border: 'group-hover:border-success/50'
  },
  {
    id: 'supervisor',
    title: 'Supervisor',
    description: 'Master data & refined analytics.',
    path: '/supervisor/login',
    icon: BarChart3,
    gradient: 'from-tertiary/20 to-tertiary/5',
    border: 'group-hover:border-tertiary/50'
  }
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 mesh-gradient relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-secondary/10 blur-[120px] animate-pulse transition-all duration-1000" />

      <div className="z-10 text-center max-w-4xl space-y-8 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass-panel mb-4 overflow-hidden group">
          <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
          <span className="text-xs font-bold tracking-widest uppercase text-on-surface-variant group-hover:text-primary transition-colors">
            Institutional Grievance System
          </span>
        </div>
        
        <h1 className="display-font text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-white">
          Hostel<span className="text-secondary text-glow-secondary">Care.</span>
        </h1>
        <p className="text-sm md:text-base font-black uppercase tracking-[0.5em] text-on-surface-variant/60 mt-4">
          A Hostel Complaint Management System
        </p>
        
        <p className="text-xl md:text-2xl text-on-surface-variant font-medium max-w-2xl mx-auto leading-relaxed">
          Navigate through our seamless portals to manage and resolve institutional grievances with elegance and speed.
        </p>
      </div>

      <div className="z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl animate-in fade-in zoom-in-95 duration-1000 delay-300">
        {roles.map((role, index) => {
          const Icon = role.icon;
          return (
            <div 
              key={role.id}
              onClick={() => navigate(role.path)}
              className={`
                group relative cursor-pointer rounded-3xl p-[1px] transition-all duration-500 
                hover:scale-105 active:scale-95
                bg-gradient-to-br ${role.gradient} border border-outline/10 ${role.border}
              `}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Card className="h-full bg-surface-container-low/40 backdrop-blur-xl border-none p-8 flex flex-col items-center text-center group-hover:bg-surface/60 transition-all duration-500 overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Icon size={120} strokeWidth={1} />
                </div>
                
                <div className={`p-5 rounded-2xl bg-surface shadow-inner group-hover:shadow-primary/10 transition-all duration-500 mb-8 ring-1 ring-outline/5`}>
                  <Icon size={32} strokeWidth={2.5} className="text-on-surface group-hover:text-primary transition-colors duration-500" />
                </div>
                
                <div className="mt-auto space-y-3 relative z-10">
                  <h2 className="display-font text-xl font-extrabold text-on-surface tracking-tight group-hover:text-primary transition-colors">
                    {role.title}
                  </h2>
                  <p className="text-on-surface-variant text-sm font-medium leading-relaxed">
                    {role.description}
                  </p>
                </div>
                
                <div className="mt-8 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:rotate-[360deg] shadow-lg group-hover:shadow-primary/30">
                    <ArrowRight size={24} strokeWidth={2.5} />
                  </div>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
      
      {/* Footer Branding */}
      <div className="mt-24 z-10 opacity-30 hover:opacity-100 transition-opacity duration-700 flex items-center gap-4">
        <div className="h-[1px] w-12 bg-on-surface-variant/30" />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-on-surface-variant">
          Hostel Management v2.0
        </span>
        <div className="h-[1px] w-12 bg-on-surface-variant/30" />
      </div>
    </div>
  );
}
