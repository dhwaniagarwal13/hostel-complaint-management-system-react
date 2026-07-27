import React, { useState, useEffect } from 'react';
import PortalLayout from '../../layouts/PortalLayout';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import ExportDropdown from '../../components/ui/ExportDropdown';
import UserDetailModal from '../../components/ui/UserDetailModal';
import ImageViewer from '../../components/ui/ImageViewer';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  Download, 
  TrendingUp, 
  AlertOctagon, 
  CheckCircle2, 
  Clock, 
  User, 
  MapPin, 
  Settings2, 
  X,
  ChevronRight,
  HardHat,
  Users,
  LayoutGrid,
  ShieldAlert,
  ArrowUpRight,
  Calendar,
  Image as ImageIcon,
  MessageSquare,
  AlertCircle,
  Activity
} from 'lucide-react';
import { authService } from '../../lib/auth';

import { supabase } from '../../lib/supabase';

export default function WardenComplaints() {
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMatrix, setShowMatrix] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewerImages, setViewerImages] = useState([]);
  const [viewerStartIndex, setViewerStartIndex] = useState(0);

  const [complaints, setComplaints] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedStaffToAssign, setSelectedStaffToAssign] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [allUsers, setAllUsers] = useState({});


  const currentUser = authService.getCurrentUser();
  const wardenHostel = currentUser?.hostel_id;

  const fetchData = async () => {
    if (!wardenHostel) {
      setLoading(false);
      return;
    }
    
    // Fetch Complaints
    const { data: cData } = await supabase.from('complaints').select('*').eq('hostel_id', wardenHostel).order('created_at', { ascending: false });
    // Fetch all users to map names manually to avoid Supabase join relation errors securely
    const { data: uData } = await supabase.from('users').select('*');
    
    if (cData) setComplaints(cData);
    if (uData) {
      setStaffList(uData.filter(u => u.role === 'staff'));
      const map = {};
      const usersObj = {};
      uData.forEach(u => { 
        map[u.id] = u.name;
        usersObj[u.id] = u;
      });
      setUsersMap(map);
      setAllUsers(usersObj);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [wardenHostel]);

  // Exclude resolved complaints from grievance view, then sort emergencies and immediate crisis to top
  const filteredComplaints = complaints
    .filter(c => c.status !== 'resolved')
    .filter(c => 
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (usersMap[c.student_id] && usersMap[c.student_id].toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .filter(c => categoryFilter === 'all' || c.category === categoryFilter)
    .sort((a, b) => {
      // Immediate crisis first
      const aIsCrisis = a.category === 'Immediate crisis' || a.is_emergency;
      const bIsCrisis = b.category === 'Immediate crisis' || b.is_emergency;
      if (aIsCrisis && !bIsCrisis) return -1;
      if (!aIsCrisis && bIsCrisis) return 1;
      // Then sort by date
      return new Date(b.created_at) - new Date(a.created_at);
    });

  const allCategories = [...new Set(complaints.map(c => c.category).filter(Boolean))];

  const exportData = filteredComplaints.map(c => ({
    id: c.id,
    source: usersMap[c.student_id] || 'Unknown Origin',
    location: c.location,
    category: c.category,
    specialist: usersMap[c.assigned_to] || 'Unassigned',
    status: c.status,
    emergency: c.is_emergency ? 'Yes' : 'No'
  }));

  const exportColumns = [
    { header: 'Incident ID', dataKey: 'id' },
    { header: 'Resident', dataKey: 'source' },
    { header: 'Location', dataKey: 'location' },
    { header: 'Category', dataKey: 'category' },
    { header: 'Emergency', dataKey: 'emergency' },
    { header: 'Specialist', dataKey: 'specialist' },
    { header: 'Status', dataKey: 'status' }
  ];

  const handleAssign = async () => {
    if (!selectedStaffToAssign || !selectedComplaint) return;
    try {
      const { error } = await supabase
        .from('complaints')
        .update({ assigned_to: selectedStaffToAssign, status: 'in_progress' })
        .eq('id', selectedComplaint.id);
      if (error) throw error;
      
      alert(`Success: Tactical deployment initiated. Specialist ${usersMap[selectedStaffToAssign]} has been assigned to the mission.`);
      setSelectedComplaint({...selectedComplaint, assigned_to: selectedStaffToAssign, status: 'in_progress'});
      fetchData(); // refresh table
    } catch (error) {
      console.error(error);
      alert('Assignment failed.');
    }
  };

  // Auto-classify complaints into Electrical, Painting, or Other
  const autoClassifyComplaints = async () => {
    if (complaints.length === 0) {
      alert('No complaints to classify.');
      return;
    }

    try {
      const electricalKeywords = ['wiring', 'circuit', 'outlet', 'plug', 'socket', 'light', 'bulb', 'fan', 'ac', 'air', 'power', 'electricity', 'electrical', 'short', 'switch'];
      const paintingKeywords = ['paint', 'color', 'wall', 'stain', 'mark', 'scratch', 'chip', 'peeling', 'fade', 'coating', 'surface', 'finish', 'brush'];
      const fireKeywords = ['fire', 'smoke', 'extinguisher', 'flame', 'burning', 'blast', 'explosive', 'gas leak', 'sparking', 'fire alarm'];

      let classifiedCount = 0;

      for (const complaint of complaints) {
        // Don't reclassify "Immediate crisis" complaints
        if (complaint.category === 'Immediate crisis') {
          continue;
        }

        const descriptionLower = complaint.description.toLowerCase();
        let newCategory = 'Other';

        if (electricalKeywords.some(keyword => descriptionLower.includes(keyword))) {
          newCategory = 'Electrical';
        } else if (paintingKeywords.some(keyword => descriptionLower.includes(keyword))) {
          newCategory = 'Painting';
        } else if (fireKeywords.some(keyword => descriptionLower.includes(keyword))) {
          newCategory = 'Fire Safety';
        }

        if (newCategory !== complaint.category) {
          const { error } = await supabase
            .from('complaints')
            .update({ category: newCategory })
            .eq('id', complaint.id);
          if (!error) classifiedCount++;
        }
      }

      alert(`Auto-classification complete! ${classifiedCount} complaint(s) updated with new categories.`);
      fetchData(); // Refresh the table
    } catch (error) {
      console.error(error);
      alert('Classification failed.');
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Op Center', path: '/warden/dashboard', icon: LayoutGrid },
    { id: 'complaints', label: 'Grievances', path: '/warden/complaints', icon: ClipboardList },
    { id: 'completed', label: 'Resolved', path: '/warden/completed', icon: CheckCircle2 },
    { id: 'staff', label: 'Maintenance', path: '/warden/staff', icon: HardHat },
    { id: 'students', label: 'Residents', path: '/warden/students', icon: Users }
  ];

  const stats = [
    { label: 'Total Logs', value: filteredComplaints.length, color: 'text-on-surface', icon: ClipboardList },
    { label: 'Unassigned', value: filteredComplaints.filter(c => !c.assigned_to).length, color: 'text-tertiary', icon: Clock },
    { label: 'Criticality', value: filteredComplaints.filter(c => c.is_emergency).length, color: 'text-error', icon: AlertOctagon },
    { label: 'Resolution', value: filteredComplaints.filter(c => c.status === 'resolved').length, color: 'text-success', icon: CheckCircle2 }
  ];

  return (
    <PortalLayout menuItems={menuItems} roleName="Warden">
      {!wardenHostel ? (
        <div className="flex items-center justify-center min-h-screen">
          <Card variant="glass" className="p-12 max-w-md text-center border border-error/30 bg-error/5">
            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} className="text-error" />
            </div>
            <h2 className="text-2xl font-bold text-on-surface mb-2">Authentication Error</h2>
            <p className="text-on-surface-variant mb-6">Unable to load hostel information. Please log in again.</p>
            <Button href="/auth/warden-login" className="w-full">Return to Login</Button>
          </Card>
        </div>
      ) : (
      <>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 mb-4 animate-in fade-in slide-in-from-left-4 duration-700">
            <ShieldAlert size={14} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Intelligence Terminal • Grievance Matrix</span>
          </div>
          <h1 className="display-font text-5xl md:text-6xl font-black text-on-surface leading-[0.8] tracking-tighter mb-4">
            Issue <span className="text-primary text-glow-primary">Tracking.</span>
          </h1>
          <p className="text-on-surface-variant font-medium text-lg max-w-lg mb-2">
            Global lifecycle monitoring of all facility anomalies and tactical deployments.
          </p>
        </div>
        <div className="flex gap-4 z-20">
          <ExportDropdown 
            data={exportData}
            columns={exportColumns}
            filename="grievance-registry-report"
            title="Grievance Matrix Export"
          />
          <Button 
            onClick={() => {
              if (!showMatrix) {
                autoClassifyComplaints();
              }
              setShowMatrix(!showMatrix);
            }}
            className={`font-black uppercase text-xs tracking-widest gap-2 shadow-2xl shadow-primary/30 h-14 px-8 ${
              showMatrix ? 'bg-primary text-white' : ''
            }`}>
            <Filter size={18} strokeWidth={2.5} />
            Advanced Matrix
          </Button>
        </div>
      </div>

      {/* Category Filter Panel */}
      {showMatrix && (
        <div className="animate-in slide-in-from-top-4 duration-500 mb-8 p-6 bg-surface-container-low border border-primary/20 rounded-2xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-4">Filter by Complaint Category</p>
          <div className="flex flex-wrap gap-3">
            {['all', ...allCategories].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${
                  categoryFilter === cat
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30'
                    : 'bg-surface border-outline/10 text-on-surface-variant hover:border-primary/40'
                }`}
              >
                {cat === 'all' ? '★ All Categories' : cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} variant="glass" className="p-8 border border-outline/10 group hover:border-primary/30 transition-all duration-500 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon size={80} strokeWidth={1} />
              </div>
              <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center mb-6 border border-outline/5 group-hover:scale-110 transition-transform duration-500">
                <Icon size={24} strokeWidth={2.5} className={stat.color} />
              </div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-on-surface-variant font-black mb-1 block group-hover:text-primary transition-colors">{stat.label}</span>
              <span className={`display-font text-5xl font-black ${stat.color} tracking-tighter shadow-sm`}>{stat.value}</span>
            </Card>
          );
        })}
      </div>

      {/* Main Table Area */}
      <Card variant="glass" className="p-0 overflow-hidden border border-outline/10 shadow-2xl animate-in fade-in zoom-in-95 duration-1000 delay-500">
        <div className="p-10 border-b border-outline/10 flex flex-col md:flex-row justify-between items-center gap-6 bg-surface/30">
          <CardHeader title="Grievance Registry" subtitle="Comprehensive list of reported incidents across all hostel sectors." className="mb-0 p-0" />
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} strokeWidth={2.5} />
            <input 
              type="text" 
              placeholder="Search ID, Student or Block..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-low border border-outline/10 rounded-xl py-4 pl-12 pr-4 text-xs font-bold uppercase tracking-widest text-on-surface outline-none focus:border-primary/40 transition-all shadow-inner"
            />
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary/[0.02]">
                <th className="px-10 py-6 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black">Inc. ID</th>
                <th className="px-10 py-6 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black">Resident Source</th>
                <th className="px-10 py-6 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black">Classification</th>
                <th className="px-10 py-6 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black">Specialist Assigned</th>
                <th className="px-10 py-6 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black">Tactical Status</th>
                <th className="px-10 py-6 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black text-right">Operational Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/5 font-medium">
              {loading ? (
                <tr><td colSpan="6" className="px-10 py-8 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin">
                      <Activity size={20} className="text-warning" strokeWidth={2.5} />
                    </div>
                    <span className="text-sm font-bold text-on-surface-variant">Loading complaints...</span>
                  </div>
                </td></tr>
              ) : filteredComplaints.length === 0 ? (
                <tr><td colSpan="6" className="px-10 py-8 text-center text-on-surface-variant font-bold text-sm">No Tactical Anomalies Detected.</td></tr>
              ) : filteredComplaints.map((c) => (
                <tr key={c.id} className={`transition-all duration-300 group ${
                  c.is_emergency 
                    ? 'bg-gradient-to-r from-gray-700/[0.08] to-gray-600/[0.05] shadow-[0_0_32px_rgba(120,120,140,0.15)] ring-1 ring-inset ring-gray-400/10 hover:bg-gradient-to-r hover:from-gray-700/[0.12] hover:to-gray-600/[0.08] hover:shadow-[0_0_40px_rgba(120,120,140,0.2)]' 
                    : 'hover:bg-primary/[0.03]'
                }`}>
                  <td className="px-10 py-8 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className={`w-1.5 h-6 rounded-full ${c.is_emergency ? 'bg-gradient-to-b from-gray-400 to-gray-500 animate-pulse shadow-[0_0_12px_rgba(150,150,170,0.4)]' : 'bg-primary/20 group-hover:bg-primary transition-colors'}`} />
                      <div className="flex flex-col">
                        <span className={`font-black text-sm tracking-widest ${c.is_emergency ? 'text-gray-300' : 'text-on-surface'}`}>
                          {c.id.substring(0,8).toUpperCase()}
                        </span>
                        {c.is_emergency && <span className="text-[8px] font-black uppercase text-gray-400 tracking-tighter">⚠ Immediate Crisis</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8 relative z-10">
                    <div className="flex flex-col">
                      <span className={`text-sm font-black tracking-tight uppercase ${c.is_emergency ? 'text-gray-300' : 'text-on-surface'}`}>
                        {usersMap[c.student_id] || 'Unknown Origin'}
                      </span>
                      <span className={`text-[10px] font-black uppercase tracking-widest opacity-60 flex items-center gap-2 ${c.is_emergency ? 'text-gray-400' : 'text-on-surface-variant'}`}>
                        <MapPin size={10} strokeWidth={3} className={c.is_emergency ? 'text-gray-400' : 'text-primary'} />
                        {c.location}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-8 relative z-10">
                    <span className={`text-xs font-black uppercase tracking-widest py-1.5 px-3 rounded-lg border italic ${
                      c.is_emergency 
                        ? 'bg-gray-700/20 border-gray-500/30 text-gray-300' 
                        : 'bg-surface-container-low border-outline/5 text-on-surface-variant'
                    }`}>
                      {c.category}
                    </span>
                  </td>
                  <td className="px-10 py-8 relative z-10">
                    {c.assigned_to ? (
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          c.is_emergency 
                            ? 'bg-gray-600/30 text-gray-300' 
                            : 'bg-secondary/10 text-secondary'
                        }`}>
                          <HardHat size={14} strokeWidth={3} />
                        </div>
                        <span className={`text-xs font-black uppercase tracking-widest ${c.is_emergency ? 'text-gray-300' : 'text-on-surface'}`}>
                          {usersMap[c.assigned_to]}
                        </span>
                      </div>
                    ) : (
                      <div className={`flex items-center gap-3 ${c.is_emergency ? 'text-gray-500 animate-pulse' : 'text-tertiary animate-pulse'}`}>
                        <Clock size={16} strokeWidth={3} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Standby</span>
                      </div>
                    )}
                  </td>
                  <td className="px-10 py-8 relative z-10">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-10 py-8 text-right relative z-10">
                    <Button 
                      variant="secondary" 
                      className={`font-black uppercase text-[10px] tracking-[0.2em] gap-2 transition-all duration-500 hover:-translate-x-1 ${
                        c.is_emergency
                          ? 'bg-gray-700/20 hover:bg-gray-600/30 text-gray-300 border border-gray-500/30 shadow-none'
                          : 'bg-surface hover:bg-primary/10 hover:text-primary border border-outline/10 shadow-none'
                      }`}
                      onClick={() => setSelectedComplaint(c)}
                    >
                      Tactical Manage
                      <ChevronRight size={14} strokeWidth={4} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Management Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-surface/40 backdrop-blur-xl animate-in fade-in duration-500">
          <Card variant="glass" className="w-full max-w-4xl p-0 border border-outline/10 shadow-[0_40px_80px_rgba(0,0,0,0.5)] overflow-hidden relative animate-in zoom-in-95 duration-500">
            <div className={`absolute top-0 left-0 w-full h-2 ${selectedComplaint.is_emergency ? 'bg-gradient-to-r from-gray-500 to-gray-400' : 'bg-primary'}`} />
            
            <div className="p-12">
              <div className="flex justify-between items-start mb-12">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl ${
                      selectedComplaint.is_emergency 
                        ? 'bg-gray-700/20 text-gray-300 shadow-[0_0_20px_rgba(120,120,140,0.3)]' 
                        : 'bg-primary/10 text-primary'
                    }`}>
                      <ShieldAlert size={32} strokeWidth={3} className={selectedComplaint.is_emergency ? 'animate-pulse' : ''} />
                    </div>
                    <div>
                      <h2 className={`display-font text-4xl font-black tracking-tighter uppercase leading-none mb-2 ${
                        selectedComplaint.is_emergency ? 'text-gray-300' : 'text-on-surface'
                      }`}>
                        {selectedComplaint.id.substring(0,8)} <span className={`opacity-20 ${selectedComplaint.is_emergency ? 'text-gray-500' : 'text-on-surface-variant'}`}>/ LOG</span>
                      </h2>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={selectedComplaint.status} />
                        {selectedComplaint.is_emergency && (
                          <span className="px-3 py-1 bg-gradient-to-r from-gray-600 to-gray-500 text-white text-[8px] font-black uppercase tracking-[0.2em] rounded-full shadow-[0_0_12px_rgba(120,120,140,0.4)]">⚠ Immediate Crisis</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedComplaint(null)} 
                  className="p-3 bg-surface-container-low text-on-surface-variant hover:text-error hover:bg-error/10 rounded-2xl transition-all duration-300"
                >
                  <X size={24} strokeWidth={3} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40 border-b border-outline/5 pb-2">Intelligence Source</h4>
                    <div className="flex items-center gap-4 bg-surface-container-low p-6 rounded-3xl border border-outline/5">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                        {(usersMap[selectedComplaint.student_id] || "U").substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="block text-sm font-black text-on-surface uppercase tracking-tight">{usersMap[selectedComplaint.student_id]}</span>
                        <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60 italic">{selectedComplaint.hostel_id} • {selectedComplaint.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-surface-container-low rounded-3xl border border-outline/5">
                      <div className="flex items-center gap-2 mb-2 opacity-40">
                        <ClipboardList size={14} />
                        <span className="text-[8px] font-black uppercase tracking-widest">Category</span>
                      </div>
                      <span className="text-xs font-black text-on-surface uppercase">{selectedComplaint.category}</span>
                    </div>
                    <div className="p-6 bg-surface-container-low rounded-3xl border border-outline/5">
                      <div className="flex items-center gap-2 mb-2 opacity-40">
                        <Calendar size={14} />
                        <span className="text-[8px] font-black uppercase tracking-widest">Entry Date</span>
                      </div>
                      <span className="text-xs font-black text-on-surface uppercase">{new Date(selectedComplaint.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Student's Complaint Message */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40 border-b border-outline/5 pb-2">
                      <MessageSquare size={12} className="inline mr-2" />
                      Resident's Message
                    </h4>
                    <div className="p-6 bg-surface-container-low rounded-3xl border border-outline/5 max-h-32 overflow-y-auto">
                      <p className="text-sm font-medium text-on-surface leading-relaxed italic">"{selectedComplaint.description.split('--- STAFF LOG ---')[0].trim() || 'No description provided'}"</p>
                    </div>
                  </div>

                  {/* Student's Uploaded Photos */}
                  {selectedComplaint.photos && selectedComplaint.photos.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40 border-b border-outline/5 pb-2">
                        <ImageIcon size={12} className="inline mr-2" />
                        Resident's Evidence ({selectedComplaint.photos.length})
                      </h4>
                      <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                        {selectedComplaint.photos.map((photo, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => {
                              setViewerImages(selectedComplaint.photos);
                              setViewerStartIndex(idx);
                              setShowImageViewer(true);
                            }}
                            className="relative group rounded-2xl overflow-hidden border border-outline/5 hover:border-primary/30 transition-all cursor-pointer">
                            <img 
                              src={photo} 
                              alt={`Evidence ${idx + 1}`}
                              className="w-full h-24 object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-surface/0 group-hover:bg-surface/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <span className="text-[8px] font-black text-white uppercase bg-primary/80 px-2 py-1 rounded-lg">View</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40 border-b border-outline/5 pb-2">Deployment Control</h4>
                  
                  {selectedComplaint.assigned_to ? (
                    <div className="bg-secondary/5 p-8 rounded-[2rem] border border-secondary/20 relative overflow-hidden group/assigned">
                      <div className="absolute top-0 right-0 p-6 opacity-[0.05] group-hover/assigned:scale-110 transition-transform">
                        <HardHat size={80} strokeWidth={1} />
                      </div>
                      <div className="relative z-10 flex flex-col items-center text-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-secondary block mb-4">Tactical Lead Assigned</span>
                        <h5 className="display-font text-3xl font-black text-on-surface uppercase tracking-tighter mb-8">{usersMap[selectedComplaint.assigned_to]}</h5>
                        <Button variant="danger" size="lg" className="w-full py-5 text-[10px] font-black uppercase tracking-widest gap-2 bg-error shadow-xl shadow-error/20"
                          onClick={() => {
                            setSelectedStaffToAssign('');
                            supabase.from('complaints').update({ assigned_to: null, status: 'pending' }).eq('id', selectedComplaint.id).then(()=>fetchData());
                            setSelectedComplaint({...selectedComplaint, assigned_to: null, status: 'pending'});
                          }}>
                          <ShieldAlert size={16} strokeWidth={3} />
                          Revoke Deployment
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 ml-2">Select Tactical Specialist</label>
                        <div className="relative">
                          <select 
                            value={selectedStaffToAssign}
                            onChange={(e) => setSelectedStaffToAssign(e.target.value)}
                            className="w-full bg-surface-container-low border-2 border-outline/5 rounded-2xl p-5 pl-14 text-sm font-black uppercase tracking-widest text-on-surface appearance-none focus:border-primary/40 focus:ring-8 focus:ring-primary/5 transition-all">
                            <option value="">Awaiting Specialist Selection...</option>
                            {staffList.map(staff => (
                              <option key={staff.id} value={staff.id}>
                                {staff.name}{staff.category ? ` (${staff.category.charAt(0).toUpperCase() + staff.category.slice(1)})` : ''}
                              </option>
                            ))}
                          </select>
                          <HardHat size={24} strokeWidth={3} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary pointer-events-none" />
                        </div>
                      </div>
                      <Button onClick={handleAssign} className="w-full py-6 text-sm font-black uppercase tracking-[0.3em] gap-3 bg-primary shadow-2xl shadow-primary/30">
                        Initiate Deployment
                        <ArrowUpRight size={20} strokeWidth={4} />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-surface-container-highest/30 p-6 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Live audit logging active for this session</span>
                </div>
                <button 
                  onClick={() => alert('Detailed history log will be available in the next update.')}
                  className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline underline-offset-4 decoration-2 cursor-pointer transition-opacity hover:opacity-80">
                  View full history log
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* User Detail Modal */}
      <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />

      {/* Image Viewer */}
      <ImageViewer 
        images={viewerImages} 
        currentIndex={viewerStartIndex}
        isOpen={showImageViewer}
        onClose={() => setShowImageViewer(false)}
      />

      {/* Decorative ambient background */}
      <div className="fixed top-1/4 right-[10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] pointer-events-none z-[-1]" />
      </>
      )}
    </PortalLayout>
  );
}
