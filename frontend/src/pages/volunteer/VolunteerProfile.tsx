import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import MapPicker from '../../components/MapPicker';

export default function VolunteerProfile() {
  const { user } = useAuthStore();
  const [skills, setSkills] = useState({
    first_aid: true,
    driving: false,
    bilingual: false,
    medical: false,
    sar: false,
    heavy_machinery: false,
    drone_pilot: false,
    ham_radio: false,
    counseling: false
  });
  const [equipment, setEquipment] = useState({
    vehicle_4x4: false,
    boat: false,
    drone: false,
    chainsaw: false,
    generator: false,
    medical_kit: true
  });
  const [radius, setRadius] = useState(15);
  const [status, setStatus] = useState('available');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>({ lat: 19.076, lng: 72.877 });
  
  const [contact, setContact] = useState({
    phone: '',
    blood_group: 'O+',
    emergency_contact: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const toggleSkill = (skill: keyof typeof skills) => {
    setSkills(s => ({ ...s, [skill]: !s[skill] }));
  };

  const toggleEq = (eq: keyof typeof equipment) => {
    setEquipment(s => ({ ...s, [eq]: !s[eq] }));
  };

  return (
    <div className="col-span-1 md:col-span-3 pb-8">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm max-w-5xl mx-auto overflow-hidden">
        
        {/* Header Setup */}
        <div className="bg-slate-900 border-b border-slate-800 p-6 md:p-8 text-white relative">
          <div className="absolute top-0 right-0 p-6">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow
              ${status === 'available' ? 'bg-emerald-500/20 outline outline-1 outline-emerald-500 text-emerald-400' : 
                status === 'busy' ? 'bg-amber-500/20 outline outline-1 outline-amber-500 text-amber-400' : 
                'bg-slate-500/20 outline outline-1 outline-slate-500 text-slate-400'}`}
            >
              <span className={`w-2 h-2 rounded-full ${status === 'available' ? 'bg-emerald-500 animate-pulse' : status === 'busy' ? 'bg-amber-500' : 'bg-slate-500'}`}></span>
              {status === 'available' ? 'Active & Ready' : status === 'busy' ? 'On Mission / Busy' : 'Offline'}
            </span>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-slate-800 rounded-full border-2 border-slate-700 flex items-center justify-center text-3xl font-bold">
              {user?.name?.charAt(0) || 'V'}
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">{user?.name || 'Volunteer'}</h2>
              <p className="text-slate-400 text-sm font-mono">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
            
            {/* Left Column */}
            <div className="space-y-8">
              
              {/* Status & Availability Control */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500 mb-4 border-b border-slate-100 pb-2">Duty Status</h3>
                <select 
                  value={status} 
                  onChange={e => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:border-rose-500 focus:outline-none bg-white text-sm"
                >
                  <option value="available">Available for Deployment</option>
                  <option value="busy">Do Not Disturb / On Mission</option>
                  <option value="offline">Offline / Unavailable</option>
                </select>
                
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Service Radius</label>
                    <span className="font-mono text-sm font-bold bg-slate-100 px-2 py-1 rounded text-slate-700">{radius} km</span>
                  </div>
                  <input type="range" min="1" max="100" value={radius} onChange={e => setRadius(Number(e.target.value))} className="w-full accent-rose-600" />
                  <p className="text-xs text-slate-400 mt-2">Maximum distance willing to travel for task assignments.</p>
                </div>
              </div>
              
              {/* Personnel Details */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500 mb-4 border-b border-slate-100 pb-2">Contact & Medical</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Phone Number</label>
                    <input type="tel" value={contact.phone} onChange={e => setContact({...contact, phone: e.target.value})} placeholder="+1 (555) 000-0000" className="w-full px-3 py-2 border border-slate-300 rounded focus:border-rose-500 focus:outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Blood Group</label>
                    <select value={contact.blood_group} onChange={e => setContact({...contact, blood_group: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded focus:border-rose-500 focus:outline-none bg-white text-sm">
                      <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                      <option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Emergency Contact Info (Name + Phone)</label>
                    <input type="text" value={contact.emergency_contact} onChange={e => setContact({...contact, emergency_contact: e.target.value})} placeholder="Jane Doe - +1 (555) 999-9999" className="w-full px-3 py-2 border border-slate-300 rounded focus:border-rose-500 focus:outline-none text-sm" />
                  </div>
                </div>
              </div>
              
              {/* Location Picker */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500 mb-4 border-b border-slate-100 pb-2">Base Location</h3>
                <p className="text-xs text-slate-400 mb-3">Set your primary starting location for accurate dispatching.</p>
                <div className="h-[250px] rounded-lg overflow-hidden border border-slate-200">
                  <MapPicker value={location} onChange={setLocation} />
                </div>
              </div>

            </div>

            {/* Right Column */}
            <div className="space-y-8">
              
              {/* Enhanced Skills */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500 mb-4 border-b border-slate-100 pb-2">Skills & Certifications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                    <input type="checkbox" checked={skills.first_aid} onChange={() => toggleSkill('first_aid')} className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 accent-rose-600" />
                    <span className="text-sm font-medium text-slate-700">First Aid / CPR</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                    <input type="checkbox" checked={skills.medical} onChange={() => toggleSkill('medical')} className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 accent-rose-600" />
                    <span className="text-sm font-medium text-slate-700">Medical Professional</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                    <input type="checkbox" checked={skills.sar} onChange={() => toggleSkill('sar')} className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 accent-rose-600" />
                    <span className="text-sm font-medium text-slate-700">Search & Rescue</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                    <input type="checkbox" checked={skills.driving} onChange={() => toggleSkill('driving')} className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 accent-rose-600" />
                    <span className="text-sm font-medium text-slate-700">Commercial License</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                    <input type="checkbox" checked={skills.heavy_machinery} onChange={() => toggleSkill('heavy_machinery')} className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 accent-rose-600" />
                    <span className="text-sm font-medium text-slate-700">Heavy Machinery</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                    <input type="checkbox" checked={skills.bilingual} onChange={() => toggleSkill('bilingual')} className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 accent-rose-600" />
                    <span className="text-sm font-medium text-slate-700">Bilingual / Translator</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                    <input type="checkbox" checked={skills.drone_pilot} onChange={() => toggleSkill('drone_pilot')} className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 accent-rose-600" />
                    <span className="text-sm font-medium text-slate-700">Licensed Drone Pilot</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                    <input type="checkbox" checked={skills.ham_radio} onChange={() => toggleSkill('ham_radio')} className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 accent-rose-600" />
                    <span className="text-sm font-medium text-slate-700">HAM Radio Operator</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                    <input type="checkbox" checked={skills.counseling} onChange={() => toggleSkill('counseling')} className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 accent-rose-600" />
                    <span className="text-sm font-medium text-slate-700">Crisis Counseling</span>
                  </label>
                </div>
              </div>

              {/* Assets & Equipment */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500 mb-4 border-b border-slate-100 pb-2">Available Equipment</h3>
                <p className="text-xs text-slate-400 mb-3">Mark any critical assets you can bring during an deployment.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                    <input type="checkbox" checked={equipment.vehicle_4x4} onChange={() => toggleEq('vehicle_4x4')} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 accent-blue-600" />
                    <span className="text-sm font-medium text-slate-700">4x4 / Off-Road Vehicle</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                    <input type="checkbox" checked={equipment.boat} onChange={() => toggleEq('boat')} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 accent-blue-600" />
                    <span className="text-sm font-medium text-slate-700">Boat / Raft</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                    <input type="checkbox" checked={equipment.drone} onChange={() => toggleEq('drone')} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 accent-blue-600" />
                    <span className="text-sm font-medium text-slate-700">Survey Drone</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                    <input type="checkbox" checked={equipment.chainsaw} onChange={() => toggleEq('chainsaw')} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 accent-blue-600" />
                    <span className="text-sm font-medium text-slate-700">Chainsaw (Debris clearing)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                    <input type="checkbox" checked={equipment.generator} onChange={() => toggleEq('generator')} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 accent-blue-600" />
                    <span className="text-sm font-medium text-slate-700">Portable Generator</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                    <input type="checkbox" checked={equipment.medical_kit} onChange={() => toggleEq('medical_kit')} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 accent-blue-600" />
                    <span className="text-sm font-medium text-slate-700">Advanced Med Kit</span>
                  </label>
                </div>
              </div>

            </div>
            
          </div>

          <div className="pt-8 mt-8 border-t border-slate-200 flex justify-end gap-4 items-center">
             {isSaving && <div className="text-sm text-slate-500 flex items-center gap-2"><div className="w-3 h-3 border-2 border-slate-300 border-t-rose-600 rounded-full animate-spin"></div> Saving...</div>}
             {saveSuccess && <div className="text-sm font-bold text-emerald-600 mr-2">Profile Updated Successfully!</div>}
             <button className="px-6 py-2.5 rounded font-bold text-sm text-slate-500 hover:text-slate-800 transition-colors">
               RESET
             </button>
             <button 
               className="bg-rose-600 text-white px-8 py-2.5 rounded shadow hover:bg-rose-700 hover:shadow-md transition-all font-bold text-sm disabled:opacity-50" 
               onClick={() => {
                 setIsSaving(true);
                 setSaveSuccess(false);
                 setTimeout(() => {
                   setIsSaving(false);
                   setSaveSuccess(true);
                   setTimeout(() => setSaveSuccess(false), 3000);
                 }, 800);
               }}
               disabled={isSaving}
             >
               SAVE VOLUNTEER PROFILE
             </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
