import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PortalLayout from '../../layouts/PortalLayout';
import { Card, CardHeader } from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import ComplaintActivityHeatmap from '../../components/ui/ComplaintActivityHeatmap';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  LayoutGrid, 
  FileText, 
  Users, 
  Activity, 
  TrendingUp, 
  AlertOctagon, 
  ClipboardList, 
  Clock, 
  CheckCircle2,
  Zap,
  ArrowUpRight,
  Filter,
  Calendar,
  Sparkle,
  HardHat
} from 'lucide-react';

import { supabase } from '../../lib/supabase';
import { authService } from '../../lib/auth';

const COLORS = ['#4f46e5', '#0ea5e9', '#f59e0b', '#10b981', '#a855f7', '#ef4444'];

export default function WardenDashboard() {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const wardenHostel = currentUser?.hostel_id;

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30); // 7, 14, 30, or 0 for all

  useEffect(() => {
    const fetchComplaints = async () => {
      if (!wardenHostel) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await supabase.from('complaints').select('*').eq('hostel_id', wardenHostel);
        if (data) setComplaints(data);
      } catch (err) {
        console.error('Error fetching complaints:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, [wardenHostel]);

  const menuItems = [
    { id: 'dashboard', label: 'Op Center', path: '/warden/dashboard', icon: LayoutGrid },
    { id: 'complaints', label: 'Grievances', path: '/warden/complaints', icon: ClipboardList },
    { id: 'completed', label: 'Resolved', path: '/warden/completed', icon: CheckCircle2 },
    { id: 'staff', label: 'Maintenance', path: '/warden/staff', icon: HardHat },
    { id: 'students', label: 'Residents', path: '/warden/students', icon: Users }
  ];

  const activeReports = complaints.filter(c => c.status !== 'resolved').length;
  
  const stats = [
    { label: 'Active Reports', value: activeReports, color: 'text-primary', icon: FileText, change: 'LIVE', trend: 'neutral' },
    { label: 'Unassigned', value: complaints.filter(c => !c.assigned_to).length, color: 'text-secondary', icon: Users, change: 'Urgent', trend: 'down' },
    { label: 'Critical Errors', value: complaints.filter(c => c.is_emergency).length, color: 'text-error', icon: AlertOctagon, change: 'SOS', trend: 'up' },
    { label: 'Total Handled', value: complaints.length, color: 'text-success', icon: ClipboardList, change: 'Global', trend: 'neutral' }
  ];

  // Dynamic Pie Data
  const categories = {};
  complaints.forEach(c => {
    categories[c.category] = (categories[c.category] || 0) + 1;
  });
  const pieData = Object.keys(categories).map(key => ({ name: key, value: categories[key] }));
  if (pieData.length === 0) pieData.push({ name: 'No Data', value: 100 });

  // Calculate Incident Velocity (real data - complaints per day)
  const getIncidentVelocityData = () => {
    const today = new Date();
    const daysToShow = timeRange || 30; // Default to 30 if 0
    const daysData = {};
    
    // Helper to get a stable local ISO date key (YYYY-MM-DD)
    const getLocalDateKey = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Initialize all days in range
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = getLocalDateKey(date);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      daysData[dateKey] = { name: dayName, count: 0, date: dateKey, fullDate: date };
    }
    
    // Count complaints per day
    complaints.forEach(complaint => {
      const dbDate = new Date(complaint.created_at);
      const complaintDate = getLocalDateKey(dbDate);
      if (daysData[complaintDate]) {
        daysData[complaintDate].count += 1;
      }
    });
    
    return Object.values(daysData);
  };

  const barData = getIncidentVelocityData();

  // Find active immediate crisis complaints
  const immediateCrisisComplaints = complaints.filter(c => 
    c.is_emergency && c.status !== 'resolved'
  );

  if (!currentUser) {
    return (
      <PortalLayout menuItems={[]} roleName="Warden">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-lg font-bold text-on-surface-variant">Loading your operations center...</p>
          </div>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout menuItems={menuItems} roleName="Warden">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 mb-4 animate-in fade-in slide-in-from-left-4 duration-700">
            <Activity size={14} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Mission Control • {wardenHostel}</span>
          </div>
          <h1 className="display-font text-5xl md:text-6xl font-black text-on-surface leading-[0.8] tracking-tighter mb-4">
            Operations Center<span className="text-primary">.</span>
          </h1>
          <p className="text-on-surface-variant font-medium text-lg max-w-lg">
            Monitor institutional flow, manage resources, and resolve critical incidents with clinical precision.
          </p>
        </div>
        <div className="flex gap-4 flex-wrap">
          <div className="flex gap-2 bg-surface-container-low p-2 rounded-xl border border-outline/10">
            {[
              { label: '7 Days', value: 7 },
              { label: '14 Days', value: 14 },
              { label: '30 Days', value: 30 },
              { label: 'All Time', value: 0 }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                  timeRange === option.value
                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <Button className="font-black uppercase text-xs tracking-widest gap-2 shadow-2xl shadow-primary/30 h-14 px-8">
            <Filter size={18} strokeWidth={2.5} />
            Filters
          </Button>
        </div>
      </div>

      {/* Real-time Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} variant="glass" className="p-8 border border-outline/10 group hover:border-primary/30 transition-all duration-500 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon size={80} strokeWidth={1} />
              </div>
              <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-xl bg-surface-container-high ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                  <Icon size={24} strokeWidth={2.5} />
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter ${stat.trend === 'up' ? 'text-success' : stat.trend === 'down' ? 'text-tertiary' : 'text-on-surface-variant'}`}>
                  {stat.change}
                  <TrendingUp size={12} className={stat.trend === 'down' ? 'rotate-180' : stat.trend === 'neutral' ? 'rotate-90' : ''} />
                </div>
              </div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-on-surface-variant font-black mb-1 block group-hover:text-primary transition-colors">{stat.label}</span>
              <span className={`display-font text-5xl font-black ${stat.color} tracking-tighter`}>{stat.value}</span>
            </Card>
          );
        })}
      </div>

      {/* Analytics Visualization Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
        <Card variant="glass" className="p-10 border border-outline/10 shadow-2xl">
          <div className="flex justify-between items-center mb-10">
            <CardHeader 
              title="Incident Velocity" 
              subtitle={`Daily grievance reports ${timeRange === 0 ? 'over all time' : `for the last ${timeRange} days`}.`} 
              className="mb-0 p-0" 
            />
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <ArrowUpRight size={20} strokeWidth={3} />
            </div>
          </div>
          <div className="h-80 w-full overflow-x-auto pb-2">
            <div style={{ minWidth: Math.max(700, barData.length * 40) }}>
              <ResponsiveContainer width={Math.max(700, barData.length * 40)} height={300}>
                <AreaChart data={barData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(148, 163, 184, 0.4)" 
                    tick={{fill: 'rgba(148, 163, 184, 0.6)', fontSize: 10, fontWeight: 900}} 
                    axisLine={false} 
                    tickLine={false}
                  />
                  <YAxis stroke="rgba(148, 163, 184, 0.4)" tick={{fill: 'rgba(148, 163, 184, 0.6)', fontSize: 10, fontWeight: 900}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{stroke: '#4f46e5', strokeWidth: 2}} 
                    contentStyle={{backgroundColor: 'var(--surface)', border: '1px solid var(--outline)', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'}} 
                  />
                  <Area type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        <Card variant="glass" className="p-10 border border-outline/10 shadow-2xl">
          <div className="flex justify-between items-center mb-10">
            <CardHeader title="Grievance Matrix" subtitle="Categorical distribution of reported facility anomalies." className="mb-0 p-0" />
            <div className="p-2 rounded-xl bg-secondary/10 text-secondary">
              <ArrowUpRight size={20} strokeWidth={3} />
            </div>
          </div>
          <div className="h-80 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={pieData} 
                  innerRadius={85} 
                  outerRadius={105} 
                  paddingAngle={8} 
                  dataKey="value" 
                  stroke="none"
                  animationBegin={0}
                  animationDuration={1500}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{backgroundColor: 'var(--surface)', border: '1px solid var(--outline)', borderRadius: '16px'}} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant">Active</span>
              <span className="display-font text-4xl font-black text-on-surface tracking-tighter leading-none">90%</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-8">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-3 bg-surface-container-low/50 px-4 py-2 rounded-xl border border-outline/5 hover:border-primary/10 transition-colors">
                <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: COLORS[i]}} />
                <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{d.name}</span>
                <span className="ml-auto text-xs font-black text-on-surface">{d.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Complaint Activity Heatmap */}
      <div className="mb-16 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-700">
        <ComplaintActivityHeatmap complaints={complaints} />
      </div>

      {/* Critical Alerts Section */}
      {immediateCrisisComplaints.length > 0 ? (
        <Card variant="glass" className="border-2 border-error/40 shadow-2xl shadow-error/20 relative overflow-hidden group/alert animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-700">
          <div className="absolute top-0 right-0 p-12 opacity-5 translate-x-12 translate-y-[-12] rotate-12 group-hover/alert:rotate-0 transition-transform duration-1000">
            <AlertOctagon size={180} strokeWidth={1} className="text-error" />
          </div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 py-10 px-12">
            <div className="flex items-center gap-6 flex-1">
              <div className="relative">
                <div className="absolute inset-0 bg-error blur-2xl opacity-30 animate-pulse" />
                <div className="relative p-6 bg-error text-white rounded-3xl shadow-xl shadow-error/40">
                  <AlertOctagon size={40} strokeWidth={2.5} />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 rounded-full bg-error animate-ping" />
                  <h3 className="display-font text-3xl font-black text-error leading-none uppercase tracking-tighter">IMMEDIATE CRISIS</h3>
                </div>
                <p className="text-on-surface-variant font-bold text-sm tracking-widest uppercase opacity-60">
                  Active Emergency. Help needed ASAP
                </p>
              </div>
            </div>
            
            <div className="w-full md:w-auto flex flex-col md:flex-row items-stretch gap-3">
              {immediateCrisisComplaints.slice(0, 2).map(complaint => (
                <div 
                  key={complaint.id}
                  onClick={() => navigate('/warden/complaints')}
                  className="bg-error/10 backdrop-blur-md p-6 rounded-2xl border border-error/20 flex-1 min-w-[280px] cursor-pointer hover:border-error/40 hover:bg-error/15 transition-all"
                >
                  <p className="text-xs font-black text-error tracking-tight uppercase mb-1">Crisis #{complaint.id.substring(0, 8)}</p>
                  <p className="text-sm font-black text-on-surface mb-2 line-clamp-2">{complaint.description}</p>
                  <p className="text-xs text-on-surface-variant">📍 {complaint.location || 'Location not specified'}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      ) : (
        <Card variant="glass" className="border-2 border-tertiary/20 shadow-2xl shadow-tertiary/5 relative overflow-hidden group/alert animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-700">
          <div className="absolute top-0 right-0 p-12 opacity-5 translate-x-12 translate-y-[-12] rotate-12 group-hover/alert:rotate-0 transition-transform duration-1000">
            <AlertOctagon size={180} strokeWidth={1} />
          </div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 py-10 px-12">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-tertiary blur-2xl opacity-20 animate-pulse" />
                <div className="relative p-6 bg-tertiary text-white rounded-3xl shadow-xl shadow-tertiary/40">
                  <AlertOctagon size={40} strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 rounded-full bg-tertiary animate-ping" />
                  <h3 className="display-font text-3xl font-black text-on-surface leading-none uppercase tracking-tighter">Tactical Alert</h3>
                </div>
                <p className="text-on-surface-variant font-bold text-sm tracking-widest uppercase opacity-60">High priority operational anomaly detected</p>
              </div>
            </div>
            
            <div className="w-full md:w-auto flex flex-col md:flex-row items-stretch md:items-center gap-6">
              <div className="bg-surface/50 backdrop-blur-md p-6 rounded-2xl border border-outline/5 flex-1 min-w-[300px]">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-black text-on-surface tracking-tight uppercase">Dashboard Operational</h4>
                  <StatusBadge status="resolved" />
                </div>
                <p className="text-xs text-on-surface-variant font-medium leading-relaxed italic border-l-2 border-primary pl-4 mt-4">
                  "No active emergencies at this time. All systems nominal."
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </PortalLayout>
  );
}


