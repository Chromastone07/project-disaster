import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

export default function Login() {
  const [roleMode, setRoleMode] = useState<'users' | 'admin'>('users');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Registration state
  const [isRegistering, setIsRegistering] = useState(false);
  const [regName, setRegName] = useState('');
  const [regRole, setRegRole] = useState<'citizen' | 'volunteer' | 'authority'>('citizen');
  const [adminSecret, setAdminSecret] = useState('');
  
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
      
      if (isRegistering) {
        await axios.post(`${apiUrl}/auth/register`, {
          name: regName,
          email,
          password,
          role: roleMode === 'admin' ? 'authority' : regRole,
          adminSecret: roleMode === 'admin' ? adminSecret : undefined
        });
        // After register, immediately login
        const response = await axios.post(`${apiUrl}/auth/login`, { email, password });
        processLoginResponse(response);
      } else {
        const response = await axios.post(`${apiUrl}/auth/login`, { email, password });
        
        // Prevent users from using the wrong tab
        const role = response.data.role;
        if (roleMode === 'admin' && role !== 'authority') {
           throw new Error("Access Denied: This portal is for administrators only.");
        }
        if (roleMode === 'users' && role === 'authority') {
           throw new Error("Access Denied: Please use the Admin portal to login.");
        }

        processLoginResponse(response);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const processLoginResponse = (response: any) => {
    const token = response.data.access_token;
    const user = {
      id: response.data.user_id,
      name: response.data.name || 'User',
      email: response.data.email || email,
      role: response.data.role
    };

    login(token, user);

    if (user.role === 'citizen') {
      navigate('/citizen/home');
    } else if (user.role === 'volunteer') {
      navigate('/volunteer/home');
    } else if (user.role === 'authority') {
      navigate('/authority/home');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm flex flex-col w-full max-w-md">
      <div className="flex items-center gap-3 mb-6 justify-center">
        <div className="w-10 h-10 bg-rose-600 rounded flex items-center justify-center font-bold text-xl text-white">C</div>
        <span className="font-bold tracking-tight text-2xl text-slate-900">C-SERP</span>
      </div>
      
      <div className="flex bg-slate-100 rounded p-1 mb-6">
        <button 
          type="button"
          onClick={() => { setRoleMode('users'); setIsRegistering(false); setError(null); }}
          className={`flex-1 text-xs font-bold uppercase tracking-wider py-2 rounded transition-colors ${roleMode === 'users' ? 'bg-white shadow-sm text-slate-900 border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Public Portal
        </button>
        <button 
          type="button"
          onClick={() => { setRoleMode('admin'); setIsRegistering(false); setError(null); }}
          className={`flex-1 text-xs font-bold uppercase tracking-wider py-2 rounded transition-colors ${roleMode === 'admin' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Admin Portal
        </button>
      </div>

      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6 text-center">
         {roleMode === 'admin' ? 'Command Center Access' : (isRegistering ? 'Create Public Account' : 'Public Access')}
      </h3>
      
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 text-[13px] p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleAuth} className="flex flex-col gap-4">
        {isRegistering && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-rose-500 text-sm"
              required={isRegistering}
              placeholder="John Doe"
            />
          </div>
        )}
        
        {isRegistering && roleMode === 'users' && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
              Account Type
            </label>
            <select
              value={regRole}
              onChange={(e) => setRegRole(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-rose-500 text-sm bg-white"
            >
               <option value="citizen">Citizen (Reporter)</option>
               <option value="volunteer">Volunteer (Responder)</option>
            </select>
          </div>
        )}

        {isRegistering && roleMode === 'admin' && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1" htmlFor="adminSecret">
              Admin Creation Secret Key
            </label>
            <input
              id="adminSecret"
              type="password"
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-rose-500 text-sm"
              required={isRegistering && roleMode === 'admin'}
              placeholder="Consult IT for this key"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-rose-500 font-mono text-sm"
            required
            placeholder={roleMode === 'admin' ? 'admin@cserp.gov' : 'user@example.com'}
          />
        </div>
        
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-rose-500 font-mono text-sm"
            required
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
          className={`mt-4 w-full font-bold py-3 text-sm rounded transition-colors disabled:opacity-50 ${roleMode === 'admin' ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-rose-600 text-white hover:bg-rose-700'}`}
        >
          {isLoading ? 'PROCESSING...' : (isRegistering ? 'CREATE ACCOUNT' : 'SECURE LOGIN')}
        </button>
      </form>

      {roleMode === 'admin' && !isRegistering && (
         <div className="mt-4 pt-4 border-t border-slate-100 text-center">
            <button 
               type="button" 
               onClick={() => { setIsRegistering(true); setError(null); }}
               className="text-xs font-medium text-slate-500 hover:text-slate-800 underline decoration-slate-300 transition-colors"
            >
               Register new admin account
            </button>
         </div>
      )}

      {roleMode === 'admin' && isRegistering && (
         <div className="mt-4 pt-4 border-t border-slate-100 text-center">
            <button 
               type="button" 
               onClick={() => { setIsRegistering(false); setError(null); }}
               className="text-xs font-medium text-slate-500 hover:text-slate-800 underline decoration-slate-300 transition-colors"
            >
               Already an admin? Sign in here.
            </button>
         </div>
      )}

      {roleMode === 'users' && (
         <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <button 
               type="button" 
               onClick={() => { setIsRegistering(!isRegistering); setError(null); }}
               className="text-xs font-medium text-slate-500 hover:text-slate-800 underline decoration-slate-300 transition-colors"
            >
               {isRegistering ? 'Already have an account? Sign in here.' : "Don't have an account? Register here."}
            </button>
         </div>
      )}
    </div>
  );
}
