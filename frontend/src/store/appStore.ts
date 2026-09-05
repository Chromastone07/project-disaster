import { create } from 'zustand';
import axios from 'axios';

export interface DisasterReport {
  id: string;
  reporter_id: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  latitude: number;
  longitude: number;
  description: string;
  assigned_volunteers?: string[];
  applied_volunteers?: string[];
  victims?: string[];
  progress?: number;
  status: 'unreviewed' | 'active' | 'in_progress' | 'resolved' | 'duplicate' | 'archived';
  created_at: string;
}

export interface LocationRegistry {
  id: string;
  name: string;
  category: 'shelter' | 'medical' | 'distribution';
  latitude: number;
  longitude: number;
  capacity: number;
  operational_status: 'open' | 'full' | 'closed';
}

export interface InventoryItem {
  id: string;
  location_id: string;
  item_name: string;
  quantity: number;
  unit: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  score?: number;
  latitude?: number;
  longitude?: number;
}

export interface Broadcast {
  id: string;
  message: string;
  severity: string;
  created_at: string;
}

export interface Contribution {
  id: string;
  user_id: string;
  item_name: string;
  quantity: number;
  unit: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  user_id: string;
  user_name: string;
  user_role: string;
  action: string;
  details: string;
}

export interface CivicIssue {
  id: string;
  reporter_id: string;
  category: 'road_damage' | 'power_outage' | 'water_contamination' | 'drainage' | 'fallen_tree' | 'other';
  latitude: number;
  longitude: number;
  description: string;
  status: 'open' | 'acknowledged' | 'in_progress' | 'resolved';
  created_at: string;
}

interface AppState {
  reports: DisasterReport[];
  civic_issues: CivicIssue[];
  locations: LocationRegistry[];
  inventory: InventoryItem[];
  users: User[];
  broadcasts: Broadcast[];
  contributions: Contribution[];
  logs: SystemLog[];
  initialized: boolean;
  fetchInitialData: (token?: string) => Promise<void>;
  addReport: (report: Omit<DisasterReport, 'id' | 'created_at' | 'status'>, token: string) => Promise<void>;
  updateReport: (id: string, updates: Partial<DisasterReport>, token: string) => Promise<void>;
  enrollAsVictim: (id: string, token: string) => Promise<void>;
  applyForTask: (id: string, token: string) => Promise<void>;
  addInventoryItem: (item: Omit<InventoryItem, 'id'>, token: string) => Promise<void>;
  updateInventoryQuantity: (id: string, quantity: number, token: string) => Promise<void>;
  addContribution: (contribution: Omit<Contribution, 'id' | 'status' | 'created_at' | 'user_id'>, token: string) => Promise<void>;
  addLocation: (location: Omit<LocationRegistry, 'id'>, token: string) => Promise<void>;
  addCivicIssue: (issue: Omit<CivicIssue, 'id' | 'status' | 'created_at' | 'reporter_id'>, token: string) => Promise<void>;
  updateCivicIssueStatus: (id: string, status: CivicIssue['status'], token: string) => Promise<void>;
  deleteReport: (id: string, token: string) => Promise<void>;
  deleteUser: (id: string, token: string) => Promise<void>;
  deleteBroadcast: (id: string, token: string) => Promise<void>;
  deleteCivicIssue: (id: string, token: string) => Promise<void>;
  deleteInventoryItem: (id: string, token: string) => Promise<void>;
  handleRealtimeEvent: (event: any) => void;
}

const API_BASE = '/api/v1';

