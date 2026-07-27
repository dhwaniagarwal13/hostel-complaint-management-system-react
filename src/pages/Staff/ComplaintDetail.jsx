import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PortalLayout from '../../layouts/PortalLayout';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import { 
  ArrowLeft, 
  MapPin, 
  Tag, 
  FileText, 
  Image as ImageIcon, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Hammer,
  Send,
  User,
  Calendar,
  ChevronRight,
  ShieldAlert,
  Camera,
  ImagePlus,
  X
} from 'lucide-react';

import { supabase } from '../../lib/supabase';

export default function StaffComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = React.useRef(null);
  const streamRef = React.useRef(null);

  useEffect(() => {
    const fetchComplaint = async () => {
      const { data } = await supabase.from('complaints').select('*').eq('id', id).single();
      if (data) {
        setComplaint(data);
        // Pre-fill notes if they already exist in description hack
        if (data.description && data.description.includes('--- STAFF LOG ---')) {
           const parts = data.description.split('--- STAFF LOG ---');
           const matchNote = parts[1].match(/NOTES:(.*?)(IMAGE:|$)/s);
           if (matchNote && matchNote[1]) setNotes(matchNote[1].trim());
        }
      }
      setLoading(false);
    };
    if (id) fetchComplaint();
  }, [id]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image exceeds 2MB limit. Please upload a smaller image.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setImageBase64(reader.result);
      reader.readAsDataURL(file);
    }
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
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setImageBase64(dataUrl);
    stopCamera();
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const updateStatus = async (newStatus) => {
    try {
      // Require photo for resolution
      if (newStatus === 'resolved' && !imageBase64) {
        alert('A photo of the resolved area is required before marking this complaint as resolved.');
        return;
      }

      let finalDescription = complaint.description;
      // Clean previous staff log injections if present to avoid duplicating
      if (finalDescription && finalDescription.includes('--- STAFF LOG ---')) {
        finalDescription = finalDescription.split('--- STAFF LOG ---')[0].trim();
      }

      if (newStatus === 'resolved') {
        finalDescription += `\n\n--- STAFF LOG ---\nNOTES:${notes || 'Issue resolved.'}\nIMAGE:${imageBase64 || 'NO_IMAGE'}`;
      }

      setComplaint({...complaint, status: newStatus, description: finalDescription});
      await supabase.from('complaints').update({ status: newStatus, description: finalDescription, resolved_at: new Date().toISOString() }).eq('id', id);
      alert(newStatus === 'resolved' ? "Task resolved. Documentation sent to Operations." : "Status updated.");
    } catch (e) {
      console.error(e);
      alert('Failed to sync status update to central records.');
    }
  };

  const menuItems = [
    { id: 'tasks', label: 'My Queue', path: '/staff/dashboard', icon: Hammer }
  ];

  if (loading) return (
    <PortalLayout menuItems={menuItems} roleName="Staff">
      <div className="flex justify-center items-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin">
            <Hammer size={40} strokeWidth={2} className="text-secondary" />
          </div>
          <span className="text-on-surface-variant font-black">Loading task details...</span>
        </div>
      </div>
    </PortalLayout>
  );

  if (!complaint) return (
    <PortalLayout menuItems={menuItems} roleName="Staff">
      <div className="flex justify-center items-center h-[60vh] text-error font-black uppercase text-xl">
        Anomaly Ref Not Found.
      </div>
    </PortalLayout>
  );

  return (
    <PortalLayout menuItems={menuItems} roleName="Staff">
      <div className="max-w-6xl mx-auto">
        {/* Navigation & Header */}
        <div className="mb-12">
          <button 
            onClick={() => navigate('/staff/dashboard')} 
            className="group mb-8 inline-flex items-center gap-3 text-on-surface-variant hover:text-secondary transition-all duration-300"
          >
            <div className="p-2 rounded-xl glass-panel group-hover:bg-secondary group-hover:text-white transition-all shadow-sm">
              <ArrowLeft size={18} strokeWidth={3} />
            </div>
            <span className="text-xs tracking-widest uppercase font-black">Back to Queue</span>
          </button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4 animate-in fade-in slide-in-from-left-4 duration-700">
                <div className="px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Reference: {complaint.id.substring(0,8).toUpperCase()}</span>
                </div>
                <StatusBadge status={complaint.status} />
              </div>
              <h1 className="display-font text-5xl md:text-6xl font-black text-on-surface leading-[0.8] tracking-tighter mb-4 animate-in fade-in slide-in-from-left-6 duration-700">
                {complaint.category} <span className="text-secondary text-glow-primary">Protocol.</span>
              </h1>
              <p className="text-on-surface-variant font-medium text-lg max-w-lg mb-2">
                Operational tactical unit dispatched for site restoration.
              </p>
            </div>
            
            <div className="flex items-center gap-4 bg-surface-container-low p-4 rounded-2xl border border-outline/5 animate-in fade-in slide-in-from-right-6 duration-700">
              <div className="p-3 bg-secondary/10 text-secondary rounded-xl">
                <Calendar size={20} strokeWidth={3} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant block opacity-60">Entry Date</span>
                <span className="text-sm font-black text-on-surface uppercase tracking-tight">{new Date(complaint.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Intelligence Card */}
          <Card variant="glass" className="lg:col-span-2 p-10 md:p-14 border border-outline/10 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-secondary via-primary to-success opacity-80" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
              <div className="space-y-3 p-6 bg-surface-container-low rounded-2xl border border-outline/5">
                <div className="flex items-center gap-3 text-secondary mb-1">
                  <MapPin size={18} strokeWidth={3} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Operational Zone</span>
                </div>
                <span className="text-sm font-black text-on-surface uppercase tracking-tight block">{complaint.hostel_id} • {complaint.location}</span>
              </div>
              
              <div className="space-y-3 p-6 bg-surface-container-low rounded-2xl border border-outline/5">
                <div className="flex items-center gap-3 text-primary mb-1">
                  <Tag size={18} strokeWidth={3} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Classification</span>
                </div>
                <span className="text-sm font-black text-on-surface uppercase tracking-tight block">Tactical / {complaint.category}</span>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-on-surface-variant font-black uppercase text-[10px] tracking-widest border-b border-outline/5 pb-4">
                  <FileText size={16} strokeWidth={3} />
                  Narrative Intelligence
                </div>
                <div className="p-8 bg-surface-container-low/50 rounded-3xl border border-outline/5 relative italic text-on-surface leading-relaxed font-medium text-lg">
                  <div className="absolute top-4 left-4 text-secondary/20">
                    <AlertCircle size={40} strokeWidth={1} />
                  </div>
                  "{complaint.description.split('--- STAFF LOG ---')[0].trim()}"
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 text-on-surface-variant font-black uppercase text-[10px] tracking-widest border-b border-outline/5 pb-4">
                  <ImageIcon size={16} strokeWidth={3} />
                  Resident's Evidence Documentation
                </div>
                {complaint.photos && complaint.photos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {complaint.photos.map((photo, idx) => (
                      <div key={idx} className="group relative">
                        <div className="aspect-square bg-surface-container-high rounded-2xl border border-outline/5 flex items-center justify-center overflow-hidden hover:border-primary transition-all hover:shadow-lg hover:shadow-primary/20">
                          <img 
                            src={photo}
                            alt={`Evidence ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <span className="text-[8px] font-black uppercase text-primary bg-white/80 px-2 py-1 rounded-lg">Photo {idx + 1}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {[...Array(Math.max(0, 4 - complaint.photos.length))].map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-square bg-surface-container-low rounded-2xl border border-dashed border-outline/20 flex flex-col items-center justify-center gap-3 opacity-40">
                        <ImageIcon size={24} strokeWidth={1.5} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-2xl border border-dashed border-outline/20 opacity-50">
                    <ImageIcon size={24} strokeWidth={1.5} className="mx-auto mb-2 opacity-50" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">No evidence photos uploaded</span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Action & Status Card */}
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-1000">
            <Card variant="glass" className="p-8 border border-outline/10 shadow-2xl relative overflow-hidden group/status">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-primary/10 text-primary rounded-xl">
                  <Clock size={20} strokeWidth={3} />
                </div>
                <h3 className="display-font text-2xl font-black text-on-surface tracking-tighter uppercase">Update Status</h3>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => updateStatus('in_progress')}
                  className={`
                    w-full p-6 rounded-2xl transition-all duration-500 flex items-center justify-between group/btn
                    ${complaint.status === 'in_progress' 
                      ? 'bg-secondary text-white shadow-xl shadow-secondary/30 ring-4 ring-secondary/10' 
                      : 'bg-surface-container-low border border-outline/5 text-on-surface-variant hover:border-secondary/40'
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    <Clock size={20} strokeWidth={3} className={complaint.status === 'in_progress' ? 'animate-spin-slow' : ''} />
                    <span className="text-xs font-black uppercase tracking-widest">In Progress</span>
                  </div>
                  <ChevronRight size={16} strokeWidth={4} className={complaint.status === 'in_progress' ? 'opacity-100' : 'opacity-0'} />
                </button>
                
                <button 
                  onClick={() => updateStatus('resolved')}
                  disabled={!imageBase64}
                  className={`
                    w-full p-6 rounded-2xl transition-all duration-500 flex items-center justify-between group/btn
                    ${complaint.status === 'resolved' 
                      ? 'bg-success text-white shadow-xl shadow-success/30 ring-4 ring-success/10' 
                      : imageBase64
                      ? 'bg-surface-container-low border border-outline/5 text-on-surface-variant hover:border-success/40 cursor-pointer'
                      : 'bg-surface-container-low/50 border border-outline/5 text-on-surface-variant/50 cursor-not-allowed opacity-60'
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    <CheckCircle2 size={20} strokeWidth={3} />
                    <div className="text-left">
                      <span className="text-xs font-black uppercase tracking-widest block">Resolved</span>
                      {!imageBase64 && complaint.status !== 'resolved' && (
                        <span className="text-[8px] font-black uppercase text-warn/70 tracking-widest block mt-1">⚠ Requires Photo</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={16} strokeWidth={4} className={complaint.status === 'resolved' ? 'opacity-100' : 'opacity-0'} />
                </button>
              </div>

                <div className="mt-10 pt-8 border-t border-outline/5 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-on-surface-variant/10 text-on-surface-variant rounded-lg">
                      <ShieldAlert size={16} strokeWidth={2.5} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 leading-relaxed italic">
                      Resolution will package and transmit your documentation logs natively to the Warden.
                    </p>
                  </div>
                </div>

                {/* Decorative background icon */}
                <div className="absolute bottom-[-20] right-[-20] opacity-[0.03] select-none pointer-events-none group-hover/status:scale-110 transition-transform duration-1000">
                  <CheckCircle2 size={120} strokeWidth={1} />
                </div>
              </Card>

              <Card variant="glass" className="p-8 border border-outline/10 bg-secondary/[0.02]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-2 bg-secondary/10 text-secondary rounded-lg">
                    <Send size={16} strokeWidth={3} />
                  </div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">Resolution Log & Media</h4>
                </div>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline/5 rounded-xl p-4 text-sm font-medium outline-none focus:border-secondary/40 transition-all min-h-[120px] resize-none mb-4"
                  placeholder="Enter completion details, replacement parts, or operational hazards encountered..."
                />
                
                <div className="mb-6 relative">
                  {showCamera ? (
                    <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-secondary/30 shadow-2xl">
                      <video ref={videoRef} autoPlay playsInline className="w-full h-48 object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-3 p-4 bg-gradient-to-t from-black/80 to-transparent">
                        <Button
                          type="button"
                          onClick={capturePhoto}
                          className="py-2 px-6 bg-secondary text-white text-[10px] font-black uppercase tracking-widest gap-2"
                        >
                          <Camera size={14} strokeWidth={3} />
                          Capture
                        </Button>
                        <Button
                          type="button"
                          onClick={stopCamera}
                          variant="secondary"
                          className="py-2 px-4 text-[10px] font-black uppercase tracking-widest border border-white/20 text-white shadow-none"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : imageBase64 ? (
                    <div className="relative group">
                      <img src={imageBase64} alt="Evidentiary proof" className="h-48 w-full object-cover rounded-xl shadow-xl border-2 border-secondary/20" />
                      <button 
                        onClick={() => setImageBase64('')}
                        className="absolute top-2 right-2 p-2 bg-error text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <X size={14} strokeWidth={3} />
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={startCamera}
                        className="flex flex-col items-center justify-center p-6 bg-surface-container-low rounded-2xl border-2 border-dashed border-secondary/20 hover:border-secondary/50 hover:bg-secondary/5 transition-all group"
                      >
                        <div className="p-3 rounded-xl bg-secondary/10 text-secondary group-hover:scale-110 transition-transform">
                          <Camera size={24} strokeWidth={2.5} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-secondary/70 mt-3">Open Camera</span>
                      </button>

                      <label className="flex flex-col items-center justify-center p-6 bg-surface-container-low rounded-2xl border-2 border-dashed border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all group cursor-pointer">
                        <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                          <ImagePlus size={24} strokeWidth={2.5} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/70 mt-3">Browse File</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageUpload} 
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={() => updateStatus('resolved')}
                  disabled={!imageBase64}
                  className={`w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-secondary/30 ${
                    imageBase64
                      ? 'bg-secondary hover:bg-secondary/90 text-white'
                      : 'bg-surface-container-low text-on-surface-variant/50 cursor-not-allowed opacity-60'
                  }`}
                >
                  {imageBase64 ? 'Confirm & Sync Log' : '⚠ Requires Photo Upload'}
                </Button>
              </Card>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
