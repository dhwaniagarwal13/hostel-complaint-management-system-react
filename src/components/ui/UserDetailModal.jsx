import React, { useState } from 'react';
import { X, User, Mail, MapPin, Award, HardHat, Phone, Maximize2 } from 'lucide-react';
import Button from './Button';
import ImageViewer from './ImageViewer';

export default function UserDetailModal({ user, onClose }) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  
  if (!user) return null;

  const getRoleDisplay = (role) => {
    const roleMap = {
      student: 'Resident',
      staff: 'Maintenance Staff',
      warden: 'Warden',
      supervisor: 'System Supervisor'
    };
    return roleMap[role] || role;
  };

  const getDetailFields = (user) => {
    const common = [
      { label: 'Email', value: user.email, icon: Mail },
      { label: 'Phone Number', value: user.phone_number, icon: Phone }
    ];

    if (user.role === 'student') {
      return [
        { label: 'Registration Number', value: user.registration_number, icon: Award },
        { label: 'Room Number', value: user.room_number, icon: MapPin },
        ...common
      ];
    } else if (user.role === 'staff') {
      return [
        { label: 'Staff ID', value: user.staff_id, icon: Award },
        { label: 'Specialization', value: user.category || 'N/A', icon: HardHat },
        ...common
      ];
    } else if (user.role === 'warden') {
      return [
        { label: 'Warden ID', value: user.staff_id || user.warden_id, icon: Award },
        { label: 'Hostel Assignment', value: user.hostel_id, icon: MapPin },
        ...common
      ];
    }
    
    return common;
  };

  const detailFields = getDetailFields(user);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-xl bg-surface/80 animate-in fade-in duration-300">
        <div className="absolute inset-0 z-[-1] mesh-gradient opacity-20" />
        
        <div className="w-full max-w-md bg-surface-container-low border-2 border-outline-variant p-0 relative shadow-[0_64px_96px_-12px_rgba(30,27,75,0.2)] overflow-hidden rounded-3xl animate-in zoom-in-95 duration-300">
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-3 rounded-2xl bg-surface-container-high text-on-surface-variant hover:text-primary hover:rotate-90 transition-all duration-500 z-10"
          >
            <X size={20} strokeWidth={3} />
          </button>
  
          {/* Profile Picture Section */}
          <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden group/image">
            {user.photo_url ? (
              <>
                <img 
                  src={user.photo_url} 
                  alt={user.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-110"
                />
                {/* View Full Image Button */}
                <button
                  onClick={() => setIsViewerOpen(true)}
                  className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface/60 backdrop-blur-md border border-white/20 text-on-surface hover:bg-primary hover:text-white transition-all shadow-lg opacity-0 translate-y-2 group-hover/image:opacity-100 group-hover/image:translate-y-0 duration-300"
                >
                  <Maximize2 size={14} strokeWidth={3} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Full Image</span>
                </button>
              </>
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border-4 border-primary/40">
                <User size={48} className="text-primary" strokeWidth={1.5} />
              </div>
            )}
          </div>
  
          {/* Content Section */}
          <div className="p-8">
            {/* Name and Role */}
            <div className="mb-8">
              <h2 className="display-font text-3xl font-black text-on-surface leading-tight mb-2 tracking-tight">
                {user.name}
              </h2>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                <Award size={12} className="text-primary" strokeWidth={2} />
                <span className="text-xs font-black text-primary uppercase tracking-widest">
                  {getRoleDisplay(user.role)}
                </span>
              </div>
            </div>
  
            {/* Details Grid */}
            <div className="space-y-4 mb-8">
              {detailFields.map((field) => {
                const Icon = field.icon;
                return (
                  <div key={field.label} className="pb-4 border-b border-outline/5 last:border-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <Icon size={14} className="text-on-surface-variant/50" strokeWidth={2.5} />
                      </div>
                      <div className="flex-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-on-surface-variant/60 block mb-1">
                          {field.label}
                        </span>
                        <span className="text-sm font-bold text-on-surface block break-words">
                          {field.value || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
  
            {/* Close Button */}
            <Button 
              onClick={onClose}
              className="w-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-black uppercase py-3 rounded-xl transition-all"
            >
              Close Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Image Viewer Overlay */}
      {user.photo_url && (
        <ImageViewer 
          images={[user.photo_url]} 
          currentIndex={0} 
          isOpen={isViewerOpen} 
          onClose={() => setIsViewerOpen(false)} 
        />
      )}
    </>
  );
}
