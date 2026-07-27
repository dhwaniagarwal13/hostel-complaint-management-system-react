import React, { useState, useEffect } from 'react';
import PortalLayout from '../../layouts/PortalLayout';
import { Card, CardHeader } from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import ExportDropdown from '../../components/ui/ExportDropdown';
import { 
  ClipboardList, 
  Search, 
  MapPin, 
  HardHat,
  Users,
  LayoutGrid,
  CheckCircle2,
  Calendar,
  Image as ImageIcon,
  MessageSquare,
  Star,
  FileCheck2
} from 'lucide-react';
import { authService } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

export default function WardenCompletedTasks() {
  const [completedWorks, setCompletedWorks] = useState([]);
  const [feedbacks, setFeedbacks] = useState({});
  const [usersMap, setUsersMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAudit, setSelectedAudit] = useState(null);

  const currentUser = authService.getCurrentUser();
  const wardenHostel = currentUser?.hostel_id;

  const fetchData = async () => {
    if (!wardenHostel) return;
    
    // Fetch Resolved Complaints
    const { data: cData } = await supabase
      .from('complaints')
      .select('*')
      .eq('hostel_id', wardenHostel)
      .eq('status', 'resolved')
      .order('resolved_at', { ascending: false });
      
    // Fetch Feedbacks
    const { data: fData } = await supabase.from('feedback').select('*');
    
    // Fetch all users to map names securely
    const { data: uData } = await supabase.from('users').select('id, name');
    
    if (cData) setCompletedWorks(cData);
    
    if (fData) {
      const fMap = {};
      fData.forEach(f => {
        // Can be multiple per complaint, we take newest
        fMap[f.complaint_id] = f;
      });
      setFeedbacks(fMap);
    }
    
    if (uData) {
      const map = {};
      uData.forEach(u => { map[u.id] = u.name; });
      setUsersMap(map);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [wardenHostel]);

  const filteredTasks = completedWorks.filter(c => 
    c.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (usersMap[c.assigned_to] && usersMap[c.assigned_to].toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const exportData = filteredTasks.map(c => ({
    id: c.id,
    resident: usersMap[c.student_id] || 'Unknown',
    location: c.location,
    category: c.category,
    specialist: usersMap[c.assigned_to] || 'Unknown',
    resolutionDate: c.resolved_at ? new Date(c.resolved_at).toLocaleDateString() : new Date(c.updated_at).toLocaleDateString(),
    feedbackRating: feedbacks[c.id] ? `${feedbacks[c.id].rating}/5` : 'Pending'
  }));

  const exportColumns = [
    { header: 'Case ID', dataKey: 'id' },
    { header: 'Resident', dataKey: 'resident' },
    { header: 'Location', dataKey: 'location' },
    { header: 'Category', dataKey: 'category' },
    { header: 'Specialist', dataKey: 'specialist' },
    { header: 'Resolved On', dataKey: 'resolutionDate' },
    { header: 'User Rating', dataKey: 'feedbackRating' }
  ];

  const menuItems = [
    { id: 'dashboard', label: 'Op Center', path: '/warden/dashboard', icon: LayoutGrid },
    { id: 'complaints', label: 'Grievances', path: '/warden/complaints', icon: ClipboardList },
    { id: 'completed', label: 'Resolved', path: '/warden/completed', icon: CheckCircle2 },
    { id: 'staff', label: 'Maintenance', path: '/warden/staff', icon: HardHat },
    { id: 'students', label: 'Residents', path: '/warden/students', icon: Users }
  ];

  const parseStaffLog = (description) => {
    let cleanDesc = description;
    let notes = 'No completion notes provided.';
    let image = null;

    if (description && description.includes('--- STAFF LOG ---')) {
      const parts = description.split('--- STAFF LOG ---');
      cleanDesc = parts[0].trim();
      const staffDetails = parts[1] || '';
      
      const noteMatch = staffDetails.match(/NOTES:(.*?)(IMAGE:|$)/s);
      if (noteMatch && noteMatch[1].trim()) notes = noteMatch[1].trim();
      
      const imageMatch = staffDetails.match(/IMAGE:(.*)/s);
      if (imageMatch && imageMatch[1].trim() && imageMatch[1].trim() !== 'NO_IMAGE') {
        image = imageMatch[1].trim();
      }
    }
    return { cleanDesc, notes, image };
  };

  return (
    <PortalLayout menuItems={menuItems} roleName="Warden">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/5 border border-success/10 mb-4 animate-in fade-in slide-in-from-left-4 duration-700">
            <FileCheck2 size={14} className="text-success" />
            <span className="text-[10px] font-black uppercase tracking-widest text-success">Intelligence Terminal • Completed Works</span>
          </div>
          <h1 className="display-font text-5xl md:text-6xl font-black text-on-surface leading-[0.8] tracking-tighter mb-4">
            Audit <span className="text-success text-glow-success">Logs.</span>
          </h1>
          <p className="text-on-surface-variant font-medium text-lg max-w-lg mb-2">
            Verify documentation, evidence, and community feedback on fully resolved tactical deployments.
          </p>
        </div>
        <div className="flex gap-4 z-20">
          <ExportDropdown 
            data={exportData}
            columns={exportColumns}
            filename="resolved-works-audit"
            title="Completed Works Master Audit"
          />
        </div>
      </div>

      {/* Main Table Area */}
      <Card variant="glass" className="p-0 overflow-hidden border border-outline/10 shadow-2xl animate-in fade-in zoom-in-95 duration-1000 delay-500">
        <div className="p-10 border-b border-outline/10 flex flex-col md:flex-row justify-between items-center gap-6 bg-surface/30">
          <CardHeader title="Resolution Ledger" subtitle="Immutable log of structurally signed-off anomalies." className="mb-0 p-0" />
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} strokeWidth={2.5} />
            <input 
              type="text" 
              placeholder="Search ID or Specialist..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-low border border-outline/10 rounded-xl py-4 pl-12 pr-4 text-xs font-bold uppercase tracking-widest text-on-surface outline-none focus:border-success/40 transition-all shadow-inner"
            />
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-success/[0.02]">
                <th className="px-10 py-6 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black">Ref ID</th>
                <th className="px-10 py-6 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black">Details</th>
                <th className="px-10 py-6 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black">Reporter</th>
                <th className="px-10 py-6 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black">Specialist</th>
                <th className="px-10 py-6 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black">Feedback Status</th>
                <th className="px-10 py-6 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant font-black text-right">Audit Record</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/5 font-medium">
              {loading ? (
                <tr><td colSpan="5" className="px-10 py-8 text-center text-on-surface-variant font-bold text-sm">Validating ledgers...</td></tr>
              ) : filteredTasks.length === 0 ? (
                <tr><td colSpan="6" className="px-10 py-8 text-center text-on-surface-variant font-bold text-sm">No resolved operational data found.</td></tr>
              ) : filteredTasks.map((c) => (
                <tr key={c.id} className="hover:bg-success/[0.03] transition-all duration-300 group" colSpan="6">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-1.5 h-6 rounded-full bg-success/20 group-hover:bg-success transition-colors" />
                      <span className="font-black text-sm text-on-surface tracking-widest">{c.id.substring(0,8).toUpperCase()}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-on-surface tracking-tight uppercase">{c.category}</span>
                      <span className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest opacity-60 flex items-center gap-2">
                        <MapPin size={10} strokeWidth={3} className="text-success" />
                        {c.location}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="text-xs font-black text-on-surface uppercase tracking-widest">
                      <div>{usersMap[c.student_id] || 'Unknown'}</div>
                      <span className="text-[10px] text-on-surface-variant opacity-60">Reporter</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                        <HardHat size={14} strokeWidth={3} />
                      </div>
                      <span className="text-xs font-black text-on-surface uppercase tracking-widest">
                        {usersMap[c.assigned_to] || 'Unknown Origin'}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    {feedbacks[c.id] ? (
                      <div className="flex items-center gap-2 text-tertiary">
                         <Star size={14} className="fill-tertiary" />
                         <span className="text-[10px] font-black uppercase tracking-[0.2em]">{feedbacks[c.id].rating}/5</span>
                      </div>
                    ) : (
                      <span className="text-[10px] uppercase font-black tracking-widest text-on-surface-variant/40">Not Rated</span>
                    )}
                  </td>
                  <td className="px-10 py-8 text-right">
                    <Button 
                      variant="secondary" 
                      onClick={() => setSelectedAudit(c)}
                      className="font-black uppercase text-[10px] tracking-[0.2em] gap-2 bg-surface hover:bg-success/10 hover:text-success border border-outline/10 shadow-none transition-all duration-500"
                    >
                      Audit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Audit Modal Overlay */}
      {selectedAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-xl bg-surface/80 animate-in fade-in duration-500 overflow-y-auto pt-20">
          <div className="absolute inset-0 z-[-1] mesh-gradient opacity-20" />
          
          <Card className="w-full max-w-4xl bg-surface-container-low border-2 border-outline-variant p-0 relative shadow-[0_64px_96px_-12px_rgba(30,27,75,0.2)] overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-2 bg-success`} />
            
            <div className="flex justify-between items-start p-10 border-b border-outline/5">
               <div>
                  <h2 className="display-font text-3xl font-black text-on-surface tracking-tighter uppercase leading-none mb-2">
                    Case {selectedAudit.id.substring(0,8)} <span className="text-on-surface-variant opacity-20">/ AUDIT</span>
                  </h2>
                  <div className="flex items-center gap-2">
                    <Calendar size={12} className="text-success" />
                    <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                       Completed on {selectedAudit.resolved_at ? new Date(selectedAudit.resolved_at).toLocaleString() : new Date(selectedAudit.updated_at).toLocaleString()}
                    </span>
                  </div>
               </div>
               <Button variant="secondary" onClick={() => setSelectedAudit(null)} className="h-10 px-4 text-[10px] font-black shadow-none border-outline/5 hover:bg-error/10 hover:text-error">
                  Close Audit
               </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-10">
               {/* Left Column: Staff Input */}
               <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary border-b border-outline/5 pb-2">Operational Debrief (Staff)</h4>
                  
                  {(() => {
                     const { notes, image } = parseStaffLog(selectedAudit.description);
                     return (
                        <>
                           <div className="p-6 bg-surface-container-high rounded-2xl border border-outline/5 text-sm font-medium leading-relaxed italic text-on-surface opacity-80">
                              "{notes}"
                           </div>
                           
                           {image && image !== 'NO_IMAGE' ? (
                             <div className="rounded-2xl border border-outline/10 overflow-hidden bg-black/5">
                               <img src={image} alt="Staff Visual Proof" className="w-full h-auto object-cover" />
                             </div>
                           ) : (
                             <div className="h-32 rounded-2xl border border-dashed border-outline/10 flex flex-col items-center justify-center gap-2 text-on-surface-variant/40">
                               <ImageIcon size={24} />
                               <span className="text-[8px] font-black uppercase tracking-widest">No visual evidence attached</span>
                             </div>
                           )}
                        </>
                     );
                  })()}
               </div>

               {/* Right Column: Resident Feedback */}
               <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-tertiary border-b border-outline/5 pb-2">Community Feedback (Resident)</h4>
                  
                  {feedbacks[selectedAudit.id] ? (
                     <div className="space-y-6">
                        <div className="flex items-center gap-2">
                           {[1,2,3,4,5].map(star => (
                              <Star key={star} size={32} className={`${feedbacks[selectedAudit.id].rating >= star ? 'fill-tertiary text-tertiary shadow-sm' : 'text-outline/20'}`} />
                           ))}
                        </div>
                        <div className="p-6 bg-tertiary/5 rounded-2xl border border-tertiary/10 relative">
                           <MessageSquare size={16} className="absolute top-6 right-6 text-tertiary/40" />
                           <span className="text-[10px] font-black text-tertiary uppercase tracking-widest mb-2 block">Resident Commentary</span>
                           <p className="text-sm font-medium leading-relaxed text-on-surface">
                              "{feedbacks[selectedAudit.id].comment || 'No textual feedback provided.'}"
                           </p>
                        </div>
                     </div>
                  ) : (
                     <div className="h-full flex flex-col items-center justify-center p-6 border border-dashed border-outline/10 rounded-2xl text-on-surface-variant opacity-50">
                        <Star size={40} className="mb-4" strokeWidth={1} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-center max-w-[200px]">Awaiting resident verification and rating.</span>
                     </div>
                  )}
               </div>
            </div>
            
          </Card>
        </div>
      )}
    </PortalLayout>
  );
}
