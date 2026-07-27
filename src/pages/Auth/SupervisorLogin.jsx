import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardFooter } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Database as SupervisorIcon, Lock, ShieldCheck, Hash, ArrowLeft, Terminal, User } from 'lucide-react';
import { authService } from '../../lib/auth';

export default function SupervisorLogin() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    supervisor_id: '',
    secret_key: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await authService.supervisorLogin(formData.email, formData.secret_key);
      navigate('/supervisor/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 mesh-gradient relative overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute top-[10%] right-[10%] w-[35%] h-[50%] rounded-full bg-primary/20 blur-[130px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[10%] left-[10%] w-[35%] h-[50%] rounded-full bg-tertiary/10 blur-[130px] animate-pulse pointer-events-none" />
      
      <div className="w-full max-w-xl z-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
        <button 
          className="mb-10 group inline-flex items-center space-x-3 text-on-surface-variant hover:text-primary transition-all duration-300" 
          onClick={() => navigate('/')}
        >
          <div className="p-2 rounded-xl glass-panel group-hover:bg-primary group-hover:text-white transition-all shadow-sm border border-outline/10">
            <ArrowLeft size={18} strokeWidth={3} />
          </div>
          <span className="text-xs tracking-widest uppercase font-black">Back to Portals</span>
        </button>

        <Card className="glass-panel p-10 md:p-14 border border-outline/10 shadow-2xl overflow-hidden relative group/card">
          <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-primary via-tertiary to-secondary opacity-80" />
          
          <div className="mb-12 relative">
            <div className="inline-flex p-4 bg-primary/10 text-primary rounded-2xl mb-8 ring-4 ring-primary/5">
              <SupervisorIcon size={32} strokeWidth={2.5} />
            </div>
            
            <h2 className="display-font text-4xl md:text-5xl font-black text-on-surface leading-[0.9] tracking-tighter mb-4">
              Master <span className="text-primary text-glow-primary">Auth.</span>
            </h2>
            <p className="text-on-surface-variant font-medium text-lg leading-relaxed max-w-md">
              High-level administrative terminal. Access the central database and system whitelists.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-4 rounded-xl text-xs font-bold uppercase tracking-widest border bg-error/10 border-error/20 text-error">
                {error}
              </div>
            )}
            <Input 
              label="Email Address" 
              type="email"
              icon={User}
              placeholder="e.g. admin@hostel.edu" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              required 
            />
            
            <Input 
              label="Master Access Key" 
              type="password" 
              icon={Lock}
              placeholder="••••••••••••••••" 
              value={formData.secret_key}
              onChange={e => setFormData({...formData, secret_key: e.target.value})}
              required 
            />

            <div className="bg-surface-container-low/50 p-6 rounded-2xl border border-outline/10 flex items-start gap-4">
              <div className="p-2 bg-tertiary/10 text-tertiary rounded-lg shrink-0">
                <ShieldCheck size={20} strokeWidth={2.5} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant leading-relaxed italic opacity-60">
                Authorized access only. All sessions are logged in the immutable audit trail.
              </p>
            </div>

            <Button type="submit" className="w-full mt-6 py-6 text-xl font-black uppercase tracking-[0.25em] shadow-2xl shadow-primary/40 group relative overflow-hidden bg-primary hover:bg-primary/90 text-white">
              <span className="relative z-10 flex items-center justify-center gap-3">
                <Terminal size={20} strokeWidth={3} />
                Execute Login
              </span>
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-[-45deg]" />
            </Button>
          </form>

          <CardFooter className="text-center pt-10 mt-10 border-t border-outline/5">
            <div className="flex items-center justify-center gap-2 opacity-40 hover:opacity-100 transition-opacity">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.4em]">Secure Node 042-A active</span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
