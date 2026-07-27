import React, { useState, useEffect } from 'react';
import PortalLayout from '../../layouts/PortalLayout';
import { Card, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ExportDropdown from '../../components/ui/ExportDropdown';
import UserDetailModal from '../../components/ui/UserDetailModal';
import { supabase } from '../../lib/supabase';
import { authService } from '../../lib/auth';
import { 
  Users, 
  Search, 
  Download, 
  MapPin, 
  Mail, 
  Hash, 
  Calendar, 
  ClipboardList,
  LayoutGrid,
  HardHat,
  GraduationCap,
  CheckCircle2
} from 'lucide-react';

export default function WardenStudentList() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ total: 0, activeLogs: 0, newThisMonth: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const exportColumns = [
    { header: 'Name', dataKey: 'name' },
    { header: 'Registration', dataKey: 'registration_number' },
    { header: 'Email', dataKey: 'email' },
    { header: 'Room', dataKey: 'room_number' },
    { header: 'Role', dataKey: 'role' }
  ];

  const menuItems = [
    { id: 'dashboard', label: 'Op Center', path: '/warden/dashboard', icon: LayoutGrid },
    { id: 'complaints', label: 'Grievances', path: '/warden/complaints', icon: ClipboardList },
    { id: 'completed', label: 'Resolved', path: '/warden/completed', icon: CheckCircle2 },
    { id: 'staff', label: 'Maintenance', path: '/warden/staff', icon: HardHat },
    { id: 'students', label: 'Residents', path: '/warden/students', icon: Users }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setFilteredStudents(students.filter(s => 
        (s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.registration_number && s.registration_number.toLowerCase().includes(searchTerm.toLowerCase()))
      ));
    } else {
      setFilteredStudents(students);
    }
  }, [searchTerm, students]);

  const fetchData = async () => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return;
    
    // Fetch residents assigned to this warden's hostel
    const { data: studentData } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'student')
      .eq('hostel_id', currentUser.hostel_id);
      
    // Fetch active complaints (not resolved) for stats
    const { data: complaintsData } = await supabase
      .from('complaints')
      .select('*')
      .eq('hostel_id', currentUser.hostel_id)
      .neq('status', 'Resolved')
      .neq('status', 'Completed');
      
    if (studentData) {
      setStudents(studentData);
      
      const currentMonth = new Date().getMonth();
      const newThisMonthCount = studentData.filter(s => {
        if (!s.created_at) return false;
        return new Date(s.created_at).getMonth() === currentMonth;
      }).length;

      setStats({
        total: studentData.length,
        activeLogs: complaintsData ? complaintsData.length : 0,
        newThisMonth: newThisMonthCount
      });
    }
    setIsLoading(false);
  };

  const statCards = [
    { label: 'Total Residents', value: stats.total, color: 'text-on-surface', icon: Users },
    { label: 'Active Logs', value: stats.activeLogs, color: 'text-primary', icon: ClipboardList },
    { label: 'New This Month', value: stats.newThisMonth, color: 'text-success', icon: Calendar }
  ];

  return (
    <PortalLayout menuItems={menuItems} roleName="Warden">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 mb-4 animate-in fade-in slide-in-from-left-4 duration-700">
            <GraduationCap size={14} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Resident Management • Student Registry</span>
          </div>
          <h1 className="display-font text-5xl md:text-6xl font-black text-on-surface leading-[0.8] tracking-tighter mb-4">
            Resident <span className="text-primary text-glow-primary">Directory.</span>
          </h1>
          <p className="text-on-surface-variant font-medium text-lg max-w-lg mb-2">
            Centralized database of all active residents, housing allocations, and contact intelligence.
          </p>
        </div>
        <div className="flex gap-4 z-20">
          <ExportDropdown 
            data={filteredStudents}
            columns={exportColumns}
            filename="hostel-residents-directory"
            title="Resident Directory Export"
          />
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
        {statCards.map((stat, idx) => {
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
          <CardHeader title="Resident Registry" subtitle="Active student personnel currently allocated to hostel blocks." className="mb-0 p-0" />
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} strokeWidth={2.5} />
            <input 
              type="text" 
              placeholder="Search by Registration or Name..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-surface-container-low border border-outline/10 rounded-xl py-4 pl-12 pr-4 text-xs font-bold uppercase tracking-widest text-on-surface outline-none focus:border-primary/40 transition-all shadow-inner"
            />
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          {isLoading ? (
            <div className="p-16 text-center text-on-surface-variant/50 font-black tracking-widest uppercase text-xs flex flex-col items-center gap-4">
              <div className="w-8 h-8 rounded-xl border-4 border-primary/20 border-t-primary animate-spin" />
              Retrieving Database...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-16 text-center text-on-surface-variant font-black tracking-widest uppercase text-xs flex flex-col items-center gap-4">
              <Users size={48} className="opacity-20" />
              No personnel found in directory
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary/[0.02]">
                  <th className="px-10 py-6 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black">Resident Identity</th>
                  <th className="px-10 py-6 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black">Registration</th>
                  <th className="px-10 py-6 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black">Communication Loop</th>
                  <th className="px-10 py-6 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black">Strategic Allocation</th>
                  <th className="px-10 py-6 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black text-right">Registry Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/5 font-medium">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-primary/[0.03] transition-all duration-300 group">
                    <td className="px-10 py-8">
                      <div 
                        className="flex items-center gap-4 cursor-pointer group"
                        onClick={() => setSelectedStudent(s)}
                      >
                        {s.photo_url ? (
                          <img 
                            src={s.photo_url} 
                            alt={s.name}
                            className="w-10 h-10 rounded-full object-cover border border-outline/20 group-hover:scale-110 transition-transform"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs group-hover:scale-110 transition-transform">
                            {s.name ? s.name.substring(0, 2).toUpperCase() : '??'}
                          </div>
                        )}
                        <span className="font-black text-sm text-on-surface tracking-tight uppercase group-hover:text-primary transition-colors">
                          {s.name || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-2">
                        <Hash size={12} className="text-on-surface-variant opacity-60" strokeWidth={3} />
                        <span className="font-mono text-sm text-on-surface-variant tracking-widest font-black uppercase">
                          {s.registration_number || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-2 text-primary hover:underline underline-offset-4 cursor-pointer decoration-2 transition-all">
                        <Mail size={12} strokeWidth={3} />
                        <span className="text-xs font-black uppercase tracking-tight">{s.email}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin size={12} className="text-primary" strokeWidth={3} />
                          <span className="text-sm font-black text-on-surface tracking-tight uppercase">{s.hostel_id || 'unassigned'}</span>
                        </div>
                        <span className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest opacity-60">
                          {s.room_number ? `Room ${s.room_number}` : 'Awaiting Allocation'}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-black text-on-surface-variant tracking-widest uppercase">
                          {s.created_at ? new Date(s.created_at).toLocaleDateString() : 'Recent'}
                        </span>
                        <span className="text-[8px] text-on-surface-variant font-black uppercase tracking-widest opacity-40">System Synced</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
      
      {/* User Detail Modal */}
      <UserDetailModal user={selectedStudent} onClose={() => setSelectedStudent(null)} />

      {/* Decorative ambient background */}
      <div className="fixed top-0 right-0 w-[40%] h-[40%] bg-primary/5 blur-[160px] pointer-events-none z-[-1]" />
    </PortalLayout>
  );
}
