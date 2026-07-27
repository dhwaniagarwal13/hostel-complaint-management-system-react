import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PortalLayout from '../layouts/PortalLayout';
import { Card } from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import { Camera, Mail, Home, Badge, Edit2, ArrowLeft, Phone, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { authService } from '../lib/auth';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(authService.getCurrentUser());
  const [isEditMode, setIsEditMode] = useState(false);
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [photoPreview, setPhotoPreview] = useState(userProfile?.photo_url || null);
  const [editData, setEditData] = useState({
    name: userProfile?.name || '',
    email: userProfile?.email || '',
    phone_number: userProfile?.phone_number || '',
    staff_id: userProfile?.staff_id || '',
    warden_id: userProfile?.warden_id || '',
    registration_number: userProfile?.registration_number || '',
    room_number: userProfile?.room_number || '',
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  // Update state when userProfile changes
  useEffect(() => {
    const updated = authService.getCurrentUser();
    if (updated) {
      setUserProfile(updated);
      setPhotoPreview(updated.photo_url || null);
      setEditData({
        name: updated.name || '',
        email: updated.email || '',
        phone_number: updated.phone_number || '',
        staff_id: updated.staff_id || '',
        warden_id: updated.warden_id || '',
        registration_number: updated.registration_number || '',
        room_number: updated.room_number || '',
      });
    }
  }, []);

  const menuItems = [
    { id: 'profile', label: 'Profile', path: '/profile', icon: 'User' },
  ];

  const handleVerifyPassword = async () => {
    setPasswordError('');
    if (password.length < 6) {
      setPasswordError('Please enter your password (minimum 6 characters)');
      return;
    }
    setPasswordVerified(true);
    setPassword('');
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setEditData({...editData, photo_url: reader.result});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveError('');
    setSaveSuccess('');
    
    try {
      const updateData = {
        name: editData.name,
        email: editData.email,
        phone_number: editData.phone_number,
        staff_id: editData.staff_id || null,
        warden_id: editData.warden_id || null,
        registration_number: editData.registration_number || null,
        room_number: editData.room_number || null,
      };
      
      if (editData.photo_url) {
        updateData.photo_url = editData.photo_url;
      }

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userProfile.id);

      if (error) throw error;

      const updatedUser = {
        ...userProfile,
        ...updateData,
      };
      
      // Update localStorage
      localStorage.setItem('hostel_care_session', JSON.stringify(updatedUser));
      
      // Update component state
      setUserProfile(updatedUser);
      setPhotoPreview(updatedUser.photo_url || null);

      setSaveSuccess('Profile updated successfully!');
      setTimeout(() => {
        setIsEditMode(false);
        setPasswordVerified(false);
        setSaveSuccess('');
      }, 1500);
    } catch (err) {
      setSaveError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const getRoleDisplay = (role) => {
    const roleMap = {
      student: 'Resident',
      staff: 'Maintenance Staff',
      warden: 'Warden',
      supervisor: 'System Supervisor'
    };
    return roleMap[role] || role;
  };

  if (!userProfile) return null;

  return (
      <PortalLayout menuItems={menuItems} roleName={getRoleDisplay(userProfile.role)}>
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="mb-8 inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors"
      >
        <ArrowLeft size={18} strokeWidth={2.5} />
        <span className="text-xs font-black uppercase tracking-widest">Back</span>
      </button>

      {/* Profile Header */}
      <div className="mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 mb-4">
          <Badge size={14} className="text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">User Profile • {getRoleDisplay(userProfile.role)}</span>
        </div>
        <h1 className="display-font text-5xl md:text-6xl font-black text-on-surface leading-[0.8] tracking-tighter mb-4">
          My <span className="text-primary">Profile</span>
        </h1>
      </div>

      {!isEditMode ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <Card variant="glass" className="lg:col-span-1 p-10 border border-outline/10 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              {/* Profile Picture */}
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/30 bg-surface-container-high flex items-center justify-center mb-6">
                {userProfile?.photo_url ? (
                  <img src={userProfile.photo_url} alt={userProfile.name} className="w-full h-full object-cover" />
                ) : (
                  <Camera size={48} className="text-on-surface-variant/40" strokeWidth={1.5} />
                )}
              </div>

              {/* Name */}
              <h2 className="text-3xl font-black text-on-surface mb-2">{userProfile?.name}</h2>
              <p className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-8">
                {getRoleDisplay(userProfile.role)}
              </p>

              {/* Quick Stats */}
              <div className="w-full space-y-3 text-left">
                {userProfile?.staff_id && (
                  <div className="p-3 bg-surface-container-low rounded-lg">
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Staff ID</p>
                    <p className="text-sm font-bold text-on-surface">{userProfile.staff_id}</p>
                  </div>
                )}
                {userProfile?.warden_id && (
                  <div className="p-3 bg-surface-container-low rounded-lg">
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Warden ID</p>
                    <p className="text-sm font-bold text-on-surface">{userProfile.warden_id}</p>
                  </div>
                )}
                {userProfile?.registration_number && (
                  <div className="p-3 bg-surface-container-low rounded-lg">
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Registration No.</p>
                    <p className="text-sm font-bold text-on-surface">{userProfile.registration_number}</p>
                  </div>
                )}
              </div>

              <Button 
                onClick={() => setIsEditMode(true)}
                className="w-full mt-8 gap-2 font-black uppercase text-xs tracking-widest py-4"
              >
                <Edit2 size={16} strokeWidth={2.5} />
                Edit Information
              </Button>
            </div>
          </Card>

          {/* Details Card */}
          <Card variant="glass" className="lg:col-span-2 p-10 border border-outline/10 shadow-2xl">
            <h3 className="text-2xl font-black text-on-surface mb-8">Account Information</h3>
            <div className="space-y-6">
              <div className="p-6 bg-surface-container-high rounded-xl border border-outline/5">
                <div className="flex items-center gap-2 mb-2">
                  <Mail size={16} className="text-on-surface-variant" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Email Address</p>
                </div>
                <p className="text-lg font-bold text-on-surface break-all">{userProfile?.email}</p>
              </div>
              
              <div className="p-6 bg-surface-container-high rounded-xl border border-outline/5">
                <div className="flex items-center gap-2 mb-2">
                  <Phone size={16} className="text-on-surface-variant" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Phone Number</p>
                </div>
                <p className="text-lg font-bold text-on-surface">{userProfile?.phone_number || 'Not provided'}</p>
              </div>

              {userProfile?.hostel_id && (
                <div className="p-6 bg-surface-container-high rounded-xl border border-outline/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Home size={16} className="text-on-surface-variant" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Hostel Assignment</p>
                  </div>
                  <p className="text-lg font-bold text-on-surface">{userProfile.hostel_id}</p>
                </div>
              )}

              {userProfile?.room_number && (
                <div className="p-6 bg-surface-container-high rounded-xl border border-outline/5">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={16} className="text-on-surface-variant" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Room Number</p>
                  </div>
                  <p className="text-lg font-bold text-on-surface">{userProfile.room_number}</p>
                </div>
              )}

              {userProfile?.category && (
                <div className="p-6 bg-surface-container-high rounded-xl border border-outline/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Specialization</p>
                  <p className="text-lg font-bold text-on-surface">{userProfile.category}</p>
                </div>
              )}

              <div className="p-6 bg-primary/5 border border-primary/10 rounded-xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Member Since</p>
                <p className="text-sm font-bold text-on-surface">
                  {new Date(userProfile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </Card>
        </div>
      ) : !passwordVerified ? (
        <Card variant="glass" className="max-w-md mx-auto p-10 border border-outline/10 shadow-2xl">
          <h3 className="text-2xl font-black text-on-surface mb-6">Verify Password</h3>
          
          <div className="p-4 bg-warning/10 border border-warning/20 rounded-xl mb-6">
            <p className="text-xs font-bold text-warning">
              Please verify your password to edit profile information.
            </p>
          </div>

          {passwordError && (
            <div className="p-4 bg-error/10 border border-error/20 rounded-xl mb-6">
              <p className="text-xs font-bold text-error">{passwordError}</p>
            </div>
          )}

          <Input
            label="Password Verification"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-6"
          />

          <div className="flex gap-3">
            <Button 
              onClick={handleVerifyPassword}
              className="flex-1 font-black uppercase text-xs tracking-widest py-3"
            >
              Verify
            </Button>
            <Button 
              onClick={() => {
                setIsEditMode(false);
                setPassword('');
                setPasswordError('');
              }}
              variant="secondary"
              className="flex-1 font-black uppercase text-xs tracking-widest py-3"
            >
              Cancel
            </Button>
          </div>
        </Card>
      ) : (
        <Card variant="glass" className="max-w-2xl mx-auto p-10 border border-outline/10 shadow-2xl">
          <h3 className="text-2xl font-black text-on-surface mb-8">Edit Profile</h3>

          {saveError && (
            <div className="p-4 bg-error/10 border border-error/20 rounded-xl mb-6">
              <p className="text-xs font-bold text-error">{saveError}</p>
            </div>
          )}

          {saveSuccess && (
            <div className="p-4 bg-success/10 border border-success/20 rounded-xl mb-6">
              <p className="text-xs font-bold text-success">{saveSuccess}</p>
            </div>
          )}

          {/* Photo Upload */}
          <div className="mb-8 flex justify-center">
            <label className="cursor-pointer group flex flex-col items-center gap-3">
              <div className={`w-24 h-24 rounded-full border-4 border-dashed overflow-hidden flex items-center justify-center transition-all ${
                photoPreview ? 'border-primary bg-primary/10' : 'border-outline/20 hover:border-primary/50 bg-surface-container-low'
              }`}>
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera size={32} className="text-on-surface-variant/40 group-hover:text-primary transition-colors" strokeWidth={1.5} />
                )}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant group-hover:text-primary transition-colors">
                {photoPreview ? 'Change Photo' : 'Upload Photo'}
              </span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>

          <div className="space-y-6 mb-8">
            <Input
              label="Name"
              placeholder="Enter your name"
              value={editData.name}
              onChange={(e) => setEditData({...editData, name: e.target.value})}
            />

            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={editData.email}
              onChange={(e) => setEditData({...editData, email: e.target.value})}
            />

            <Input
              label="Phone Number"
              type="tel"
              placeholder="Enter your phone number"
              value={editData.phone_number}
              onChange={(e) => setEditData({...editData, phone_number: e.target.value})}
            />

            {userProfile?.staff_id && (
              <Input
                label="Staff ID"
                placeholder="Enter Staff ID"
                value={editData.staff_id}
                onChange={(e) => setEditData({...editData, staff_id: e.target.value})}
              />
            )}

            {userProfile?.warden_id && (
              <Input
                label="Warden ID"
                placeholder="Enter Warden ID"
                value={editData.warden_id}
                onChange={(e) => setEditData({...editData, warden_id: e.target.value})}
              />
            )}

            {userProfile?.registration_number && (
              <Input
                label="Registration Number"
                placeholder="Enter Registration Number"
                value={editData.registration_number}
                onChange={(e) => setEditData({...editData, registration_number: e.target.value})}
              />
            )}

            {userProfile?.registration_number && (
              <Input
                label="Room Number"
                placeholder="Enter Room Number"
                value={editData.room_number}
                onChange={(e) => setEditData({...editData, room_number: e.target.value})}
              />
            )}
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleSaveProfile}
              loading={saving}
              className="flex-1 font-black uppercase text-xs tracking-widest py-4"
            >
              Save Changes
            </Button>
            <Button 
              onClick={() => {
                setIsEditMode(false);
                setPasswordVerified(false);
                setEditData({ 
                  name: userProfile?.name || '', 
                  email: userProfile?.email || '',
                  phone_number: userProfile?.phone_number || '',
                  staff_id: userProfile?.staff_id || '',
                  warden_id: userProfile?.warden_id || '',
                  registration_number: userProfile?.registration_number || '',
                  room_number: userProfile?.room_number || ''
                });
                setPhotoPreview(userProfile?.photo_url || null);
              }}
              variant="secondary"
              className="flex-1 font-black uppercase text-xs tracking-widest py-4"
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}
    </PortalLayout>
  );
}
