import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import StatusBadge from '../../components/StatusBadge';

export default function AuthorityReports() {
  const { token, user } = useAuthStore();
  const { reports, updateReport, addReport } = useAppStore();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReport, setNewReport] = useState({
    title: '',
    description: '',
    category: 'other',
    severity: 'medium',
    latitude: 19.0760,
    longitude: 72.8777,
    reporter_id: user?.id || ''
  });

  const handleStatusChange = (id: string, e: React.ChangeEvent<HTMLSelectElement>) => {
    if (token) {
      updateReport(id, { status: e.target.value as any }, token);
    }
  };

  const handleAddReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      await addReport(newReport as any, token);
      alert('Report registered successfully.');
      setShowAddForm(false);
      setNewReport({ ...newReport, title: '', description: '' });
    } catch (err) {
      alert("Failed to submit report");
    }
  };

  return (
    <div className="col-span-1 md:col-span-3">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm min-h-[600px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">All Incident Reports</h3>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-xs font-bold bg-rose-600 text-white px-3 py-1.5 rounded hover:bg-rose-700 transition"
            >
              {showAddForm ? 'CANCEL' : '+ ADD REPORT'}
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddReport} className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
               <div className="col-span-1 md:col-span-2">
                 <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Title</label>
                 <input required type="text" className="w-full text-sm border border-slate-300 p-2 rounded" value={newReport.title} onChange={e => setNewReport({...newReport, title: e.target.value})} />
               </div>
               <div className="col-span-1 md:col-span-2">
                 <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Description</label>
                 <textarea required className="w-full text-sm border border-slate-300 p-2 rounded h-20" value={newReport.description} onChange={e => setNewReport({...newReport, description: e.target.value})} />
               </div>
               <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Category</label>
                  <select className="w-full text-sm border border-slate-300 p-2 rounded" value={newReport.category} onChange={e => setNewReport({...newReport, category: e.target.value})}>
                    <option value="fire">Fire</option>
                    <option value="flood">Flood</option>
                    <option value="medical">Medical</option>
                    <option value="collapse">Collapse</option>
                    <option value="other">Other</option>
                  </select>
               </div>
               <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Severity</label>
                  <select className="w-full text-sm border border-slate-300 p-2 rounded" value={newReport.severity} onChange={e => setNewReport({...newReport, severity: e.target.value})}>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
               </div>
               <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Latitude</label>
                  <input required type="number" step="0.0001" className="w-full text-sm border border-slate-300 p-2 rounded" value={newReport.latitude} onChange={e => setNewReport({...newReport, latitude: parseFloat(e.target.value)})} />
               </div>
               <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Longitude</label>
                  <input required type="number" step="0.0001" className="w-full text-sm border border-slate-300 p-2 rounded" value={newReport.longitude} onChange={e => setNewReport({...newReport, longitude: parseFloat(e.target.value)})} />
               </div>
               <div className="col-span-1 md:col-span-2 mt-2">
                 <button type="submit" className="bg-emerald-600 text-white font-bold text-sm px-4 py-2 rounded hover:bg-emerald-700 w-full">SUBMIT REPORT</button>
               </div>
            </form>
          )}
          
          <div className="flex-1 overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-sm whitespace-nowrap bg-white">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-3 font-semibold uppercase text-xs">ID</th>
                  <th className="pb-3 font-semibold uppercase text-xs">Category</th>
                  <th className="pb-3 font-semibold uppercase text-xs">Severity</th>
                  <th className="pb-3 font-semibold uppercase text-xs">Status</th>
                  <th className="pb-3 font-semibold uppercase text-xs">Reported</th>
                  <th className="pb-3 px-4 font-semibold uppercase text-xs">Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-600">{report.id}</td>
                    <td className="py-3 px-4"><StatusBadge status={report.category} /></td>
                    <td className="py-3 px-4"><StatusBadge status={report.severity} type="severity" /></td>
                    <td className="py-3 px-4"><StatusBadge status={report.status} /></td>
                    <td className="py-3 px-4 text-slate-500">{new Date(report.created_at).toLocaleString()}</td>
                    <td className="py-3 px-4 flex items-center gap-2">
                      <select 
                        value={report.status} 
                        onChange={(e) => handleStatusChange(report.id, e)}
                        className="text-xs border border-slate-200 rounded px-2 py-1 bg-white focus:outline-none focus:border-rose-500"
                      >
                        <option value="unreviewed">Unreviewed</option>
                        <option value="active">Active</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="duplicate">Duplicate</option>
                      </select>
                      <button 
                        onClick={() => {
                          if (window.confirm('Delete this report completely?')) {
                            if (token) useAppStore.getState().deleteReport(report.id, token);
                          }
                        }}
                        className="p-1 px-1.5 rounded border border-transparent text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition"
                        title="Delete Report"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </div>
    </div>
  );
}
