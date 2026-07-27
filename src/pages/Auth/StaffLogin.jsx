import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardFooter } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { HardHat as StaffIcon, Lock, User, Briefcase, Hash, ArrowLeft, ShieldCheck, Camera } from 'lucide-react';
import { authService } from '../../lib/auth';

export default function StaffLogin() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    staff_id: '',
    category: '',
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
    reader.onloadend = () => {
      setPhotoBase64(reader.result);
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isLogin) {
        await authService.login(formData.email, formData.password, 'staff');
        navigate('/staff/dashboard');
      } else {
        if (!photoBase64) { setError('A profile photo is required to register.'); return; }
        await authService.register({ ...formData, role: 'staff', photo_url: photoBase64 });
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
      <div className="absolute top-[10%] right-[10%] w-[35%] h-[50%] rounded-full bg-secondary/20 blur-[130px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[10%] left-[10%] w-[35%] h-[50%] rounded-full bg-primary/10 blur-[130px] animate-pulse pointer-events-none" />
      
      <div className="w-full max-w-xl z-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
        <button 
          className="mb-10 group inline-flex items-center space-x-3 text-on-surface-variant hover:text-secondary transition-all duration-300" 
          onClick={() => navigate('/')}
        >
          <div className="p-2 rounded-xl glass-panel group-hover:bg-secondary group-hover:text-white transition-all shadow-sm border border-outline/10">
            <ArrowLeft size={18} strokeWidth={3} />
          </div>
          <span className="text-xs tracking-widest uppercase font-black">Back to Portals</span>
        </button>

        <Card className="glass-panel p-10 md:p-14 border border-outline/10 shadow-2xl overflow-hidden relative group/card">
          <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-secondary via-primary to-success opacity-80" />
          
          <div className="mb-12 relative">
            <div className="inline-flex p-4 bg-secondary/10 text-secondary rounded-2xl mb-8 ring-4 ring-secondary/5">
              <StaffIcon size={32} strokeWidth={2.5} />
            </div>
            
            <h2 className="display-font text-4xl md:text-5xl font-black text-on-surface leading-[0.9] tracking-tighter mb-4">
              {isLogin ? 'Staff Access' : 'Staff Registry'}
            </h2>
            <p className="text-on-surface-variant font-medium text-lg leading-relaxed max-w-md">
              {isLogin ? 'Access your assigned tasks and update resolution logs.' : 'Register to join the maintenance operational force.'}
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
                {/* Photo Upload */}
                <div className="md:col-span-2 flex flex-col items-center gap-4">
                  <label className="cursor-pointer group flex flex-col items-center gap-3">
                    <div className={`w-24 h-24 rounded-full border-4 border-dashed overflow-hidden flex items-center justify-center transition-all ${
                      photoPreview ? 'border-secondary' : 'border-outline/20 hover:border-secondary/50'
                    } bg-surface-container-low`}>
                      {photoPreview
                        ? <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                        : <Camera size={28} className="text-on-surface-variant/40 group-hover:text-secondary transition-colors" strokeWidth={1.5} />
                      }
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 group-hover:text-secondary transition-colors">
                      {photoPreview ? 'Change Photo' : 'Upload Profile Photo *'}
                    </span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </div>
                <Input 
                  label="Full Name" 
                  icon={User}
                  placeholder="e.g. Ramesh Kumar" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required 
                />
                <Input 
                  label="Staff ID" 
                  icon={Hash}
                  placeholder="e.g. STF-001" 
                  value={formData.staff_id}
                  onChange={e => setFormData({...formData, staff_id: e.target.value})}
                  required 
                />
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-on-surface-variant tracking-wide">
                    Specialization
                  </label>
                  <div className="relative group transition-all duration-300">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors duration-300">
                      <Briefcase size={20} strokeWidth={2} />
                    </div>
                    <select 
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-surface-container-low border border-outline/10 text-on-surface rounded-xl py-3 pl-12 pr-4 transition-all duration-300 outline-none focus:bg-surface focus:border-secondary/40 focus:ring-4 focus:ring-secondary/10 hover:border-secondary/20 appearance-none"
                    >
                      <option value="">Select Specialization</option>
                      <option value="electrician">Electrician</option>
                      <option value="plumber">Plumber</option>
                      <option value="carpenter">Carpenter</option>
                      <option value="housekeeping">Housekeeping</option>
                      <option value="painter">Painter</option>
                      <option value="technician">Technician</option>
                      <option value="fire fighter">Fire Fighter</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            <Input 
              label="Email Address" 
              type="email"
              icon={User}
              placeholder="e.g. staff@hostel.edu" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              containerClassName={!isLogin ? '' : 'animate-in slide-in-from-top-4 duration-500'}
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
              label="Password" 
              type="password" 
              icon={Lock}
              placeholder="••••••••" 
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              containerClassName={!isLogin ? '' : 'animate-in slide-in-from-top-4 duration-500 delay-100'}
              required 
            />

            <Button type="submit" variant="secondary" className="w-full mt-10 py-5 text-lg font-black uppercase tracking-[0.2em] shadow-2xl shadow-secondary/40 group relative overflow-hidden bg-secondary hover:bg-secondary/90 text-white">
              <span className="relative z-10">{isLogin ? 'Enter Portal' : 'Submit Registry'}</span>
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-[-45deg]" />
            </Button>
          </form>

          <CardFooter className="text-center pt-10 mt-10">
            <span className="text-sm font-semibold text-on-surface-variant">
              {isLogin ? "Not yet verified? " : "Already registered? "}
              <button 
                type="button" 
                onClick={() => setIsLogin(!isLogin)}
                className="text-secondary hover:text-secondary-fixed transition-colors font-black decoration-secondary/40 decoration-2 underline-offset-8 underline"
              >
                {isLogin ? 'Join Force' : 'Login Access'}
              </button>
            </span>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
