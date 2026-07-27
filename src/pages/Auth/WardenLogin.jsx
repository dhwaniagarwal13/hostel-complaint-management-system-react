import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardFooter } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { HOSTELS } from '../../constants/hostels';
import { ShieldCheck as WardenIcon, Lock, User, Hash, ArrowLeft, Activity, Camera } from 'lucide-react';
import { authService } from '../../lib/auth';

export default function WardenLogin() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    hostel_id: '',
    warden_id: '',
    phone_number: '',
    password: ''
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoBase64, setPhotoBase64] = useState(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('Photo must be under 2MB.'); return; }
    const reader = new FileReader();
    reader.onloadend = () => { setPhotoBase64(reader.result); setPhotoPreview(reader.result); };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isLogin) {
        await authService.login(formData.email, formData.password, 'warden');
        navigate('/warden/dashboard');
      } else {
        if (!photoBase64) { setError('A profile photo is required to register.'); return; }
        await authService.register({ ...formData, role: 'warden', photo_url: photoBase64 });
        setError('Registration successful! Please login.');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 mesh-gradient relative overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute top-[10%] right-[10%] w-[35%] h-[50%] rounded-full bg-success/20 blur-[130px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[10%] left-[10%] w-[35%] h-[50%] rounded-full bg-primary/10 blur-[130px] animate-pulse pointer-events-none" />
      
      <div className="w-full max-w-xl z-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
        <button 
          className="mb-10 group inline-flex items-center space-x-3 text-on-surface-variant hover:text-success transition-all duration-300" 
          onClick={() => navigate('/')}
        >
          <div className="p-2 rounded-xl glass-panel group-hover:bg-success group-hover:text-white transition-all shadow-sm border border-outline/10">
            <ArrowLeft size={18} strokeWidth={3} />
          </div>
          <span className="text-xs tracking-widest uppercase font-black">Back to Portals</span>
        </button>

        <Card className="glass-panel p-10 md:p-14 border border-outline/10 shadow-2xl overflow-hidden relative group/card">
          <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-success via-primary to-secondary opacity-80" />
          
          <div className="mb-12 relative">
            <div className="inline-flex p-4 bg-success/10 text-success rounded-2xl mb-8 ring-4 ring-success/5">
              <WardenIcon size={32} strokeWidth={2.5} />
            </div>
            
            <h2 className="display-font text-4xl md:text-5xl font-black text-on-surface leading-[0.9] tracking-tighter mb-4">
              {isLogin ? 'Warden Portal' : 'Warden Registry'}
            </h2>
            <p className="text-on-surface-variant font-medium text-lg leading-relaxed max-w-md">
              {isLogin ? 'Enter your administrative credentials to manage hostel operations.' : 'Request high-level administrative access to the grievance system.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className={`p-4 rounded-xl text-xs font-bold uppercase tracking-widest border ${error.includes('successful') ? 'bg-success/10 border-success/20 text-success' : 'bg-error/10 border-error/20 text-error'}`}>
                {error}
              </div>
            )}
            {!isLogin && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4 duration-500">
                <div className="md:col-span-2 flex flex-col items-center gap-4">
                  <label className="cursor-pointer group flex flex-col items-center gap-3">
                    <div className={`w-24 h-24 rounded-full border-4 border-dashed overflow-hidden flex items-center justify-center transition-all ${
                      photoPreview ? 'border-success' : 'border-outline/20 hover:border-success/50'
                    } bg-surface-container-low`}>
                      {photoPreview
                        ? <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                        : <Camera size={28} className="text-on-surface-variant/40 group-hover:text-success transition-colors" strokeWidth={1.5} />
                      }
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 group-hover:text-success transition-colors">
                      {photoPreview ? 'Change Photo' : 'Upload Profile Photo *'}
                    </span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </div>
                <Input 
                  label="Full Name" 
                  icon={User}
                  placeholder="e.g. Dr. Satish" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required 
                />
                <Input 
                  label="Warden ID" 
                  icon={Hash}
                  placeholder="e.g. WDN-001" 
                  value={formData.warden_id}
                  onChange={e => setFormData({...formData, warden_id: e.target.value})}
                  required 
                />
                <Select 
                  label="Hostel Block" 
                  icon={Activity}
                  options={HOSTELS}
                  value={formData.hostel_id}
                  onChange={e => setFormData({...formData, hostel_id: e.target.value})}
                  required 
                />
              </div>
            )}
            
            <Input 
              label="Email Address" 
              type="email"
              icon={User}
              placeholder="e.g. warden@hostel.edu" 
              containerClassName={!isLogin ? '' : 'animate-in slide-in-from-top-4 duration-500'}
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              required 
            />

            {!isLogin && (
              <Input 
                label="Phone Number" 
                type="tel"
                placeholder="e.g. +91 98765 43210" 
                value={formData.phone_number}
                onChange={e => setFormData({...formData, phone_number: e.target.value})}
                required 
              />
            )}
            
            <Input 
              label="Secret Key" 
              type="password" 
              icon={Lock}
              placeholder="••••••••" 
              containerClassName={!isLogin ? '' : 'animate-in slide-in-from-top-4 duration-500 delay-100'}
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              required 
            />

            <Button type="submit" variant="primary" className="w-full mt-10 py-5 text-lg font-black uppercase tracking-[0.2em] shadow-2xl shadow-success/40 group relative overflow-hidden bg-success hover:bg-success/90 text-white">
              <span className="relative z-10">{isLogin ? 'Authorize Access' : 'Invoke Request'}</span>
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-[-45deg]" />
            </Button>
          </form>

          <CardFooter className="text-center pt-10 mt-10">
            <span className="text-sm font-semibold text-on-surface-variant">
              {isLogin ? "Unauthorized system? " : "Credentials active? "}
              <button 
                type="button" 
                onClick={() => setIsLogin(!isLogin)}
                className="text-success hover:text-success-fixed transition-colors font-black decoration-success/40 decoration-2 underline-offset-8 underline"
              >
                {isLogin ? 'Request Sync' : 'Login Access'}
              </button>
            </span>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
