import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import StatusBadge from '../../components/StatusBadge';

export default function VolunteerResources() {
  const { locations, inventory, addInventoryItem, updateInventoryQuantity } = useAppStore();
  const { token } = useAuthStore();
  
  const [selectedLoc, setSelectedLoc] = useState(locations[0]?.id || '');
  const [isAdding, setIsAdding] = useState(false);
  
  const [newItem, setNewItem] = useState({
    item_name: '',
    quantity: 1,
    unit: 'units'
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedLoc) return;
    
    addInventoryItem({
      location_id: selectedLoc,
      item_name: newItem.item_name,
      quantity: newItem.quantity,
      unit: newItem.unit
    }, token);
    
    setIsAdding(false);
    setNewItem({ item_name: '', quantity: 1, unit: 'units' });
  };

  const handleLogUse = (id: string, currentQty: number) => {
    if (!token) return;
    if (currentQty <= 0) return;
    updateInventoryQuantity(id, currentQty - 1, token);
  };

  return (
    <div className="col-span-1 md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
      
      <div className="col-span-1 space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm h-[600px] flex flex-col">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Resource Centers</h3>
          
          <div className="flex-1 overflow-y-auto space-y-3 custom-scroll pr-2">
            {locations.map(loc => (
              <div 
                key={loc.id} 
                onClick={() => setSelectedLoc(loc.id)}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedLoc === loc.id ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}
              >
                 <div className="flex items-center justify-between mb-2">
                   <h4 className="font-bold text-sm text-slate-800">{loc.name}</h4>
                   <StatusBadge status={loc.operational_status} type="location" />
                 </div>
                 <div className="flex gap-2">
                   <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded font-bold text-slate-600 capitalize">{loc.category.replace('_', ' ')}</span>
                   <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded font-bold text-slate-600 font-mono">CAP: {loc.capacity}</span>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="col-span-1 md:col-span-2 space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-[600px] flex flex-col relative">
          
          {isAdding ? (
            <div className="absolute inset-0 z-20 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center p-6 pb-20">
              <div className="bg-white border md:min-w-[400px] border-slate-200 shadow-xl rounded-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Add Supply / Donation</h3>
                <form onSubmit={handleAddSubmit} className="space-y-4">
                   <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1">Item Name</label>
                     <input required autoFocus type="text" value={newItem.item_name} onChange={e => setNewItem({...newItem, item_name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded focus:border-emerald-500 focus:outline-none text-sm" placeholder="e.g. Blankets, First Aid Kits" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1">Quantity</label>
                       <input required type="number" min="1" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-300 rounded focus:border-emerald-500 focus:outline-none text-sm" />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1">Unit</label>
                       <select value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded focus:border-emerald-500 focus:outline-none bg-white text-sm">
                         <option value="units">Units</option>
                         <option value="boxes">Boxes</option>
                         <option value="pallets">Pallets</option>
                         <option value="kg">Kg</option>
                         <option value="liters">Liters</option>
                       </select>
                     </div>
                   </div>
                   <div className="flex gap-3 pt-4 border-t border-slate-100">
                      <button type="button" onClick={() => setIsAdding(false)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 font-bold text-sm rounded hover:bg-slate-200 transition">Cancel</button>
                      <button type="submit" className="flex-1 px-4 py-2 bg-emerald-600 text-white font-bold text-sm rounded shadow hover:bg-emerald-700 transition">Save Item</button>
                   </div>
                </form>
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
             <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Live Inventory at Location</h3>
             <button 
               onClick={() => setIsAdding(true)} 
               className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-2"
             >
               <span>+</span> ADD ITEM / DONATION
             </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {inventory.filter(i => i.location_id === selectedLoc).length > 0 ? (
               <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 sticky top-0 z-10 font-medium">
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="px-4 py-3 font-semibold uppercase text-xs">Item Name</th>
                      <th className="px-4 py-3 font-semibold uppercase text-xs">Category</th>
                      <th className="px-4 py-3 font-semibold uppercase text-xs">Quantity</th>
                      <th className="px-4 py-3 font-semibold uppercase text-xs text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.filter(i => i.location_id === selectedLoc).map(item => (
                       <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                         <td className="px-4 py-3 font-bold text-slate-700">{item.item_name}</td>
                         <td className="px-4 py-3 capitalize text-xs text-slate-600">Supplies</td>
                         <td className="px-4 py-3 text-slate-600 font-mono text-xs">
                           <span className={`font-bold ${item.quantity < 50 ? 'text-rose-600' : 'text-emerald-600'}`}>{item.quantity}</span> {item.unit}
                         </td>
                         <td className="px-4 py-3 text-right">
                            <button 
                              onClick={() => handleLogUse(item.id, item.quantity)}
                              className="text-[10px] bg-slate-200 hover:bg-slate-300 px-2 py-1 rounded font-bold text-slate-600 mr-2"
                              disabled={item.quantity <= 0}
                            >
                              LOG USE
                            </button>
                         </td>
                       </tr>
                    ))}
                  </tbody>
               </table>
            ) : (
               <div className="text-center py-10 text-slate-400 text-sm">No inventory recorded for this location.</div>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
}
