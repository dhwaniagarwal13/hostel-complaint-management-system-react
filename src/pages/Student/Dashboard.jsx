import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PortalLayout from '../../layouts/PortalLayout';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import ExportDropdown from '../../components/ui/ExportDropdown';
import { 
  Plus, 
  Search, 
  Filter, 
  X, 
  Star, 
  MessageSquare,
  LayoutGrid,
  FileText,
  Activity,
  History,
  MapPin,
  Hash,
  Sparkles,
  Users,
  Trash2,
  Trash,
  ChevronRight,
  CheckCircle2,
  Clock,
  Calendar,
  Image as ImageIcon,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

import { supabase } from '../../lib/supabase';
import { authService } from '../../lib/auth';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'resolved', 'insights', 'warden'
  const [wardenInfo, setWardenInfo] = useState(null);
  
  // Feedback States
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [usersMap, setUsersMap] = useState({});
  const [resolutionTimesData, setResolutionTimesData] = useState([]);

  useEffect(() => {
    const loadComplaints = async () => {
      const user = authService.getCurrentUser();
      if (!user) return;
      
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });
        
      // Fetch users for staff names and IDs
      const { data: uData } = await supabase.from('users').select('id, name, staff_id');
      if (uData) {
        const map = {};
        uData.forEach(u => { map[u.id] = { name: u.name, staff_id: u.staff_id }; });
        setUsersMap(map);
      }

      // Fetch warden information
      if (user.hostel_id) {
        const { data: wardenData } = await supabase
          .from('users')
          .select('*')
          .eq('hostel_id', user.hostel_id)
          .eq('role', 'warden')
          .single();
        
        if (wardenData) {
          setWardenInfo(wardenData);
        }
      }

      if (!error && data) {
        setComplaints(data);
        
        // Calculate resolution time data
        const resolvedWithTimes = data
          .filter(c => c.status === 'resolved' && c.resolved_at)
          .map(c => ({
            ...c,
            resolutionTimeHours: c.resolved_at ? 
              Math.round((new Date(c.resolved_at) - new Date(c.created_at)) / (1000 * 60 * 60)) : 0
          }));
        
        setResolutionTimesData(resolvedWithTimes);
      }
      setLoading(false);
    };
    loadComplaints();
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("CONFIRMATION: Delete this complaint permanently?")) return;
    
    // Optimistic UI update
    setComplaints(complaints.filter(c => c.id !== id));
    
    try {
      const { error } = await supabase.from('complaints').delete().eq('id', id);
      if (error) throw error;
    } catch(err) {
      alert("Failed to delete complaint.");
      // Rollback would happen via reloading but we keep it simple here
    }
  };

  const handleFeedbackSubmit = async () => {
    if (rating === 0) {
      alert("Please provide a star rating.");
      return;
    }
    
    setIsSubmittingFeedback(true);
    const user = authService.getCurrentUser();
    
    try {
      const { error } = await supabase.from('feedback').insert([{
        complaint_id: selectedComplaint.id,
        student_id: user.id,
        rating: rating,
        comment: feedbackText
      }]);
      
      if (error) throw error;
      
      alert("Feedback submitted officially.");
      setSelectedComplaint(null);
      setRating(0);
      setHoverRating(0);
      setFeedbackText('');
    } catch(err) {
      console.error(err);
      alert("Failed to submit feedback.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // Clean description to hide STAFF LOG from students
  const getCleanDescription = (description) => {
    if (!description) return '';
    return description.split('--- STAFF LOG ---')[0].trim();
  };

  // Extract staff log data (notes and image)
  const getStaffLog = (description) => {
    if (!description || !description.includes('--- STAFF LOG ---')) return null;
    const logPart = description.split('--- STAFF LOG ---')[1];
    
    const notesMatch = logPart.match(/NOTES:(.*?)(IMAGE:|$)/s);
    const imageMatch = logPart.match(/IMAGE:(.*)/s);
    
    return {
      notes: notesMatch ? notesMatch[1].trim() : '',
      image: imageMatch ? imageMatch[1].trim() : null
    };
  };

  // Filter complaints based on active tab
  const getFilteredComplaints = () => {
    if (activeTab === 'pending') {
      return complaints.filter(c => c.status !== 'resolved');
    } else if (activeTab === 'resolved') {
      return complaints.filter(c => c.status === 'resolved');
    } else if (activeTab === 'insights') {
      return resolutionTimesData;
    }
    return complaints;
  };

  const filteredComplaints = getFilteredComplaints();

  const exportData = filteredComplaints.map(c => ({
    id: c.id,
    category: c.category,
    location: c.location,
    severity: c.severity,
    status: c.status,
    emergency: c.is_emergency ? 'Yes' : 'No',
    date: new Date(c.created_at).toLocaleDateString()
  }));

  const exportColumns = [
    { header: 'Case ID', dataKey: 'id' },
    { header: 'Category', dataKey: 'category' },
    { header: 'Location', dataKey: 'location' },
    { header: 'Severity', dataKey: 'severity' },
    { header: 'Status', dataKey: 'status' },
    { header: 'Emergency', dataKey: 'emergency' },
    { header: 'Filed On', dataKey: 'date' }
  ];

  const menuItems = [
    { id: 'dashboard', label: 'Overview', path: '/student/dashboard', icon: LayoutGrid },
    { id: 'new', label: 'Raise Issue', path: '/student/new-complaint', icon: Plus }
  ];

  const stats = [
    { label: 'All Cases', value: complaints.length, color: 'text-primary', icon: FileText, bg: 'bg-primary/5' },
    { label: 'Pending', value: complaints.filter(c => c.status === 'pending').length, color: 'text-tertiary', icon: Clock, bg: 'bg-tertiary/5' },
    { label: 'Active', value: complaints.filter(c => c.status === 'in_progress').length, color: 'text-secondary', icon: Activity, bg: 'bg-secondary/5' },
    { label: 'Resolved', value: complaints.filter(c => c.status === 'resolved').length, color: 'text-success', icon: CheckCircle2, bg: 'bg-success/5' }
  ];

  return (
    <PortalLayout menuItems={menuItems} roleName="Student">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 mb-4 animate-in fade-in slide-in-from-left-4 duration-700">
            <Sparkles size={14} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Student Command Center</span>
          </div>
          <h1 className="display-font text-5xl md:text-6xl font-black text-on-surface leading-[0.8] tracking-tighter mb-4">
            My <span className="text-primary text-glow-primary">Overview.</span>
          </h1>
          <p className="text-on-surface-variant font-medium text-lg max-w-lg">
            Track and manage your institutional grievances with real-time updates and seamless interactions.
          </p>
        </div>
        <Button onClick={() => navigate('/student/new-complaint')} className="py-4 px-8 text-sm font-black uppercase tracking-widest gap-2 shadow-2xl shadow-primary/30">
          <Plus size={20} strokeWidth={3} />
          New Complaint
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
        {stats.map((stat, idx) => {
          const Icon = stat.icon || Activity;
          return (
            <Card key={stat.label} variant="glass" className="p-8 border border-outline/10 group hover:border-primary/30 transition-all duration-500 overflow-hidden relative">
              <div className={`absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity`}>
                <Icon size={80} strokeWidth={1} />
              </div>
              <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                <Icon size={24} strokeWidth={2.5} />
              </div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-on-surface-variant font-black mb-1 block group-hover:text-primary transition-colors">{stat.label}</span>
              <span className={`display-font text-5xl font-black ${stat.color} tracking-tighter`}>{stat.value}</span>
            </Card>
          );
        })}
      </div>

      {/* Main Table Area */}
      <Card variant="glass" className="p-0 overflow-hidden border border-outline/10 shadow-2xl animate-in fade-in zoom-in-95 duration-1000 delay-500">
        {/* Tab Navigation */}
        <div className="flex border-b border-outline/10 bg-surface/30">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-5 px-6 text-center font-black uppercase text-xs tracking-widest transition-all duration-300 border-b-2 ${
              activeTab === 'pending'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Activity size={16} className="inline mr-2" />
            My Complaints
          </button>
          <button
            onClick={() => setActiveTab('resolved')}
            className={`flex-1 py-5 px-6 text-center font-black uppercase text-xs tracking-widest transition-all duration-300 border-b-2 ${
              activeTab === 'resolved'
                ? 'border-success text-success bg-success/5'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <CheckCircle2 size={16} className="inline mr-2" />
            Resolved
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`flex-1 py-5 px-6 text-center font-black uppercase text-xs tracking-widest transition-all duration-300 border-b-2 ${
              activeTab === 'insights'
                ? 'border-secondary text-secondary bg-secondary/5'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <TrendingUp size={16} className="inline mr-2" />
            Insights
          </button>
          <button
            onClick={() => setActiveTab('warden')}
            className={`flex-1 py-5 px-6 text-center font-black uppercase text-xs tracking-widest transition-all duration-300 border-b-2 ${
              activeTab === 'warden'
                ? 'border-warning text-warning bg-warning/5'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Users size={16} className="inline mr-2" />
            Warden
          </button>
        </div>

        {/* Pending / Active Complaints Tab */}
        {activeTab === 'pending' && (
          <>
            <div className="p-10 border-b border-outline/10 flex flex-col md:flex-row justify-between items-center gap-6 bg-surface/30">
              <CardHeader title="Grievance Repository" subtitle="All active and pending complaints filed by you." className="mb-0" />
              <div className="flex gap-4">
                <ExportDropdown
                  data={exportData}
                  columns={exportColumns}
                  filename="my-complaints-log"
                  title="Student Complaints Log"
                />
              </div>
            </div>
            
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-primary/[0.02]">
                    <th className="px-10 py-6 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black">Tracking ID</th>
                    <th className="px-10 py-6 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black">Classification</th>
                    <th className="px-10 py-6 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black">Timeline</th>
                    <th className="px-10 py-6 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black">Current Status</th>
                    <th className="px-10 py-6 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline/5">
                  {loading ? (
                    <tr><td colSpan="5" className="px-10 py-8 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin">
                          <Activity size={20} className="text-primary" strokeWidth={2.5} />
                        </div>
                        <span className="text-sm font-bold text-on-surface-variant">Loading complaints...</span>
                      </div>
                    </td></tr>
                  ) : filteredComplaints.length === 0 ? (
                    <tr><td colSpan="5" className="px-10 py-8 text-center text-on-surface-variant font-bold text-sm">No active grievances. Great work!</td></tr>
                  ) : filteredComplaints.map((c) => (
                    <tr key={c.id} className="hover:bg-primary/[0.03] transition-all duration-300 group">
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-3">
                          <span className="font-black text-sm text-on-surface tracking-widest">
                            {c.id.substring(0, 8).toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-on-surface tracking-tight">{c.category}</span>
                          <span className="text-xs text-on-surface-variant/70 font-medium">{c.location}</span>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-2 text-on-surface-variant font-black text-[10px] tracking-widest">
                          <Calendar size={12} strokeWidth={3} className="text-primary" />
                          {new Date(c.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-10 py-8"><StatusBadge status={c.status} /></td>
                      <td className="px-10 py-8 text-right">
                        <div className="flex justify-end gap-3 items-center">
                          {c.status === 'pending' && (
                            <button 
                              onClick={(e) => handleDelete(e, c.id)}
                              className="p-2 text-error/60 hover:text-error hover:bg-error/10 rounded-lg transition-all"
                              title="Revoke File"
                            >
                              <Trash size={16} strokeWidth={2.5} />
                            </button>
                          )}
                          <button 
                            onClick={() => setSelectedComplaint(c)}
                            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:text-primary transition-all group/btn"
                          >
                            Audit Trail
                            <ChevronRight size={14} strokeWidth={4} className="transition-transform group-hover/btn:translate-x-1" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Resolved Complaints Tab */}
        {activeTab === 'resolved' && (
          <>
            <div className="p-10 border-b border-outline/10 flex flex-col md:flex-row justify-between items-center gap-6 bg-success/[0.03]">
              <CardHeader title="Completed Cases" subtitle="All resolved complaints with maintenance technician details." className="mb-0" />
            </div>
            
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-success/[0.02]">
                    <th className="px-10 py-6 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black">Tracking ID</th>
                    <th className="px-10 py-6 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black">Category</th>
                    <th className="px-10 py-6 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black">Technician</th>
                    <th className="px-10 py-6 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black">Resolved Date</th>
                    <th className="px-10 py-6 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline/5">
                  {loading ? (
                    <tr><td colSpan="5" className="px-10 py-8 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin">
                          <Activity size={20} className="text-success" strokeWidth={2.5} />
                        </div>
                        <span className="text-sm font-bold text-on-surface-variant">Loading resolved cases...</span>
                      </div>
                    </td></tr>
                  ) : filteredComplaints.length === 0 ? (
                    <tr><td colSpan="5" className="px-10 py-8 text-center text-on-surface-variant font-bold text-sm">No resolved complaints yet.</td></tr>
                  ) : filteredComplaints.map((c) => (
                    <tr key={c.id} className="hover:bg-success/[0.03] transition-all duration-300 group">
                      <td className="px-10 py-8">
                        <span className="font-black text-sm text-on-surface tracking-widest">{c.id.substring(0, 8).toUpperCase()}</span>
                      </td>
                      <td className="px-10 py-8">
                        <span className="text-sm font-black text-on-surface tracking-tight">{c.category}</span>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary text-[10px] font-black border border-secondary/20">
                            {(usersMap[c.assigned_to]?.name || "?").substring(0, 1).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-on-surface uppercase tracking-tight">{usersMap[c.assigned_to]?.name || 'Unassigned'}</span>
                            {usersMap[c.assigned_to]?.staff_id && (
                              <span className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">ID: {usersMap[c.assigned_to].staff_id}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <span className="text-xs font-medium text-on-surface-variant">{c.resolved_at ? new Date(c.resolved_at).toLocaleDateString() : 'N/A'}</span>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <button 
                          onClick={() => setSelectedComplaint(c)}
                          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-success hover:text-success/70 transition-all"
                        >
                          View
                          <ChevronRight size={14} strokeWidth={4} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Dashboard Insights Tab */}
        {activeTab === 'insights' && (
          <div className="p-10">
            <CardHeader 
              title="Resolution Metrics" 
              subtitle="Track how long your complaints took to get resolved from assignment to completion."
              className="mb-10"
            />
            
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin">
                    <TrendingUp size={40} strokeWidth={2} className="text-primary" />
                  </div>
                  <span className="text-on-surface-variant font-bold">Calculating resolution metrics...</span>
                </div>
              </div>
            ) : resolutionTimesData.length > 0 ? (
              <div className="space-y-10">
                {/* Chart */}
                <div className="bg-surface-container-low rounded-2xl p-8 border border-outline/5">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-6">Resolution Time Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={resolutionTimesData.map((c, idx) => ({
                      name: `Case ${idx + 1}`,
                      hours: c.resolutionTimeHours,
                      category: c.category
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                      <XAxis dataKey="name" stroke="rgba(148, 163, 184, 0.4)" />
                      <YAxis stroke="rgba(148, 163, 184, 0.4)" label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                      <Tooltip contentStyle={{backgroundColor: 'var(--surface)', border: '1px solid var(--outline)', borderRadius: '8px'}} />
                      <Line type="monotone" dataKey="hours" stroke="#4f46e5" strokeWidth={3} dot={{fill: '#4f46e5', r: 6}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary block mb-3">Avg Resolution Time</span>
                    <span className="display-font text-3xl font-black text-primary">
                      {Math.round(resolutionTimesData.reduce((sum, c) => sum + c.resolutionTimeHours, 0) / resolutionTimesData.length)} hrs
                    </span>
                  </div>
                  <div className="bg-secondary/5 p-6 rounded-2xl border border-secondary/10">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary block mb-3">Fastest Resolution</span>
                    <span className="display-font text-3xl font-black text-secondary">
                      {Math.min(...resolutionTimesData.map(c => c.resolutionTimeHours))} hrs
                    </span>
                  </div>
                  <div className="bg-tertiary/5 p-6 rounded-2xl border border-tertiary/10">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-tertiary block mb-3">Slowest Resolution</span>
                    <span className="display-font text-3xl font-black text-tertiary">
                      {Math.max(...resolutionTimesData.map(c => c.resolutionTimeHours))} hrs
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-on-surface-variant">
                <TrendingUp size={48} className="mx-auto mb-4 opacity-50" />
                <p className="font-bold text-sm">No resolved complaints available for insights yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Warden Info Tab */}
        {activeTab === 'warden' && (
          <div className="p-10 md:p-14">
            {wardenInfo ? (
              <div className="space-y-8">
                <div className="flex items-center gap-8 pb-10 border-b border-outline/10">
                  <div className="w-48 h-48 rounded-2xl overflow-hidden border-4 border-warning/30 flex-shrink-0 shadow-2xl">
                    {wardenInfo.photo_url ? (
                      <img src={wardenInfo.photo_url} alt={wardenInfo.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-warning/20 to-warning/5 flex items-center justify-center">
                        <Users size={64} className="text-warning/40" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warning/5 border border-warning/10 mb-4">
                      <MapPin size={14} className="text-warning" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-warning">Hostel Authority</span>
                    </div>
                    <h2 className="display-font text-4xl md:text-5xl font-black text-on-surface leading-none tracking-tighter mb-4">
                      {wardenInfo.name}
                    </h2>
                    <p className="text-on-surface-variant font-medium text-lg max-w-lg mb-8">
                      Your hostel warden manages all residential operations and grievance resolution.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-6 bg-surface-container-high rounded-xl border border-outline/5 hover:border-warning/10 transition-colors">
                        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Email Address</p>
                        <p className="text-lg font-bold text-on-surface break-all">{wardenInfo.email}</p>
                      </div>
                      {wardenInfo.phone_number && (
                        <div className="p-6 bg-surface-container-high rounded-xl border border-outline/5 hover:border-warning/10 transition-colors">
                          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Phone Number</p>
                          <a href={`tel:${wardenInfo.phone_number}`} className="text-lg font-bold text-warning hover:text-warning-fixed transition-colors">
                            {wardenInfo.phone_number}
                          </a>
                        </div>
                      )}
                      <div className="p-6 bg-surface-container-high rounded-xl border border-outline/5 hover:border-warning/10 transition-colors">
                        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Warden ID</p>
                        <p className="text-lg font-bold text-on-surface font-mono">{wardenInfo.warden_id || 'N/A'}</p>
                      </div>
                      <div className="p-6 bg-surface-container-high rounded-xl border border-outline/5 hover:border-warning/10 transition-colors">
                        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Member Since</p>
                        <p className="text-lg font-bold text-on-surface">
                          {wardenInfo.created_at ? new Date(wardenInfo.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card variant="glass" className="p-10 border border-warning/20 bg-warning/5">
                    <h3 className="text-2xl font-black text-on-surface mb-6 flex items-center gap-2">
                      <MapPin size={24} className="text-warning" strokeWidth={2.5} />
                      Quick Contact
                    </h3>
                    <div className="space-y-4">
                      <Button 
                        onClick={() => window.location.href = `mailto:${wardenInfo.email}`}
                        variant="secondary"
                        className="w-full justify-center font-black uppercase text-xs tracking-widest py-4"
                      >
                        Send Email
                      </Button>
                      {wardenInfo.phone_number && (
                        <Button 
                          onClick={() => window.location.href = `tel:${wardenInfo.phone_number}`}
                          className="w-full justify-center font-black uppercase text-xs tracking-widest py-4 bg-warning hover:bg-warning/90 text-white shadow-lg shadow-warning/30"
                        >
                          Call Warden
                        </Button>
                      )}
                    </div>
                  </Card>

                  <Card variant="glass" className="p-10 border border-warning/20 bg-warning/5">
                    <h3 className="text-2xl font-black text-on-surface mb-6 flex items-center gap-2">
                      <Activity size={24} className="text-warning" strokeWidth={2.5} />
                      Support Information
                    </h3>
                    <div className="space-y-3 text-on-surface-variant font-medium">
                      <p>• Available for hostel-related grievances 24/7</p>
                      <p>• Priority response for emergency situations</p>
                      <p>• Direct contact for facility issues</p>
                      <p>• Coordinates with maintenance staff</p>
                    </div>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="p-6 bg-warning/5 rounded-full mb-6">
                  <Users size={48} className="text-warning/40" strokeWidth={1.5} />
                </div>
                <p className="text-lg font-bold text-on-surface-variant">Warden information not available</p>
                <p className="text-sm text-on-surface-variant/70 max-w-md mt-2">
                  Please ensure your hostel assignment is valid in your profile.
                </p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Detail Modal Overlay */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-xl bg-surface/80 animate-in fade-in duration-500 overflow-y-auto pt-20">
          <div className="absolute inset-0 z-[-1] mesh-gradient opacity-20" />
          
          <Card className={`w-full ${selectedComplaint.status === 'resolved' ? 'max-w-6xl' : 'max-w-2xl'} bg-surface-container-low border-2 border-outline-variant p-0 relative shadow-[0_64px_96px_-12px_rgba(30,27,75,0.2)] overflow-hidden`}>
            <button 
              onClick={() => setSelectedComplaint(null)}
              className="absolute top-8 right-8 z-10 p-3 rounded-2xl bg-surface-container-high text-on-surface-variant hover:text-tertiary hover:rotate-90 transition-all duration-500"
            >
              <X size={20} strokeWidth={3} />
            </button>

            <div className={selectedComplaint.status === 'resolved' ? "grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-outline/10" : ""}>
              <div className="p-8 md:p-12">

              <div className="inline-flex p-5 bg-primary/10 text-primary rounded-2xl mb-10 ring-4 ring-primary/5">
                <FileText size={40} strokeWidth={2.5} />
              </div>
              
              <h2 className="display-font text-4xl md:text-5xl font-black text-on-surface leading-[0.9] tracking-tighter mb-6 uppercase tracking-wider">
                Case ID: {selectedComplaint.id.substring(0,8)}
              </h2>

              <div className="grid grid-cols-2 gap-8 mb-12">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-[0.2em] block">Category</span>
                  <span className="text-lg font-black text-on-surface uppercase tracking-tight">{selectedComplaint.category}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-[0.2em] block">Status</span>
                  <StatusBadge status={selectedComplaint.status} />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-[0.2em] block">Location</span>
                  <div className="flex items-center gap-2 text-on-surface font-bold">
                    <MapPin size={16} className="text-secondary" strokeWidth={2.5} />
                    {selectedComplaint.location}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-[0.2em] block">Logged Date</span>
                  <div className="flex items-center gap-2 text-on-surface font-bold">
                    <Calendar size={16} className="text-primary" strokeWidth={2.5} />
                    {new Date(selectedComplaint.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-high/50 p-8 rounded-2xl border border-outline/5 mb-10 group hover:border-primary/10 transition-colors">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-3">Issue Description</h4>
                <p className="text-on-surface font-medium leading-relaxed italic text-lg opacity-80">
                  "{getCleanDescription(selectedComplaint.description) || 'Operational anomaly reported.'}"
                </p>
              </div>

              {/* Student's Photos */}
              {selectedComplaint.photos && selectedComplaint.photos.length > 0 && (
                <div className="mb-10">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4">Your Evidence Photos</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {selectedComplaint.photos.map((photo, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden border border-outline/5 hover:border-primary/30 transition-all">
                        <img
                          src={photo}
                          alt={`Evidence ${idx + 1}`}
                          className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <span className="text-[8px] font-black text-white bg-primary/80 px-2 py-1 rounded-lg">Photo {idx + 1}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              </div>

              {selectedComplaint.status === 'resolved' && (
                <div className="p-8 md:p-12 bg-surface-container/30">
                  <div className="space-y-8">
                  {/* Technician Profile */}
                  <div className="p-8 bg-surface-container-high/30 rounded-3xl border border-outline/5">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary mb-6">Technician Protocol</h4>
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary text-xl font-black border-2 border-secondary/20 shadow-lg">
                        {(usersMap[selectedComplaint.assigned_to]?.name || "?").substring(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <h5 className="text-xl font-black text-on-surface uppercase tracking-tight">{usersMap[selectedComplaint.assigned_to]?.name || 'Institutional Staff'}</h5>
                        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-1 opacity-60">
                          Staff ID: <span className="text-secondary font-black">{usersMap[selectedComplaint.assigned_to]?.staff_id || 'N/A'}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Resolution Evidence (Staff Photo) */}
                  {getStaffLog(selectedComplaint.description)?.image && getStaffLog(selectedComplaint.description).image !== 'NO_IMAGE' && (
                    <div className="p-8 bg-success/5 rounded-3xl border border-success/10">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-success mb-6">Resolution Evidence (Post-Work)</h4>
                      <div className="aspect-video w-full rounded-2xl overflow-hidden border-2 border-success/10 shadow-2xl group/staff-img">
                        <img 
                          src={getStaffLog(selectedComplaint.description).image} 
                          alt="Resolution Proof" 
                          className="w-full h-full object-cover group-hover/staff-img:scale-105 transition-transform duration-700"
                        />
                      </div>
                      <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-4 opacity-60 italic">
                        "Official evidentiary proof uploaded by the maintenance unit upon task completion."
                      </p>
                    </div>
                  )}

                  {/* Feedback Form */}
                  <div className="p-10 bg-primary/5 rounded-3xl border-2 border-primary/20 relative group/feedback overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10 transition-opacity">
                      <Star size={100} strokeWidth={1} />
                    </div>
                    <div className="relative z-10">
                      <h4 className="display-font text-2xl font-black text-primary mb-2 uppercase tracking-tight">Resolution Feedback</h4>
                      <p className="text-sm text-on-surface-variant font-bold mb-8 leading-relaxed max-w-sm uppercase tracking-widest opacity-60">Please authenticate the quality of maintenance services provided.</p>
                      
                      <div className="flex space-x-2 text-tertiary mb-6">
                        {[1,2,3,4,5].map(star => (
                          <button 
                            key={star} 
                            className="p-1 hover:scale-125 hover:rotate-12 transition-all duration-300"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                          >
                            <Star 
                              size={40} 
                              className={`transition-colors ${(hoverRating || rating) >= star ? 'fill-primary text-primary' : 'text-on-surface-variant/30'}`} 
                            />
                          </button>
                        ))}
                      </div>

                      <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Enter operational commentary or details regarding the repair quality..."
                        className="w-full bg-surface-container border-2 border-outline/10 text-on-surface text-sm font-medium rounded-2xl p-5 outline-none focus:border-primary/40 focus:ring-8 focus:ring-primary/5 transition-all mb-8 resize-none shadow-inner"
                        rows="3"
                      />

                      <Button 
                        onClick={handleFeedbackSubmit} 
                        disabled={isSubmittingFeedback || rating === 0} 
                        className={`w-full py-5 text-sm font-black uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 active:scale-[0.98] ${rating === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isSubmittingFeedback ? 'Transmitting Data...' : 'Verify & Submit Transcript'}
                      </Button>
                    </div>
                  </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="px-12 py-8 bg-surface-container-highest/50 flex items-center gap-4">
              <MessageSquare size={16} className="text-on-surface-variant" strokeWidth={3} />
              <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Connect with Warden for priority resolution</span>
            </div>
          </Card>
        </div>
      )}
    </PortalLayout>
  );
}