export const useAppStore = create<AppState>((set, get) => ({
  reports: [],
  civic_issues: [],
  locations: [],
  inventory: [],
  users: [],
  broadcasts: [],
  contributions: [],
  logs: [],
  initialized: false,
  
  fetchInitialData: async (token) => {
    try {
      const endpoints: Promise<any>[] = [
        axios.get(`${API_BASE}/reports`),
        axios.get(`${API_BASE}/locations`),
        axios.get(`${API_BASE}/inventory`),
        axios.get(`${API_BASE}/broadcast`)
      ];
      if (token) {
        endpoints.push(axios.get(`${API_BASE}/users`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })));
        endpoints.push(axios.get(`${API_BASE}/contributions`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })));
        endpoints.push(axios.get(`${API_BASE}/logs`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })));
        endpoints.push(axios.get(`${API_BASE}/civic-issues`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })));
      }
      
      const res = await Promise.all(endpoints);
      
      set({ 
        reports: res[0].data, 
        locations: res[1].data, 
        inventory: res[2].data,
        broadcasts: res[3].data || [],
        users: token ? res[4]?.data || [] : [],
        contributions: token ? res[5]?.data || [] : [],
        logs: token ? res[6]?.data || [] : [],
        civic_issues: token ? (res[7]?.data || []) : [],
        initialized: true
      });
    } catch (err) {
      console.error("Failed to fetch initial data", err);
    }
  },

  addReport: async (report, token) => {
    try {
      await axios.post(`${API_BASE}/reports`, report, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // SSE will handle putting it into state
    } catch (err) {
      console.error("Failed to add report", err);
    }
  },

  updateReport: async (id, updates, token) => {
    try {
      await axios.patch(`${API_BASE}/reports/${id}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // SSE will handle putting it into state
    } catch (err) {
      console.error("Failed to update report", err);
    }
  },

  enrollAsVictim: async (id, token) => {
    try {
      await axios.post(`${API_BASE}/reports/${id}/enroll-victim`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error(err);
    }
  },
  applyForTask: async (id, token) => {
    try {
      await axios.post(`${API_BASE}/reports/${id}/apply`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Failed to apply for task", err);
    }
  },

  addInventoryItem: async (item, token) => {
    try {
      await axios.post(`${API_BASE}/inventory`, item, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Failed to add inventory item", err);
    }
  },

  updateInventoryQuantity: async (id, quantity, token) => {
    try {
      await axios.patch(`${API_BASE}/inventory/${id}`, { quantity }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Failed to update inventory quantity", err);
    }
  },

  addContribution: async (contribution, token) => {
    try {
      const res = await axios.post(`${API_BASE}/contributions`, contribution, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set((state) => ({ contributions: [res.data, ...state.contributions] }));
    } catch (err) {
      console.error("Failed to add contribution", err);
    }
  },

  addLocation: async (location, token) => {
    try {
      const res = await axios.post(`${API_BASE}/locations`, location, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set((state) => ({ locations: [res.data, ...state.locations] }));
    } catch (err) {
      console.error("Failed to add location", err);
    }
  },

  addCivicIssue: async (issue, token) => {
    try {
      await axios.post(`${API_BASE}/civic-issues`, issue, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // handled by SSE
    } catch (err) {
      console.error("Failed to add civic issue", err);
    }
  },

  updateCivicIssueStatus: async (id, status, token) => {
    try {
      await axios.patch(`${API_BASE}/civic-issues/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Failed to update civic issue status", err);
    }
  },

  deleteReport: async (id, token) => {
    try {
      await axios.delete(`${API_BASE}/reports/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set((state) => ({ reports: state.reports.filter(r => r.id !== id) }));
    } catch (err) {
      console.error("Failed to delete report", err);
    }
  },

  deleteUser: async (id, token) => {
    try {
      await axios.delete(`${API_BASE}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set((state) => ({ users: state.users.filter(u => u.id !== id) }));
    } catch (err) {
      console.error("Failed to delete user", err);
    }
  },

  deleteBroadcast: async (id, token) => {
    try {
      await axios.delete(`${API_BASE}/broadcast/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set((state) => ({ broadcasts: state.broadcasts.filter(b => b.id !== id) }));
    } catch (err) {
      console.error("Failed to delete broadcast", err);
    }
  },

  deleteCivicIssue: async (id, token) => {
    try {
      await axios.delete(`${API_BASE}/civic-issues/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set((state) => ({ civic_issues: state.civic_issues.filter(c => c.id !== id) }));
    } catch (err) {
      console.error("Failed to delete civic issue", err);
    }
  },

  deleteInventoryItem: async (id, token) => {
    try {
      await axios.delete(`${API_BASE}/inventory/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set((state) => ({ inventory: state.inventory.filter(i => i.id !== id) }));
    } catch (err) {
      console.error("Failed to delete inventory item", err);
    }
  },

  handleRealtimeEvent: (payload) => {
    const { event, data } = payload;
    
    if (event === 'report_created') {
      set((state) => ({ reports: [data, ...state.reports] }));
    } else if (event === 'report_updated') {
      set((state) => ({
        reports: state.reports.map(r => r.id === data.id ? data : r)
      }));
    } else if (event === 'inventory_created') {
      set((state) => ({ inventory: [...state.inventory, data] }));
    } else if (event === 'inventory_updated') {
      set((state) => ({
        inventory: state.inventory.map(i => i.id === data.id ? data : i)
      }));
    } else if (event === 'broadcast_alert') {
      set((state) => ({ broadcasts: [data, ...state.broadcasts] }));
    } else if (event === 'civic_issue_created') {
      set((state) => ({ civic_issues: [data, ...state.civic_issues] }));
    } else if (event === 'civic_issue_updated') {
      set((state) => ({
        civic_issues: state.civic_issues.map(c => c.id === data.id ? data : c)
      }));
    } else if (event === 'user_created') {
      set((state) => ({ users: [...state.users, data] }));
    }
  }
}));
