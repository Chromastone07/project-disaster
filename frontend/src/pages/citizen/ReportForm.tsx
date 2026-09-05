import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import MapPicker from '../../components/MapPicker';

export default function ReportForm() {
  const { user, token } = useAuthStore();
  const { addReport } = useAppStore();
  const navigate = useNavigate();

  const [category, setCategory] = useState('fire');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [description, setDescription] = useState('');
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!position) {
      alert("Please select a location on the map.");
      return;
    }

    addReport({
      reporter_id: user?.id || 'unknown',
      category,
      severity,
      description,
      latitude: position.lat,
      longitude: position.lng,
    }, token!);

    // In a real app we might redirect to a success page or the report detail page
    navigate('/citizen/home');
  };

  return (
    <div className="col-span-1 md:col-span-3">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Submit Emergency Report</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Emergency Category</label>
              <select 
                value={category} 
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded focus:border-rose-500 focus:outline-none bg-white text-sm"
                required
              >
                <option value="fire">Fire</option>
                <option value="flood">Flood</option>
                <option value="earthquake">Earthquake</option>
                <option value="structural_collapse">Structural Collapse</option>
                <option value="medical_emergency">Medical Emergency</option>
                <option value="civil_emergency">Civil Emergency</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Severity Level</label>
              <div className="flex gap-2">
                {(['low', 'medium', 'high', 'critical'] as const).map(sev => (
                  <label key={sev} className={`flex-1 flex items-center justify-center py-2 px-1 border rounded cursor-pointer transition-colors text-xs font-bold uppercase ${severity === sev ? 'bg-rose-50 border-rose-500 text-rose-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                    <input type="radio" name="severity" value={sev} checked={severity === sev} onChange={() => setSeverity(sev)} className="hidden" />
                    {sev}
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Location</label>
            <MapPicker value={position} onChange={setPosition} />
          </div>
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Description</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:border-rose-500 focus:outline-none min-h-[100px] text-sm"
              placeholder="Provide details about the emergency, landmarks, number of people affected..."
              required
            ></textarea>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => navigate('/citizen/home')} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">
              CANCEL
            </button>
            <button type="submit" className="px-6 py-2 bg-rose-600 text-white text-sm font-bold rounded shadow-sm hover:bg-rose-700 transition-colors">
              SUBMIT REPORT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
