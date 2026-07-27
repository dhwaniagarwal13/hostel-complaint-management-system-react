import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, ChevronRight, User } from 'lucide-react';
import { authService } from '../../lib/auth';

const Sidebar = ({ menuItems, roleName }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 h-screen bg-surface-container-low/30 backdrop-blur-3xl border-r border-outline-variant py-10 px-8 fixed shadow-2xl shadow-indigo-950/5 card-glow-effect">
        <div className="mb-14 relative group cursor-pointer" onClick={() => navigate('/')}>
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <h2 className="display-font text-3xl font-black text-on-surface tracking-tighter leading-none">
            Hostel<span className="text-primary group-hover:text-glow-primary transition-all">Care</span>
          </h2>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <p className="text-[10px] uppercase tracking-[0.3em] text-on-surface-variant font-black">
              {roleName} PORTAL
            </p>
          </div>
        </div>
        
        <nav className="flex-1 space-y-3">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`
                  w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-500 font-bold group
                  ${isActive 
                    ? 'bg-primary text-white shadow-xl shadow-primary/30 ring-4 ring-primary/10' 
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface hover:translate-x-1'
                  }
                `}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-white/10' : 'group-hover:text-primary'}`}>
                    <Icon size={22} strokeWidth={isActive ? 3 : 2} />
                  </div>
                  <span className="text-sm tracking-tight">{item.label}</span>
                </div>
                <ChevronRight 
                  size={16} 
                  strokeWidth={3} 
                  className={`transition-all duration-500 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} 
                />
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-8 border-t border-outline-variant space-y-3">
          <button 
            onClick={() => navigate('/profile')} 
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-all duration-500 font-black uppercase text-xs tracking-widest group"
          >
            <div className="p-1 rounded-lg group-hover:scale-110 transition-transform">
              <User size={20} strokeWidth={3} />
            </div>
            <span>View Profile</span>
          </button>
          <button 
            onClick={() => navigate('/')} 
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-on-surface-variant hover:text-tertiary hover:bg-tertiary/10 transition-all duration-500 font-black uppercase text-xs tracking-widest group"
          >
            <div className="p-1 rounded-lg group-hover:rotate-12 transition-transform">
              <LogOut size={20} strokeWidth={3} />
            </div>
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Mobile Nav Dock */}
      <nav className="md:hidden fixed bottom-8 left-6 right-6 h-20 glass-panel rounded-[2rem] border border-white/20 shadow-2xl z-50 flex items-center justify-around px-8 backdrop-blur-2xl">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`relative p-4 rounded-2xl transition-all duration-500 group ${
                isActive ? 'text-primary' : 'text-on-surface-variant'
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-primary/10 rounded-2xl animate-in fade-in zoom-in-50 duration-500" />
              )}
              <Icon size={24} strokeWidth={isActive ? 3 : 2} className="relative z-10 transition-transform group-active:scale-90" />
              {isActive && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-lg shadow-primary/50" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};

export default Sidebar;
