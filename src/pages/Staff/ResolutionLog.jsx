import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PortalLayout from '../../layouts/PortalLayout';
import { Card, CardHeader } from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import { 
  ClipboardList, 
  History, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  Download, 
  TrendingUp,
  Activity,
  HardHat,
  ChevronRight,
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  ShieldCheck
} from 'lucide-react';

import { supabase } from '../../lib/supabase';
import { authService } from '../../lib/auth';
import ExportDropdown from '../../components/ui/ExportDropdown';

export default function ResolutionLog() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const currentUser = authService.getCurrentUser();
  const [historyLogs, setHistoryLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [avgTimeStr, setAvgTimeStr] = useState('N/A');
  const [avgSatisfied, setAvgSatisfied] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!currentUser) return;
      
      console.log(`Resolution Log: Fetching history for Staff ID: ${currentUser.id}`);
      
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('assigned_to', currentUser.id)
        .eq('status', 'resolved')
        .order('resolved_at', { ascending: false });
      
      if (error) {
        console.error('Resolution Log: Supabase fetch error:', error);
      } else if (data) {
        console.log(`Resolution Log: Successfully fetched ${data.length} resolved tasks.`);
        setHistoryLogs(data);

        // Calculate real avg resolution time
        const validTimes = data.filter(c => c.created_at && c.resolved_at).map(c => {
          const diff = new Date(c.resolved_at) - new Date(c.created_at);
          return diff / (1000 * 60); // minutes
        });
        if (validTimes.length > 0) {
          const avg = validTimes.reduce((a, b) => a + b, 0) / validTimes.length;
          if (avg < 60) setAvgTimeStr(`${Math.round(avg)}m`);
          else setAvgTimeStr(`${(avg / 60).toFixed(1)}h`);
        }

        // Fetch feedback for these complaints to compute avg satisfaction
        if (data.length > 0) {
          const ids = data.map(c => c.id);
          const { data: feedbackData } = await supabase
            .from('feedback')
            .select('rating')
            .in('complaint_id', ids);
          if (feedbackData && feedbackData.length > 0) {
            const avg = feedbackData.reduce((a, b) => a + (b.rating || 0), 0) / feedbackData.length;
            setAvgSatisfied(avg.toFixed(1));
          }
        }
      }
      setLoading(false);
    };
    fetchHistory();
  }, [currentUser]);

  const filteredHistory = historyLogs.filter(item => 
    item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateHours = (created, resolved) => {
    if (!created || !resolved) return 'N/A';
    const ms = new Date(resolved) - new Date(created);
    const hrs = (ms / (1000 * 60 * 60)).toFixed(1);
    return hrs > 0 ? `${hrs}h` : '< 1h';
  };

  const menuItems = [
    { id: 'tasks', label: 'My Queue', path: '/staff/dashboard', icon: ClipboardList },
    { id: 'history', label: 'Resolution Log', path: '/staff/history', icon: History }
  ];

  const exportColumns = [
    { header: 'Case ID', dataKey: 'id' },
    { header: 'Category', dataKey: 'category' },
    { header: 'Location', dataKey: 'location' },
    { header: 'Completion Date', dataKey: 'resolved_at' }
  ];

  return (
    <PortalLayout menuItems={menuItems} roleName="Maintenance Staff">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
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
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/5 border border-secondary/10 mb-4 animate-in fade-in slide-in-from-left-4 duration-700">
                <History size={14} className="text-secondary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Mission Archive • Resolution Logs</span>
              </div>
              <h1 className="display-font text-5xl md:text-6xl font-black text-on-surface leading-[0.8] tracking-tighter mb-4 animate-in fade-in slide-in-from-left-6 duration-700">
                The <span className="text-secondary text-glow-primary">Record.</span>
              </h1>
              <p className="text-on-surface-variant font-medium text-lg max-w-lg mb-0 animate-in fade-in slide-in-from-left-8 duration-1000">
                Immutable audit of all resolved grievances and field operations.
              </p>
            </div>
            <div className="flex gap-4 animate-in fade-in slide-in-from-right-8 duration-1000 z-20 relative">
              <ExportDropdown 
                data={historyLogs}
                columns={exportColumns}
                filename="personal-resolution-archive"
                title="Staff Historical Resolution Log"
              />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          {[
            { label: 'Total Resolved', value: historyLogs.length, color: 'text-success', icon: CheckCircle2 },
            { label: 'Avg Time', value: historyLogs.length > 0 ? avgTimeStr : '—', color: 'text-secondary', icon: Clock },
            { label: 'Satisfied', value: avgSatisfied !== null ? `${avgSatisfied}/5 ★` : '—', color: 'text-tertiary', icon: ShieldCheck }
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} variant="glass" className="p-6 border border-outline/10 hover:border-secondary/30 transition-all duration-500 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Icon size={64} strokeWidth={1} />
                </div>
                <div className={`w-10 h-10 rounded-xl bg-surface-container-high ${stat.color} flex items-center justify-center mb-4`}>
                  <Icon size={20} strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1 block">{stat.label}</span>
                <span className={`display-font text-3xl font-black ${stat.color} tracking-tighter`}>{stat.value}</span>
              </Card>
            );
          })}
        </div>

        {/* Search & Filter Bar */}
        <Card variant="glass" className="p-0 border border-outline/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-1000 delay-500">
          <div className="p-8 border-b border-outline/10 flex flex-col md:flex-row justify-between items-center gap-6 bg-surface/30">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-secondary/10 text-secondary rounded-xl">
                <History size={20} strokeWidth={3} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-on-surface leading-tight">Resolution History</h3>
                <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest mt-1">Audit of completed deployments</p>
              </div>
            </div>
            
            <div className="flex w-full md:w-auto gap-4">
              <div className="relative flex-1 md:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} strokeWidth={2.5} />
                <input 
                  type="text" 
                  placeholder="ID, Student or Zone..." 
                  className="w-full bg-surface-container-low border border-outline/10 rounded-xl py-3.5 pl-12 pr-4 text-xs font-black uppercase tracking-widest text-on-surface outline-none focus:border-secondary/40 transition-all placeholder:opacity-30"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="secondary" className="p-3.5 border border-outline/10 rounded-xl shadow-none h-auto">
                <Filter size={18} />
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-secondary/[0.02]">
                  <th className="px-8 py-5 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black">Ref ID</th>
                  <th className="px-8 py-5 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black">Subject Resident</th>
                  <th className="px-8 py-5 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black">Date Completed</th>
                  <th className="px-8 py-5 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black">Time Taken</th>
                  <th className="px-8 py-5 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black">Resolution Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/5 font-medium">
                {loading ? (
                  <tr><td colSpan="5" className="px-8 py-8 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin">
                        <Activity size={20} className="text-secondary" strokeWidth={2.5} />
                      </div>
                      <span className="text-sm font-bold text-on-surface-variant">Loading resolution history...</span>
                    </div>
                  </td></tr>
                ) : filteredHistory.length === 0 ? (
                  <tr><td colSpan="5" className="px-8 py-8 text-center text-sm font-bold text-on-surface-variant">No operational history found.</td></tr>
                ) : filteredHistory.map((item) => {
                  
                  // Extract completion notes cleanly from description hack
                  let displayNotes = 'Verified & Resolved';
                  if (item.description && item.description.includes('--- STAFF LOG ---')) {
                    const parts = item.description.split('--- STAFF LOG ---');
                    const staffDetails = parts[1] || '';
                    const noteMatch = staffDetails.match(/NOTES:(.*?)(IMAGE:|$)/s);
                    if (noteMatch && noteMatch[1].trim()) {
                      displayNotes = noteMatch[1].trim();
                    }
                  }

                  return (
                    <tr key={item.id} className="hover:bg-secondary/[0.03] transition-all duration-300 group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-1 h-4 bg-secondary/30 rounded-full group-hover:bg-secondary transition-colors" />
                          <span className="font-black text-xs text-on-surface tracking-widest">{item.id.substring(0,8).toUpperCase()}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-xs text-on-surface flex flex-col gap-0.5 mt-2">
                        <span className="font-black uppercase tracking-tighter text-sm mb-1">{item.category}</span>
                        <span className="text-[10px] uppercase tracking-widest opacity-60 font-black flex items-center gap-2">
                          <MapPin size={10} strokeWidth={3} className="text-secondary" />
                          {item.location}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-xs">
                         <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface-container-high rounded-lg text-[10px] font-black uppercase tracking-widest opacity-60">
                          <Calendar size={12} strokeWidth={3} />
                          {new Date(item.resolved_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-xs">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-success/10 text-success rounded-lg text-[10px] font-black uppercase tracking-widest">
                          <Clock size={12} strokeWidth={3} />
                          {calculateHours(item.created_at, item.resolved_at)}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-xs italic opacity-80 max-w-xs truncate font-medium">
                        {displayNotes}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>


    </PortalLayout>
  );
}
