import React, { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';
import StatusBadge from '../../components/StatusBadge';
import { useAppStore } from '../../store/appStore';
import Papa from 'papaparse';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  score?: number;
}

export default function AuthorityUsers() {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const { users, fetchInitialData } = useAppStore();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'volunteer' });
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (token && users.length === 0) {
      fetchInitialData(token).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token, users.length, fetchInitialData]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
      await axios.post(`${apiUrl}/auth/register`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('User registered successfully');
      setShowAddForm(false);
      setFormData({ name: '', email: '', password: '', role: 'volunteer' });
      fetchInitialData(token);
    } catch (err: any) {
      alert('Failed to register user: ' + (err.response?.data?.detail || err.message));
    }
  };

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,name,email,password,role\nJohn Doe,john@example.com,SecurePass123,volunteer\nNDRF Response Team A,ndrf.a@example.gov,Ndrf2024!,volunteer";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "bulk_users_template.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setIsUploading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const parsedUsers = results.data;
        if (parsedUsers.length === 0) {
          alert('No users found in the CSV file.');
          setIsUploading(false);
          return;
        }

        try {
          const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
          const res = await axios.post(`${apiUrl}/auth/bulk-register`, { users: parsedUsers }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const resultData = res.data;
          let msg = `Successfully registered ${resultData.successful} users.\nFailed: ${resultData.failed}`;
          if (resultData.errors.length > 0) {
            msg += `\n\nErrors:\n${resultData.errors.slice(0,5).join('\n')}${resultData.errors.length > 5 ? '\n...' : ''}`;
          }
          alert(msg);
          
          fetchInitialData(token);
        } catch (err: any) {
          alert('Bulk registration failed: ' + (err.response?.data?.detail || err.message));
        } finally {
          setIsUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      },
      error: (error) => {
        alert(`Error parsing CSV: ${error.message}`);
        setIsUploading(false);
      }
    });
  };

  if (loading) {
    return <div className="col-span-1 md:col-span-3 text-center py-10 text-slate-500">Loading user registry...</div>;
  }

  return (
    <div className="col-span-1 md:col-span-3">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-[600px] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">User & Responder Registry</h3>
          <div className="flex gap-3">
            <input 
              type="file" 
              accept=".csv" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileUpload} 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="text-xs font-bold bg-slate-800 text-white px-3 py-1.5 rounded hover:bg-slate-700 transition disabled:opacity-50"
            >
              {isUploading ? 'IMPORTING...' : 'BULK IMPORT (CSV)'}
            </button>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-xs font-bold bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition"
            >
              {showAddForm ? 'CANCEL' : '+ ADD USER'}
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2 px-2">
               <span className="text-xs font-bold text-slate-500">Manually Add Single User</span>
               <button onClick={downloadTemplate} className="text-xs text-blue-600 hover:underline">Download CSV Template</button>
            </div>
            <form onSubmit={handleAddUser} className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Name</label>
              <input required type="text" className="w-full text-sm border p-2 rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Email</label>
              <input required type="email" className="w-full text-sm border p-2 rounded" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Password</label>
              <input required type="password" className="w-full text-sm border p-2 rounded" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Role</label>
              <select className="w-full text-sm border p-2 rounded" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="citizen">Citizen</option>
                <option value="volunteer">Volunteer</option>
                <option value="authority">Authority</option>
              </select>
            </div>
            <div>
              <button type="submit" className="w-full bg-emerald-600 text-white font-bold text-sm py-2 rounded hover:bg-emerald-700">REGISTER</button>
            </div>
          </form>
          </div>
        )}
        
        <div className="flex-1 overflow-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 sticky top-0 z-10 font-medium">
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="px-4 py-3 font-semibold uppercase text-xs">Name</th>
                <th className="px-4 py-3 font-semibold uppercase text-xs">Email</th>
                <th className="px-4 py-3 font-semibold uppercase text-xs">Role</th>
                <th className="px-4 py-3 font-semibold uppercase text-xs">Trust Score</th>
                <th className="px-4 py-3 font-semibold uppercase text-xs">Account Status</th>
                <th className="px-4 py-3 font-semibold uppercase text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-700">{u.name}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{u.email}</td>
                  <td className="px-4 py-3 capitalize text-xs">
                     <span className={`px-2 py-1 rounded font-bold ${
                        u.role === 'authority' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'volunteer' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-600'
                     }`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs font-bold">
                    {u.score != null ? u.score.toFixed(3) : 'N/A'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-emerald-600 font-bold text-xs uppercase flex items-center gap-1">
                       <span className="w-2 h-2 rounded-full bg-emerald-500 block"></span> Active
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete user ${u.name}?`)) {
                          if (token) useAppStore.getState().deleteUser(u.id, token);
                        }
                      }}
                      className="text-slate-400 p-1 rounded hover:bg-rose-50 hover:text-rose-600 transition"
                      title="Delete User"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                   <td colSpan={6} className="text-center py-6 text-slate-400 text-sm">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
