import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PortalLayout from '../../layouts/PortalLayout';
import { Card, CardHeader } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import { authService } from '../../lib/auth';
import {
  ArrowLeft,
  Zap,
  Droplet,
  Brush,
  Wifi,
  MoreHorizontal,
  MapPin,
  FileText,
  AlertTriangle,
  Send,
  ZapOff,
  LayoutGrid,
  Plus,
  Flame,
  FlameKindling,
  Hammer,
  Home,
  Palette,
  Wrench,
  Sparkles,
  Camera,
  ImagePlus,
  X as XIcon,
  Image as ImageIcon
} from 'lucide-react';

const categories = [
  { id: 'Electrical', icon: Zap, emoji: '⚡', color: '#facc15' },
  { id: 'Plumbing', icon: Wrench, emoji: '🔧', color: '#94a3b8' },
  { id: 'Water', icon: Droplet, emoji: '💧', color: '#38bdf8' },
  { id: 'Internet', icon: Wifi, emoji: '🌐', color: '#ffffff' },
  { id: 'Carpentry', icon: Hammer, emoji: '🪑', color: '#854d0e' },
  { id: 'Housekeeping', icon: Home, emoji: '🧹', color: '#22c55e' },
  { id: 'Painting', icon: Brush, emoji: '🎨', color: '#a855f7' },
  { id: 'Fire Safety', icon: Flame, emoji: '🔥', color: '#ef4444' },
  { id: 'Other', icon: MoreHorizontal, emoji: '💬', color: '#64748b' },
];

