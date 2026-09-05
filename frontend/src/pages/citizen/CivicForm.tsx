import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import MapPicker from '../../components/MapPicker';

export default function CivicForm() {
  const { user, token } = useAuthStore();
  const { addCivicIssue } = useAppStore();
  const navigate = useNavigate();

  const [category, setCategory] = useState('road_damage');
  const [description, setDescription] = useState('');
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!position) {
      alert("Please select a location on the map.");
      return;
    }
    
    if (token) {
      await addCivicIssue({
        category: category as any,
        description,
        latitude: position.lat,
        longitude: position.lng,
      }, token);
    }
    
    alert("Civic issue submitted successfully.");
    navigate('/citizen/home');
  };

  return (
    <div className="col-span-1 md:col-span-3">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Report Civic Issue</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Issue Category</label>
            <select 
              value={category} 
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:border-rose-500 focus:outline-none bg-white text-sm"
              required
            >
              <option value="road_damage">Road Damage</option>
              <option value="power_outage">Power Outage</option>
              <option value="water_contamination">Water Contamination</option>
              <option value="drainage">Drainage/Flooding</option>
              <option value="fallen_tree">Fallen Tree</option>
              <option value="other">Other</option>
            </select>
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
              placeholder="Provide details about the issue..."
              required
            ></textarea>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => navigate('/citizen/home')} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">
              CANCEL
            </button>
            <button type="submit" className="px-6 py-2 bg-slate-900 text-white text-sm font-bold rounded shadow-sm hover:bg-slate-800 transition-colors">
              SUBMIT REPORT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
