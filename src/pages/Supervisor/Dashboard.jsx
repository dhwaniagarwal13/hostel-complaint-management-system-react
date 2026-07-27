import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { HOSTELS } from '../../constants/hostels';
import PortalLayout from '../../layouts/PortalLayout';
import { Card, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ExportDropdown from '../../components/ui/ExportDropdown';
import UserDetailModal from '../../components/ui/UserDetailModal';
import {
  Database,
  Users,
  ShieldCheck,
  HardHat,
  Building2,
  Upload,
  Download,
  Plus,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  LayoutGrid,
  Trash2,
  MapPin,
  Activity
} from 'lucide-react';

const tabs = [
  { id: 'Hostels', icon: Building2 },
  { id: 'Students', icon: Users },
  { id: 'Wardens', icon: ShieldCheck },
  { id: 'Staff', icon: HardHat }
];

export default function SupervisorDashboard() {
  const [activeTab, setActiveTab] = useState('Students');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHostel, setSelectedHostel] = useState('All');
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    let query = supabase.from('users').select('*');

    // Convert activeTab to role (e.g. 'Students' -> 'student')
    const roleMap = {
      'Students': 'student',
      'Wardens': 'warden',
      'Staff': 'staff'
    };

    if (roleMap[activeTab]) {
      query = query.eq('role', roleMap[activeTab]);
    }

    // Filter by hostel if not 'All' and not viewing global Staff
    if (selectedHostel !== 'All' && activeTab !== 'Staff') {
      query = query.eq('hostel_id', selectedHostel);
    }

    const { data } = await query;
    if (data) setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'Hostels') {
      setUsers([]);
      setLoading(false);
      return;
    }
    fetchUsers();
  }, [activeTab, selectedHostel]);

  const handleDeleteUser = async (id) => {
    if (!window.confirm("CONFIRMATION: Revoke user access permanently?")) return;
    try {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;
      setUsers(users.filter(u => u.id !== id));
    } catch (e) {
      alert("Failed to delete user.");
    }
  };

  const filteredUsers = users.filter(user => {
    const s = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(s) ||
      user.email?.toLowerCase().includes(s) ||
      user.registration_number?.toLowerCase().includes(s) ||
      user.staff_id?.toLowerCase().includes(s) ||
      user.warden_id?.toLowerCase().includes(s)
    );
  });

  const menuItems = [
    { id: 'dashboard', label: 'Master Arch', path: '/supervisor/dashboard', icon: Database }
  ];

  const exportColumns = [
    { header: 'System ID', dataKey: 'id' },
    { header: 'Personnel Name', dataKey: 'name' },
    { header: 'Email Address', dataKey: 'email' },
    { header: 'Role Category', dataKey: 'role' },
    { header: 'Hostel Allocation', dataKey: 'hostel_id' }
  ];

  return (
    <PortalLayout menuItems={menuItems} roleName="System Supervisor">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 mb-4 animate-in fade-in slide-in-from-left-4 duration-700">
            <Database size={14} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Master Directory • Core Intelligence</span>
          </div>
          <h1 className="display-font text-5xl md:text-6xl font-black text-on-surface leading-[0.8] tracking-tighter mb-4">
            Master <span className="text-primary text-glow-primary">Arch.</span>
          </h1>
          <p className="text-on-surface-variant font-medium text-lg max-w-lg">
            Architect and manage the central whitelists, facility data, and authentication tiers.
          </p>
        </div>
        <div className="flex gap-4">
          <select
            value={selectedHostel}
            onChange={(e) => setSelectedHostel(e.target.value)}
            className="bg-surface-container-low border border-outline/10 text-on-surface text-xs font-black uppercase tracking-widest rounded-xl px-4 py-4 outline-none focus:border-primary/40 transition-all cursor-pointer"
          >
            <option value="All">Global Matrix (All Hostels)</option>
            {HOSTELS.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
          <div className="z-20">
            <ExportDropdown
              data={users}
              columns={exportColumns}
              filename={`${activeTab.toLowerCase()}-master-registry`}
              title={`${activeTab} Master Registry`}
            />
          </div>
        </div>
      </div>

      {/* Modern Tabs Selection */}
      <div className="flex space-x-3 overflow-x-auto pb-4 mb-10 no-scrollbar animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center gap-3
                ${isActive
                  ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105 ring-4 ring-primary/10'
                  : 'bg-surface-container-low text-on-surface-variant border border-outline/5 hover:border-primary/30 hover:text-on-surface'
                }
              `}
            >
              <Icon size={16} strokeWidth={3} className={isActive ? 'animate-pulse' : ''} />
              {tab.id}
            </button>
          );
        })}
      </div>

      {/* Main Data Exploration Area */}
      <Card variant="glass" className="p-0 overflow-hidden border border-outline/10 shadow-2xl animate-in fade-in zoom-in-95 duration-1000 delay-500 relative">
        <div className="p-10 border-b border-outline/10 flex flex-col md:flex-row justify-between items-center gap-6 bg-surface/30">
          <CardHeader title={`${activeTab} Registry`} subtitle="Centralized administrative data management and synchronization." className="mb-0 p-0" />
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} strokeWidth={2.5} />
            <input
              type="text"
              placeholder={`Search ${activeTab.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-container-high/50 border border-outline/10 rounded-xl py-4 pl-12 pr-4 text-xs font-bold uppercase tracking-widest text-on-surface outline-none focus:border-primary/40 transition-all shadow-inner"
            />
          </div>
        </div>

        {activeTab === 'Hostels' ? (
          <div className="flex flex-col items-center justify-center text-center py-32 px-10 relative overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none">
              <Database size={600} strokeWidth={0.5} className="text-on-surface absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="relative z-10 space-y-10 max-w-xl">
              <div className="space-y-4">
                <h3 className="display-font text-3xl font-black text-on-surface tracking-tighter uppercase leading-none">
                  Facility Matrix <span className="text-primary">Secured.</span>
                </h3>
                <p className="text-on-surface-variant font-medium text-lg leading-relaxed opacity-60">
                  Select a personnel tab above to actively manage the access credentials and assignments across all hostel sectors.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary/[0.02]">
                  <th className="px-10 py-6 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black">Name & Designation</th>
                  <th className="px-10 py-6 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black">
                    {activeTab === 'Students' ? 'Reg Number' : activeTab === 'Wardens' ? 'Warden ID' : 'Staff ID'}
                  </th>
                  <th className="px-10 py-6 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black">Email</th>
                  <th className="px-10 py-6 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black">Assigned Hostel</th>
                  <th className="px-10 py-6 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/5 font-medium">
                {loading ? (
                  <tr><td colSpan="4" className="px-10 py-8 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin">
                        <Activity size={20} className="text-primary" strokeWidth={2.5} />
                      </div>
                      <span className="text-sm font-bold text-on-surface-variant">Loading credentials...</span>
                    </div>
                  </td></tr>
                ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan="5" className="px-10 py-8 text-center text-error font-bold text-sm">No profiles found matching "{searchTerm}" for {activeTab}.</td></tr>
                ) : filteredUsers.map(user => {
                  // Get role-specific ID
                  const getRoleId = () => {
                    if (activeTab === 'Students') return user.registration_number || 'N/A';
                    if (activeTab === 'Wardens') return user.staff_id || user.warden_id || 'N/A';
                    if (activeTab === 'Staff') return user.staff_id || 'N/A';
                    return 'N/A';
                  };

                  return (
                    <tr key={user.id} className="hover:bg-primary/[0.03] transition-colors group cursor-pointer" onClick={() => setSelectedUser(user)}>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-3">
                          {user.photo_url ? (
                            <img
                              src={user.photo_url}
                              alt={user.name}
                              className="w-8 h-8 rounded-full object-cover border border-outline/20"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-black text-primary">
                              {user.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-on-surface tracking-tight uppercase hover:text-primary transition-colors">{user.name}</span>
                            <span className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest">{user.role}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8 font-mono font-black text-sm text-on-surface tracking-widest">
                        {getRoleId()}
                      </td>
                      <td className="px-10 py-8">
                        <span className="text-xs font-black text-primary uppercase tracking-widest">{user.email}</span>
                      </td>
                      <td className="px-10 py-8 flex items-center gap-2">
                        <MapPin size={12} className="text-on-surface-variant/50" />
                        <span className="text-xs font-black text-on-surface-variant uppercase">{user.hostel_id || 'Department of Staff'}</span>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <Button onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteUser(user.id);
                        }} variant="danger" className="bg-error text-white text-[10px] tracking-widest font-black uppercase py-2 px-4 shadow-xl shadow-error/20 gap-2">
                          <Trash2 size={12} strokeWidth={3} />
                          Revoke
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-10 py-6 bg-surface-container-highest/50 flex items-center justify-between border-t border-outline/5">
          <div className="flex items-center gap-3">
            <Sparkles size={14} className="text-primary" />
            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Active Data Link</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${loading ? 'bg-error animate-pulse' : 'bg-success'}`} />
            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">{loading ? 'Fetching' : 'Synchronized'}</span>
          </div>
        </div>
      </Card>

      {/* User Detail Modal */}
      <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />

      {/* Dynamic Ambient Blur */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/5 blur-[160px] pointer-events-none z-[-1]" />
    </PortalLayout>
  );
}

