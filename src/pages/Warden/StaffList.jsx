import React, { useState, useEffect } from 'react';
import PortalLayout from '../../layouts/PortalLayout';
import { Card, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ExportDropdown from '../../components/ui/ExportDropdown';
import UserDetailModal from '../../components/ui/UserDetailModal';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  HardHat, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Activity, 
  ChevronRight,
  ClipboardList,
  LayoutGrid,
  Zap,
  ShieldCheck,
  Mail
} from 'lucide-react';

import { supabase } from '../../lib/supabase';

export default function WardenStaffList() {
  const menuItems = [
    { id: 'dashboard', label: 'Op Center', path: '/warden/dashboard', icon: LayoutGrid },
    { id: 'complaints', label: 'Grievances', path: '/warden/complaints', icon: ClipboardList },
    { id: 'completed', label: 'Resolved', path: '/warden/completed', icon: CheckCircle2 },
    { id: 'staff', label: 'Maintenance', path: '/warden/staff', icon: HardHat },
    { id: 'students', label: 'Residents', path: '/warden/students', icon: Users }
  ];

  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const exportColumns = [
    { header: 'System ID', dataKey: 'id' },
    { header: 'Personnel Name', dataKey: 'name' },
    { header: 'Expertise', dataKey: 'category' },
    { header: 'Operational Status', dataKey: 'statusBadge' },
    { header: 'Active Deployments', dataKey: 'activeCount' }
  ];

  useEffect(() => {
    const fetchStaff = async () => {
      const { data: sData, error } = await supabase.from('users').select('*').eq('role', 'staff');
      const { data: cData } = await supabase.from('complaints').select('assigned_to, status');
      
      if (!error && sData) {
        const enriched = sData.map(u => {
          const active = cData?.filter(c => c.assigned_to === u.id && c.status !== 'resolved').length || 0;
          return {
            ...u,
            activeCount: active,
            statusBadge: active > 0 ? 'Busy' : 'Free'
          };
        });
        setStaffList(enriched);
      }
      setLoading(false);
    };
    fetchStaff();
  }, []);

  const stats = [
    { label: 'Total Personnel', value: staffList.length, color: 'text-on-surface', icon: Users },
    { label: 'Active Duty', value: staffList.filter(s => s.statusBadge === 'Busy').length, color: 'text-secondary', icon: Activity },
    { label: 'Available Now', value: staffList.filter(s => s.statusBadge === 'Free').length, color: 'text-success', icon: CheckCircle2 },
    { label: 'Avg Efficiency', value: '98%', color: 'text-primary', icon: Zap }
  ];

  return (
    <PortalLayout menuItems={menuItems} roleName="Warden">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/5 border border-secondary/10 mb-4 animate-in fade-in slide-in-from-left-4 duration-700">
            <HardHat size={14} className="text-secondary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Personnel Management • Field Staff</span>
          </div>
          <h1 className="display-font text-5xl md:text-6xl font-black text-on-surface leading-[0.8] tracking-tighter mb-4">
            Maintenance <span className="text-secondary text-glow-primary">Corps.</span>
          </h1>
          <p className="text-on-surface-variant font-medium text-lg max-w-lg mb-2">
            Monitor technician availability, operational zones, and performance metrics across the hostel grid.
          </p>
        </div>
        <div className="flex gap-4 z-20">
          <ExportDropdown 
            data={staffList}
            columns={exportColumns}
            filename="maintenance-personnel-registry"
            title="Maintenance Corps Registry"
          />
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} variant="glass" className="p-8 border border-outline/10 group hover:border-secondary/30 transition-all duration-500 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon size={80} strokeWidth={1} />
              </div>
              <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center mb-6 border border-outline/5 group-hover:scale-110 transition-transform duration-500">
                <Icon size={24} strokeWidth={2.5} className={stat.color} />
              </div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-on-surface-variant font-black mb-1 block group-hover:text-secondary transition-colors">{stat.label}</span>
              <span className={`display-font text-5xl font-black ${stat.color} tracking-tighter shadow-sm`}>{stat.value}</span>
            </Card>
          );
        })}
      </div>

      {/* Main Table Area */}
      <Card variant="glass" className="p-0 overflow-hidden border border-outline/10 shadow-2xl animate-in fade-in zoom-in-95 duration-1000 delay-500">
        <div className="p-10 border-b border-outline/10 flex flex-col md:flex-row justify-between items-center gap-6 bg-surface/30">
          <CardHeader title="Technician Directory" subtitle="Operational status of all maintenance and utility personnel." className="mb-0 p-0" />
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} strokeWidth={2.5} />
            <input 
              type="text" 
              placeholder="Search by name or skill..." 
              className="w-full bg-surface-container-low border border-outline/10 rounded-xl py-4 pl-12 pr-4 text-xs font-bold uppercase tracking-widest text-on-surface outline-none focus:border-secondary/40 transition-all shadow-inner"
            />
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/[0.02]">
                <th className="px-10 py-6 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black">ID Ref</th>
                <th className="px-10 py-6 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black">Personnel Info</th>
                <th className="px-10 py-6 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black">Skills & Intel</th>
                <th className="px-10 py-6 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black">Tactical Area</th>
                <th className="px-10 py-6 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black">Status</th>
                <th className="px-10 py-6 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black text-right">Metrics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/5 font-medium">
              {loading ? (
                <tr><td colSpan="6" className="px-10 py-8 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin">
                      <Activity size={20} className="text-primary" strokeWidth={2.5} />
                    </div>
                    <span className="text-sm font-bold text-on-surface-variant">Loading staff...</span>
                  </div>
                </td></tr>
              ) : staffList.length === 0 ? (
                <tr><td colSpan="6" className="px-10 py-8 text-center text-on-surface-variant font-bold text-sm">No maintenance staff found in intelligence array.</td></tr>
              ) : staffList.map((s) => (
                <tr key={s.id} className="hover:bg-secondary/[0.03] transition-all duration-300 group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-1.5 h-6 bg-secondary/20 rounded-full group-hover:bg-secondary transition-colors" />
                      <span className="font-black text-sm text-on-surface tracking-widest">
                        {s.id.substring(0,8).toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div 
                      className="flex items-center gap-4 cursor-pointer group"
                      onClick={() => setSelectedStaff(s)}
                    >
                      {s.photo_url ? (
                        <img 
                          src={s.photo_url} 
                          alt={s.name}
                          className="w-10 h-10 rounded-xl object-cover border border-outline/5 group-hover:border-secondary group-hover:scale-110 transition-all"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-on-surface-variant border border-outline/5 group-hover:border-secondary group-hover:text-secondary transition-colors">
                          <HardHat size={18} strokeWidth={2} />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-on-surface tracking-tight uppercase group-hover:text-secondary transition-colors">{s.name}</span>
                        <span className="text-[10px] text-on-surface-variant/50 font-bold uppercase tracking-widest">{s.category || 'General'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-wrap gap-2">
                       <span className="text-[8px] font-black text-secondary uppercase tracking-widest py-1 px-2 bg-secondary/10 rounded-md border border-secondary/10">
                          {s.category || 'Maintenance Generalist'}
                       </span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-2">
                      <MapPin size={12} className="text-on-surface-variant opacity-60" strokeWidth={3} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Cross-Hostel Tactical Units</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className={`px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-black rounded-xl backdrop-blur-md border ${
                      s.statusBadge === 'Free' 
                        ? 'bg-success/10 text-success border-success/20' 
                        : 'bg-tertiary/10 text-tertiary border-tertiary/20 animate-pulse'
                    }`}>
                      {s.statusBadge === 'Free' ? 'Standby' : 'Deployed'}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-black text-on-surface tracking-widest uppercase">{s.activeCount} Active Duties</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* User Detail Modal */}
      <UserDetailModal user={selectedStaff} onClose={() => setSelectedStaff(null)} />

      {/* Decorative ambient background */}
      <div className="fixed bottom-0 left-[10%] w-[50%] h-[30%] bg-secondary/5 blur-[120px] pointer-events-none z-[-1]" />
    </PortalLayout>
  );
}
