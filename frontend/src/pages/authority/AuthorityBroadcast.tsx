import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import axios from 'axios';

export default function AuthorityBroadcast() {
  const { token } = useAuthStore();
  const { broadcasts, deleteBroadcast } = useAppStore();
  const [message, setMessage] = useState('');
  const [level, setLevel] = useState('info');
  const [target, setTarget] = useState('all');
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !message) return;
    
    setIsSending(true);
    setSuccess(false);

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
      await axios.post(`${apiUrl}/broadcast`, {
        message,
        level,
        target
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess(true);
      setMessage('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to send broadcast', err);
      alert('Failed to send broadcast');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="col-span-1 md:col-span-3">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path><path d="M14.05 2a9 9 0 0 1 8 7.94"></path><path d="M14.05 6A5 5 0 0 1 18 10"></path></svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Emergency Broadcast</h2>
            <p className="text-sm text-slate-500">Send urgent push notifications to users in affected areas.</p>
          </div>
        </div>

        <form onSubmit={handleBroadcast} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Severity Level</label>
               <select 
                 value={level} 
                 onChange={e => setLevel(e.target.value)}
                 className="w-full px-3 py-2 border border-slate-300 rounded focus:border-rose-500 focus:outline-none bg-white text-sm"
               >
                 <option value="info">Information Update</option>
                 <option value="warning">Warning / Advisory</option>
                 <option value="critical">CRITICAL ALERT (Evacuation / Life Threat)</option>
               </select>
             </div>
             
             <div>
               <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Target Audience</label>
               <select 
                 value={target} 
                 onChange={e => setTarget(e.target.value)}
                 className="w-full px-3 py-2 border border-slate-300 rounded focus:border-rose-500 focus:outline-none bg-white text-sm"
               >
                 <option value="all">All Registered Users</option>
                 <option value="citizens">Citizens Only</option>
                 <option value="volunteers">Active Volunteers Only</option>
               </select>
             </div>
          </div>
          
          <div>
             <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Broadcast Message</label>
             <textarea 
               value={message} 
               onChange={e => setMessage(e.target.value)}
               className={`w-full px-3 py-2 border rounded focus:outline-none min-h-[120px] text-sm ${level === 'critical' ? 'border-rose-300 focus:border-rose-600 bg-rose-50' : 'border-slate-300 focus:border-blue-500'}`}
               placeholder="Type the emergency message here. Keep it clear, concise, and actionable."
               required
               maxLength={280}
             ></textarea>
             <div className="text-right text-xs text-slate-400 mt-1">{message.length}/280</div>
          </div>
          
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
             <div>
               {success && <span className="text-sm font-bold text-emerald-600 animate-in fade-in">✔ Broadcast sent successfully!</span>}
             </div>
             <button 
               type="submit" 
               disabled={isSending || !message}
               className={`px-6 py-3 rounded shadow-sm text-sm font-bold text-white transition-colors flex items-center gap-2 ${
                 level === 'critical' 
                   ? 'bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300' 
                   : 'bg-slate-900 hover:bg-slate-800 disabled:bg-slate-500'
               }`}
             >
               {isSending ? 'TRANSMITTING...' : 'SEND BROADCAST'}
             </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm max-w-4xl mx-auto mt-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Broadcast History</h3>
        <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scroll">
          {broadcasts.map((bc, idx) => (
             <div key={idx} className={`p-4 border rounded-lg flex items-start justify-between gap-4 ${bc.severity === 'critical' ? 'border-rose-300 bg-rose-50' : bc.severity === 'warning' ? 'border-amber-300 bg-amber-50' : 'border-blue-200 bg-blue-50'}`}>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded tracking-wide ${bc.severity === 'critical' ? 'bg-rose-600 text-white' : bc.severity === 'warning' ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'}`}>
                      {bc.severity}
                    </span>
                    <span className="text-xs font-mono text-slate-500">{new Date(bc.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-800">{bc.message}</p>
                </div>
                <button 
                  onClick={() => {
                    if (window.confirm('Delete this broadcast?')) {
                      deleteBroadcast(bc.id, token || '');
                    }
                  }}
                  className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-white bg-transparent transition-colors"
                  title="Delete Broadcast"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                </button>
             </div>
          ))}
          {broadcasts.length === 0 && (
             <div className="text-center py-6 text-slate-400 text-sm italic border rounded-lg border-dashed">No previous broadcasts.</div>
          )}
        </div>
      </div>
    </div>
  );
}