export default function NewComplaint() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: '',
    location: '',
    description: '',
    severity: 'normal'
  });
  const [photos, setPhotos] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = React.useRef(null);
  const streamRef = React.useRef(null);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 3) {
      alert('Maximum 3 photos allowed.');
      return;
    }
    files.forEach(file => {
      if (file.size > 2 * 1024 * 1024) {
        alert(`"${file.name}" exceeds 2MB. Skipped.`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setPhotos(prev => [...prev, reader.result]);
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert('Camera access denied or unavailable.');
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
    setPhotos(prev => [...prev, dataUrl]);
    stopCamera();
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const menuItems = [
    { id: 'dashboard', label: 'Overview', path: '/student/dashboard', icon: LayoutGrid },
    { id: 'new', label: 'Raise Issue', path: '/student/new-complaint', icon: Plus }
  ];

  const handleSubmit = async (e, isEmergency = false) => {
    e.preventDefault();
    const currentUser = authService.getCurrentUser();

    if (!formData.category) {
      alert("Please select a classification category.");
      return;
    }

    try {
      const { error } = await supabase.from('complaints').insert([{
        student_id: currentUser.id,
        hostel_id: currentUser.hostel_id,
        category: formData.category,
        location: formData.location,
        description: formData.description,
        severity: formData.severity,
        is_emergency: isEmergency,
        photos: photos.length > 0 ? photos : []
      }]);

      if (error) throw error;
      navigate('/student/dashboard');
    } catch (error) {
      console.error('Submission failed:', error);
      alert('Failed to transmit grievance');
    }
  };

  return (
    <PortalLayout menuItems={menuItems} roleName="Student">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <button
            onClick={() => navigate('/student/dashboard')}
            className="group mb-8 inline-flex items-center gap-3 text-on-surface-variant hover:text-primary transition-all duration-300"
          >
            <div className="p-2 rounded-xl glass-panel group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
              <ArrowLeft size={18} strokeWidth={3} />
            </div>
            <span className="text-xs tracking-widest uppercase font-black">Back to Overview</span>
          </button>

          <h1 className="display-font text-5xl md:text-6xl font-black text-on-surface leading-[0.8] tracking-tighter mb-4 animate-in fade-in slide-in-from-left-6 duration-700">
            Report an <span className="text-primary text-glow-primary">Issue.</span>
          </h1>
          <p className="text-on-surface-variant font-medium text-lg max-w-lg animate-in fade-in slide-in-from-left-8 duration-1000">
            Detailed intelligence helps us prioritize and resolve your grievance with clinical precision.
          </p>
        </div>

        <Card variant="glass" className="p-10 md:p-16 border-2 border-outline/5 relative overflow-hidden animate-in fade-in zoom-in-95 duration-1000 delay-300">
          <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-primary via-secondary to-tertiary opacity-80" />

          <form className="space-y-12" onSubmit={handleSubmit}>

            {/* Category Selection */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 border-b border-outline/10 pb-4">
                <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                  <LayoutGrid size={20} strokeWidth={3} />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">1. Classification</h3>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map(cat => {
                  const Icon = cat.icon;
                  const isActive = formData.category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.id })}
                      style={{
                        borderColor: isActive ? cat.color : `${cat.color}40`,
                        boxShadow: isActive ? `0 0 35px ${cat.color}50` : `0 0 25px ${cat.color}20`
                      }}
                      className={`
                        group relative p-8 rounded-[2rem] border-2 transition-all duration-500 flex flex-col items-center gap-5 overflow-hidden
                        ${isActive
                          ? `bg-surface-container-high scale-[1.02] ring-8 ring-white/5`
                          : `bg-surface-container-low hover:bg-surface-container-high`
                        }
                      `}
                    >
                      {/* Accent Glow Background */}
                      {(isActive || true) && (
                        <div
                          className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${isActive ? 'opacity-10 animate-pulse' : 'opacity-[0.03]'}`}
                          style={{ background: `radial-gradient(circle at center, ${cat.color} 0%, transparent 70%)` }}
                        />
                      )}

                      <div className={`
                        p-5 rounded-2xl transition-all duration-500 relative
                        ${isActive ? 'bg-surface shadow-inner' : 'bg-surface shadow-sm group-hover:scale-110'}
                      `}>
                        <Icon size={28} strokeWidth={isActive ? 3 : 2.5} style={{ color: cat.color }} />

                        {/* Emoji Overlay */}
                        <div className="absolute -top-2 -right-2 text-xl drop-shadow-lg opacity-80 group-hover:opacity-100 transition-opacity">
                          {cat.emoji}
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`} style={{ color: isActive ? cat.color : 'inherit' }}>
                          {cat.id}
                        </span>
                        {isActive && (
                          <div className="h-1 w-8 rounded-full animate-in zoom-in duration-500" style={{ backgroundColor: cat.color }} />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Location & Description */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 border-b border-outline/10 pb-4">
                <div className="p-2.5 bg-secondary/10 text-secondary rounded-xl">
                  <MapPin size={20} strokeWidth={3} />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-secondary">2. Situational Intel</h3>
              </div>

              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.25em] text-on-surface-variant/50 ml-1 block">Specific Location</label>
                  <Input
                    placeholder="e.g. Room 420, 2nd Floor Washroom"
                    icon={MapPin}
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.25em] text-on-surface-variant/50 ml-1 block">Detailed Description</label>
                  <div className="relative group transition-all duration-300">
                    <div className="absolute left-5 top-5 text-on-surface-variant group-focus-within:text-primary transition-colors duration-300">
                      <FileText size={20} strokeWidth={2.5} />
                    </div>
                    <textarea
                      rows="5"
                      className="
                        w-full bg-surface-container-low border-2 border-outline/5 rounded-2xl p-6 pl-14 
                        text-on-surface outline-none transition-all duration-300 font-medium
                        focus:border-primary/40 focus:ring-8 focus:ring-primary/5
                        hover:border-primary/20 resize-none
                        placeholder:text-on-surface-variant/30
                      "
                      placeholder="Explain the technical or mechanical anomaly in detail..."
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Photo Evidence */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 border-b border-outline/10 pb-4">
                <div className="p-2.5 bg-success/10 text-success rounded-xl">
                  <ImageIcon size={20} strokeWidth={3} />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-success">3. Visual Evidence (Optional)</h3>
              </div>

              {/* Photo Previews */}
              {photos.length > 0 && (
                <div className="flex gap-4 flex-wrap">
                  {photos.map((photo, idx) => (
                    <div key={idx} className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-outline/10 group shadow-lg">
                      <img src={photo} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute top-1 right-1 w-6 h-6 bg-error text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xl"
                      >
                        <XIcon size={12} strokeWidth={3} />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] font-black uppercase tracking-widest text-center py-1">
                        Photo {idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Camera Modal */}
              {showCamera && (
                <div className="relative rounded-3xl overflow-hidden bg-black border-2 border-success/30 shadow-2xl">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-64 object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <Button
                      type="button"
                      onClick={capturePhoto}
                      className="py-3 px-8 bg-success text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-success/40 gap-2"
                    >
                      <Camera size={16} strokeWidth={3} />
                      Capture
                    </Button>
                    <Button
                      type="button"
                      onClick={stopCamera}
                      variant="secondary"
                      className="py-3 px-6 text-[10px] font-black uppercase tracking-widest border border-white/20 text-white shadow-none"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Upload Actions */}
              {photos.length < 3 && !showCamera && (
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="flex-1 flex flex-col items-center justify-center gap-3 p-8 bg-surface-container-low border-2 border-dashed border-success/20 rounded-2xl hover:border-success/50 hover:bg-success/5 transition-all duration-500 group cursor-pointer"
                  >
                    <div className="p-4 rounded-2xl bg-success/10 text-success group-hover:scale-110 transition-transform">
                      <Camera size={28} strokeWidth={2} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-success/70 group-hover:text-success transition-colors">Open Camera</span>
                  </button>

                  <label className="flex-1 flex flex-col items-center justify-center gap-3 p-8 bg-surface-container-low border-2 border-dashed border-primary/20 rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all duration-500 group cursor-pointer">
                    <div className="p-4 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                      <ImagePlus size={28} strokeWidth={2} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/70 group-hover:text-primary transition-colors">Browse Device</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              <p className="text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-widest text-center">
                Max 3 photos • 2MB each • JPG/PNG supported
              </p>
            </div>

            {/* Severity Selection */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 border-b border-outline/10 pb-4">
                <div className="p-2.5 bg-tertiary/10 text-tertiary rounded-xl">
                  <AlertTriangle size={20} strokeWidth={3} />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-tertiary">4. Criticality</h3>
              </div>

              <div className="flex flex-wrap gap-3 bg-surface-container-low p-2 rounded-2xl border-2 border-outline/5 w-fit">
                {[
                  { id: 'mild', label: 'Mild Anomaly', color: 'bg-emerald-500' },
                  { id: 'normal', label: 'Standard Case', color: 'bg-primary' },
                  { id: 'extreme', label: 'High Priority', color: 'bg-tertiary' }
                ].map(sev => (
                  <button
                    key={sev.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, severity: sev.id })}
                    className={`
                      px-6 py-3 rounded-xl text-xs font-black uppercase tracking-[0.15em] transition-all duration-500 flex items-center gap-3
                      ${formData.severity === sev.id
                        ? 'bg-surface shadow-[0_8px_24px_rgba(0,0,0,0.1)] text-on-surface scale-105'
                        : 'text-on-surface-variant opacity-50 hover:opacity-100 hover:bg-surface/50'
                      }
                    `}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full ${sev.color} ${formData.severity === sev.id ? 'animate-pulse' : ''}`} />
                    {sev.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Footer Actions */}
            <div className="pt-10 border-t border-outline/10 flex flex-col md:flex-row gap-6">
              <Button type="submit" className="flex-1 py-6 text-sm font-black uppercase tracking-[0.3em] gap-3 shadow-2xl shadow-primary/30 active:scale-[0.98] transition-transform">
                <Send size={20} strokeWidth={3} />
                Transmit Grievance
              </Button>

              <Button
                type="button"
                variant="danger"
                onClick={(e) => handleSubmit(e, true)}
                className="py-6 px-10 text-sm font-black uppercase tracking-[0.3em] gap-3 bg-tertiary shadow-2xl shadow-tertiary/30 active:scale-[0.98] transition-transform"
              >
                <ZapOff size={20} strokeWidth={3} />
                Immediate Crisis
              </Button>
            </div>

            <p className="text-center text-[10px] font-black uppercase tracking-[0.4em] text-on-surface-variant opacity-40">
              System generated logs will be archived for audit
            </p>
          </form>
        </Card>
      </div>
    </PortalLayout>
  );
}
