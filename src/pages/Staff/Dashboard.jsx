import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PortalLayout from '../../layouts/PortalLayout';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import ExportDropdown from '../../components/ui/ExportDropdown';
import { 
  ClipboardList, 
  MapPin, 
  AlertTriangle, 
  ChevronRight, 
  History, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Hammer,
  Search,
  Filter,
  Download,
  Activity,
  HardHat,
  Sparkles
} from 'lucide-react';

import { supabase } from '../../lib/supabase';
import { authService } from '../../lib/auth';

export default function StaffDashboard() {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const [assignedTasks, setAssignedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!currentUser) {
        console.warn('Mission Queue: No currentUser detected in session.');
        return;
      }
      
      console.log(`Mission Queue: Fetching tasks for Staff ID: ${currentUser.id}`);
      
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('assigned_to', currentUser.id)
        .neq('status', 'resolved')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Mission Queue: Supabase fetch error:', error);
        setError(`Database Error: ${error.message}`);
      } else {
        console.log(`Mission Queue: Successfully fetched ${data?.length || 0} tasks.`);
        setAssignedTasks(data || []);
      }
      setLoading(false);
    };

    fetchTasks();
  }, [currentUser]);

  const menuItems = [
    { id: 'tasks', label: 'My Queue', path: '/staff/dashboard', icon: ClipboardList },
    { id: 'history', label: 'Resolution Log', path: '/staff/history', icon: History }
  ];

  const pending = assignedTasks.filter(t => t.status === 'pending').length;
  const inProgress = assignedTasks.filter(t => t.status === 'in_progress').length;

  const stats = [
    { label: 'Pending Duty', value: pending, color: 'text-tertiary', icon: Clock, bg: 'bg-tertiary/5' },
    { label: 'Active Repairs', value: inProgress, color: 'text-secondary', icon: TrendingUp, bg: 'bg-secondary/5' },
    { label: 'Queue Load', value: assignedTasks.length, color: 'text-primary', icon: Activity, bg: 'bg-primary/5' }
  ];

  const exportColumns = [
    { header: 'Task ID', dataKey: 'id' },
    { header: 'Category', dataKey: 'category' },
    { header: 'Location', dataKey: 'location' },
    { header: 'Priority', dataKey: 'emergency' },
    { header: 'Status', dataKey: 'status' }
  ];
  
  const exportData = assignedTasks.map(t => ({
    ...t,
    emergency: t.is_emergency ? 'PRIORITY' : 'Standard'
  }));

  return (
    <PortalLayout menuItems={menuItems} roleName="Maintenance Staff">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 mb-4 animate-in fade-in slide-in-from-left-4 duration-700">
            <HardHat size={14} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Field Operations • Task Queue</span>
          </div>
          <h1 className="display-font text-5xl md:text-6xl font-black text-on-surface leading-[0.8] tracking-tighter mb-4">
            Work <span className="text-secondary text-glow-primary">Queue.</span>
          </h1>
          <p className="text-on-surface-variant font-medium text-lg max-w-lg">
            Manage your assigned maintenance tasks and update resolution status in real-time.
          </p>
        </div>
        <div className="flex gap-4 z-20">
          <ExportDropdown 
            data={exportData}
            columns={exportColumns}
            filename="maintenance-task-queue"
            title="Field Operations Task Queue"
          />
        </div>
      </div>

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} variant="glass" className="p-8 border border-outline/10 group hover:border-primary/30 transition-all duration-500 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon size={80} strokeWidth={1} />
              </div>
              <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                <Icon size={24} strokeWidth={2.5} />
              </div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-on-surface-variant font-black mb-1 block group-hover:text-primary transition-colors">{stat.label}</span>
              <span className={`display-font text-5xl font-black ${stat.color} tracking-tighter shadow-sm`}>{stat.value}</span>
            </Card>
          );
        })}
      </div>

      {/* Task List Table */}
      <Card variant="glass" className="p-0 overflow-hidden border border-outline/10 shadow-2xl animate-in fade-in zoom-in-95 duration-1000 delay-500">
        <div className="p-10 border-b border-outline/10 flex flex-col md:flex-row justify-between items-center gap-6 bg-surface/30">
          <CardHeader title="Field Assignments" subtitle="Current active tasks assigned to your tactical unit." className="mb-0 p-0" />
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} strokeWidth={2.5} />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              className="w-full bg-surface-container-low border border-outline/10 rounded-xl py-3 pl-12 pr-4 text-xs font-bold uppercase tracking-widest text-on-surface outline-none focus:border-primary/40 transition-all"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/[0.02]">
                <th className="px-10 py-6 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black">Ref ID</th>
                <th className="px-10 py-6 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black">Deployment Zone</th>
                <th className="px-10 py-6 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black">Criticality</th>
                <th className="px-10 py-6 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black">Status</th>
                <th className="px-10 py-6 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black text-right">Integrations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/5">
              {loading ? (
                <tr><td colSpan="5" className="px-10 py-8 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin">
                      <Activity size={20} className="text-secondary" strokeWidth={2.5} />
                    </div>
                    <span className="text-sm font-bold text-on-surface-variant">Loading task queue...</span>
                  </div>
                </td></tr>
              ) : error ? (
                <tr><td colSpan="5" className="px-10 py-8 text-center">
                  <div className="flex items-center justify-center gap-2 text-error">
                    <AlertTriangle size={20} strokeWidth={2.5} />
                    <span className="text-sm font-bold uppercase tracking-widest">{error}</span>
                  </div>
                </td></tr>
              ) : assignedTasks.length === 0 ? (
                <tr><td colSpan="5" className="px-10 py-8 text-center text-on-surface-variant font-bold text-sm">No assignments active in your queue.</td></tr>
              ) : assignedTasks.map((t) => (
                <tr key={t.id} className="hover:bg-secondary/[0.03] transition-all duration-300 group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-1.5 h-6 bg-secondary/20 rounded-full group-hover:bg-secondary transition-colors" />
                      <span className="font-black text-sm text-on-surface tracking-widest">
                        {t.id.substring(0,8).toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin size={12} className="text-secondary" strokeWidth={3} />
                        <span className="text-sm font-black text-on-surface tracking-tight uppercase">{t.location}</span>
                      </div>
                      <span className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest opacity-60 flex items-center gap-2">
                        {t.category} • {new Date(t.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    {t.is_emergency ? (
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-tertiary/10 text-tertiary border border-tertiary/20 rounded-lg text-[10px] font-black uppercase tracking-widest animate-pulse">
                        <AlertTriangle size={12} strokeWidth={3} />
                        Priority
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface-container-high text-on-surface-variant rounded-lg text-[10px] font-black uppercase tracking-widest opacity-60">
                        Standard
                      </span>
                    )}
                  </td>
                  <td className="px-10 py-8 flex items-center h-full pt-10">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="px-10 py-8 text-right">
                    <Button 
                      variant="secondary" 
                      className="font-black uppercase text-[10px] tracking-widest gap-2 bg-surface hover:bg-secondary/10 hover:text-secondary border border-outline/10 shadow-none transition-all duration-500 hover:translate-x-1"
                      onClick={() => navigate(`/staff/complaint/${t.id}`)}
                    >
                      Process Assignment
                      <ChevronRight size={14} strokeWidth={4} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* Tactical Illustration / Empty State Placeholder */}
      <div className="mt-20 opacity-[0.03] select-none pointer-events-none absolute bottom-10 right-10 flex flex-col items-end">
        <Sparkles size={200} strokeWidth={0.5} className="text-on-surface" />
        <span className="text-6xl font-black uppercase tracking-[0.2em] -mt-10 mr-10">TACTICAL UNIT</span>
      </div>
    </PortalLayout>
  );
}
