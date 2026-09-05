import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import StatusBadge from '../../components/StatusBadge';

export default function AuthorityCivic() {
  const { civic_issues, updateCivicIssueStatus, addCivicIssue } = useAppStore();
  const { token, user } = useAuthStore();
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIssue, setNewIssue] = useState({
    title: '',
    description: '',
    category: 'pothole',
    latitude: 19.0760,
    longitude: 72.8777
  });

  const filteredIssues = filterStatus === 'all' 
    ? civic_issues 
    : civic_issues.filter(i => i.status === filterStatus);

  const handleStatusChange = (id: string, newStatus: string) => {
    if (token) {
      updateCivicIssueStatus(id, newStatus as any, token);
    }
  };

  const handleAddIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      await addCivicIssue(newIssue as any, token);
      alert('Civic issue registered successfully.');
      setShowAddForm(false);
      setNewIssue({ ...newIssue, title: '', description: '' });
    } catch (err) {
      alert("Failed to submit civic issue");
    }
  };

  return (
    <div className="col-span-1 md:col-span-3 space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800">Civic Issues Management</h2>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-xs font-bold bg-amber-600 text-white px-3 py-1.5 rounded hover:bg-amber-700 transition"
          >
            {showAddForm ? 'CANCEL' : '+ ADD ISSUE'}
          </button>
          
          <div className="w-px h-6 bg-slate-200 mx-1"></div>

          <label className="text-xs font-bold uppercase text-slate-400">Filter by Status:</label>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-sm border border-slate-200 rounded px-2 py-1 bg-slate-50 focus:outline-none focus:border-blue-400"
          >
            <option value="all">All Issues</option>
            <option value="open">Open</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddIssue} className="bg-white p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 items-end shadow-sm">
           <div className="col-span-1 md:col-span-2">
             <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Title</label>
             <input required type="text" className="w-full text-sm border border-slate-300 p-2 rounded bg-slate-50" value={newIssue.title} onChange={e => setNewIssue({...newIssue, title: e.target.value})} />
           </div>
           <div className="col-span-1 md:col-span-2">
             <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Description</label>
             <textarea required className="w-full text-sm border border-slate-300 p-2 rounded h-20 bg-slate-50" value={newIssue.description} onChange={e => setNewIssue({...newIssue, description: e.target.value})} />
           </div>
           <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Category</label>
              <select className="w-full text-sm border border-slate-300 p-2 rounded bg-slate-50" value={newIssue.category} onChange={e => setNewIssue({...newIssue, category: e.target.value})}>
                <option value="pothole">Pothole</option>
                <option value="street_light">Street Light</option>
                <option value="water_logging">Water Logging</option>
                <option value="tree_fall">Tree Fall</option>
                <option value="waste">Waste</option>
                <option value="other">Other</option>
              </select>
           </div>
           <div className="flex gap-4">
             <div className="flex-1">
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Latitude</label>
                <input required type="number" step="0.0001" className="w-full text-sm border border-slate-300 p-2 rounded bg-slate-50" value={newIssue.latitude} onChange={e => setNewIssue({...newIssue, latitude: parseFloat(e.target.value)})} />
             </div>
             <div className="flex-1">
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Longitude</label>
                <input required type="number" step="0.0001" className="w-full text-sm border border-slate-300 p-2 rounded bg-slate-50" value={newIssue.longitude} onChange={e => setNewIssue({...newIssue, longitude: parseFloat(e.target.value)})} />
             </div>
           </div>
           <div className="col-span-1 md:col-span-2 mt-2">
             <button type="submit" className="bg-emerald-600 text-white font-bold text-sm px-4 py-2 rounded hover:bg-emerald-700 w-full">SUBMIT CIVIC ISSUE</button>
           </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <th className="py-3 px-4 font-bold uppercase text-[10px]">ID</th>
                <th className="py-3 px-4 font-bold uppercase text-[10px]">Category</th>
                <th className="py-3 px-4 font-bold uppercase text-[10px]">Location</th>
                <th className="py-3 px-4 font-bold uppercase text-[10px]">Status</th>
                <th className="py-3 px-4 font-bold uppercase text-[10px]">Reported</th>
                <th className="py-3 px-4 font-bold uppercase text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIssues.length > 0 ? filteredIssues.map(issue => (
                <tr key={issue.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">{issue.id}</td>
                  <td className="py-3 px-4">
                     <StatusBadge status={issue.category} />
                  </td>
                  <td className="py-3 px-4 text-xs font-mono">
                    <span className="text-slate-600">{issue.latitude != null ? issue.latitude.toFixed(4) : ''}, {issue.longitude != null ? issue.longitude.toFixed(4) : ''}</span>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={issue.status} />
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500">
                    {new Date(issue.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 flex justify-end gap-2 items-center">
                    <select 
                      value={issue.status}
                      onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                      className="text-xs bg-slate-100 border border-slate-200 rounded px-2 py-1 font-bold text-slate-700 outline-none hover:border-blue-400"
                    >
                      <option value="open">Open</option>
                      <option value="acknowledged">Acknowledge</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                    <button 
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this civic issue?')) {
                          if (token) useAppStore.getState().deleteCivicIssue(issue.id, token);
                        }
                      }}
                      className="text-slate-400 p-1.5 border border-transparent rounded hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition"
                      title="Delete Civic Issue"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 font-medium">No civic issues found matching the criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
