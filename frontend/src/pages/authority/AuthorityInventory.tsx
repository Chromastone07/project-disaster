import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import StatusBadge from '../../components/StatusBadge';

export default function AuthorityInventory() {
  const { locations, inventory, contributions, addInventoryItem, addLocation } = useAppStore();
  const { token } = useAuthStore();
  
  const [newItem, setNewItem] = useState({ item_name: '', location_id: '', quantity: 100, unit: 'units' });
  const [newLoc, setNewLoc] = useState({ name: '', category: 'shelter', latitude: 19.076, longitude: 72.877, capacity: 100, operational_status: 'open' });
  const [showLocForm, setShowLocForm] = useState(false);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    await addInventoryItem(newItem, token);
    setNewItem({ item_name: '', location_id: '', quantity: 100, unit: 'units' });
    alert("Resource added successfully.");
  };

  const handleAddLoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    await addLocation(newLoc as any, token);
    setNewLoc({ name: '', category: 'shelter', latitude: 19.076, longitude: 72.877, capacity: 100, operational_status: 'open' });
    setShowLocForm(false);
    alert("Location registered successfully.");
  };

  return (
    <div className="col-span-1 md:col-span-3 space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Community Resource Contributions</h3>
          {contributions && contributions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-3 px-4 font-medium uppercase text-[10px]">ID</th>
                    <th className="py-3 px-4 font-medium uppercase text-[10px]">Item</th>
                    <th className="py-3 px-4 font-medium uppercase text-[10px]">Quantity</th>
                    <th className="py-3 px-4 font-medium uppercase text-[10px]">Status</th>
                    <th className="py-3 px-4 font-medium uppercase text-[10px]">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {contributions.map((c) => (
                    <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono text-xs">{c.id}</td>
                      <td className="py-3 px-4 font-medium text-slate-800">{c.item_name}</td>
                      <td className="py-3 px-4"><span className="font-bold">{c.quantity}</span> <span className="text-slate-500">{c.unit}</span></td>
                      <td className="py-3 px-4"><StatusBadge status={c.status} /></td>
                      <td className="py-3 px-4 text-xs text-slate-500">{new Date(c.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6 text-sm text-slate-400">No contributions offered yet.</div>
          )}
      </div>
      
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Location Registry</h3>
            <button 
              onClick={() => setShowLocForm(!showLocForm)}
              className="text-[10px] font-bold bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition"
            >
              {showLocForm ? 'CANCEL' : '+ ADD LOCATION'}
            </button>
          </div>

          {showLocForm && (
            <form onSubmit={handleAddLoc} className="mb-4 bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Name</label>
                <input required type="text" className="w-full text-sm border p-2 rounded" value={newLoc.name} onChange={e => setNewLoc({...newLoc, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Category</label>
                <select className="w-full text-sm border p-2 rounded" value={newLoc.category} onChange={e => setNewLoc({...newLoc, category: e.target.value})}>
                  <option value="shelter">Shelter</option>
                  <option value="medical">Medical</option>
                  <option value="distribution">Distribution Point</option>
                </select>
              </div>
              <div className="flex gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Lat</label>
                  <input required type="number" step="0.0001" className="w-full text-sm border p-2 rounded" value={newLoc.latitude} onChange={e => setNewLoc({...newLoc, latitude: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Lng</label>
                  <input required type="number" step="0.0001" className="w-full text-sm border p-2 rounded" value={newLoc.longitude} onChange={e => setNewLoc({...newLoc, longitude: parseFloat(e.target.value)})} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Capacity</label>
                <input required type="number" className="w-full text-sm border p-2 rounded" value={newLoc.capacity} onChange={e => setNewLoc({...newLoc, capacity: parseInt(e.target.value)})} />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Status</label>
                <select className="w-full text-sm border p-2 rounded" value={newLoc.operational_status} onChange={e => setNewLoc({...newLoc, operational_status: e.target.value})}>
                  <option value="open">Open</option>
                  <option value="full">Full</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div className="col-span-1 md:col-span-2">
                <button type="submit" className="w-full bg-emerald-600 text-white font-bold text-sm py-2 rounded hover:bg-emerald-700">REGISTER LOCATION</button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {locations.map(loc => (
               <div key={loc.id} className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                 <div className="flex justify-between items-start mb-2">
                   <span className="font-bold text-sm text-slate-800">{loc.name}</span>
                   <StatusBadge status={loc.operational_status} type="location" />
                 </div>
                 <div className="text-xs text-slate-500 mb-2 capitalize">{loc.category}</div>
                 <div className="text-xs text-slate-600 font-mono">Capacity: {loc.capacity}</div>
               </div>
             ))}
          </div>
      </div>
      
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Register New Resource in Registry</h3>
          <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-5 gap-4">
             <input required type="text" placeholder="Item Name (e.g. Blankets)" className="col-span-1 md:col-span-2 p-2 text-sm border border-slate-300 rounded" value={newItem.item_name} onChange={e => setNewItem({...newItem, item_name: e.target.value})} />
             <select required className="col-span-1 p-2 text-sm border border-slate-300 rounded" value={newItem.location_id} onChange={e => setNewItem({...newItem, location_id: e.target.value})}>
               <option value="">Select Location</option>
               {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
             </select>
             <div className="col-span-1 flex gap-2">
               <input required type="number" min="1" className="w-full p-2 text-sm border border-slate-300 rounded" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})} />
               <input required type="text" placeholder="Unit" className="w-full p-2 text-sm border border-slate-300 rounded" value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value})} />
             </div>
             <button type="submit" className="col-span-1 bg-slate-800 text-white font-bold p-2 text-sm rounded shadow hover:bg-slate-700">Add Item</button>
          </form>
      </div>
      
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Resource Inventory Overview</h3>
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3 font-semibold uppercase text-xs">Item Name</th>
                <th className="pb-3 font-semibold uppercase text-xs">Location ID</th>
                <th className="pb-3 font-semibold uppercase text-xs">Quantity</th>
                <th className="pb-3 font-semibold uppercase text-xs">Status</th>
                <th className="pb-3 font-semibold uppercase text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((inv) => (
                <tr key={inv.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 font-medium text-slate-800">{inv.item_name}</td>
                  <td className="py-3 font-mono text-xs">{inv.location_id}</td>
                  <td className="py-3 font-bold">{inv.quantity} <span className="text-normal text-slate-500 font-normal">{inv.unit}</span></td>
                  <td className="py-3">
                    {inv.quantity < 150 ? <span className="text-rose-600 font-bold text-xs uppercase">Low Stock</span> : <span className="text-emerald-600 font-bold text-xs uppercase">Optimal</span>}
                  </td>
                  <td className="py-3 text-right">
                    <button 
                      onClick={() => {
                        if (window.confirm(`Delete inventory record for ${inv.item_name}?`)) {
                          if (token) useAppStore.getState().deleteInventoryItem(inv.id, token);
                        }
                      }}
                      className="text-slate-400 p-1 rounded hover:bg-rose-50 hover:text-rose-600 transition"
                      title="Delete Item"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>

    </div>
  );
}
