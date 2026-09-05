import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useAppStore } from './store/appStore';
import axios from 'axios';
import DashboardLayout from './components/DashboardLayout';
import CopilotChat from './components/CopilotChat';
import Login from './pages/auth/Login';
import AuthHome from './pages/authority/AuthHome';
import CitizenHome from './pages/citizen/CitizenHome';
import ReportForm from './pages/citizen/ReportForm';
import CitizenHelpMap from './pages/citizen/CitizenHelpMap';
import VolunteerHome from './pages/volunteer/VolunteerHome';
import PublicMap from './pages/PublicMap';

import AuthorityReports from './pages/authority/AuthorityReports';
import AuthorityInventory from './pages/authority/AuthorityInventory';

import VolunteerProfile from './pages/volunteer/VolunteerProfile';
import VolunteerMap from './pages/volunteer/VolunteerMap';
import VolunteerResources from './pages/volunteer/VolunteerResources';

import VolunteerTaskDetail from './pages/volunteer/VolunteerTaskDetail';

import CivicForm from './pages/citizen/CivicForm';
import NotificationToast from './components/NotificationToast';

import AuthorityMatching from './pages/authority/AuthorityMatching';
import AuthorityExport from './pages/authority/AuthorityExport';
import AuthorityUsers from './pages/authority/AuthorityUsers';
import AuthorityBroadcast from './pages/authority/AuthorityBroadcast';
import AuthorityLogs from './pages/authority/AuthorityLogs';
import AuthorityCivic from './pages/authority/AuthorityCivic';
import AuthorityMap from './pages/authority/AuthorityMap';

import CitizenReportDetail from './pages/citizen/CitizenReportDetail';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
  const { user, token } = useAuthStore();
  if (!token || !user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/403" />;
  return <>{children}</>;
};

const PlaceholderCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col">
    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">{title}</h3>
    <div className="flex-1">{children}</div>
  </div>
);

export default function App() {
  const { fetchInitialData, handleRealtimeEvent, initialized } = useAppStore();
  const { logout, token } = useAuthStore();

  useEffect(() => {
    // Axios interceptor for 401
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [logout]);

  useEffect(() => {
    // Fetch initial data
    if (token) {
      fetchInitialData(token);
    } else {
      fetchInitialData();
    }

    // Set up SSE connection
    const apiUrl = import.meta.env.VITE_API_BASE_URL || '';
    const eventSource = new EventSource(`${apiUrl}/api/v1/notifications/stream`);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        handleRealtimeEvent(payload);
      } catch (err) {
        console.error('Error parsing SSE', err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [fetchInitialData, handleRealtimeEvent, initialized, token]);

  if (!initialized) {
    return <div className="h-screen w-full flex items-center justify-center bg-slate-50"><div className="animate-pulse flex items-center gap-2"><div className="w-4 h-4 bg-rose-500 rounded-full"></div><span className="text-slate-500 font-medium">Connecting to Command Center...</span></div></div>;
  }

  return (
    <>
      <CopilotChat />
      <NotificationToast />
      <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          <div className="flex h-screen items-center justify-center bg-slate-100">
            <Login />
          </div>
        } />
        <Route path="/register" element={
          <div className="flex h-screen items-center justify-center bg-slate-50">
            <PlaceholderCard title="Register">
              <p className="text-slate-600 text-sm">Register Page Placeholder</p>
            </PlaceholderCard>
          </div>
        } />
        <Route path="/map" element={<PublicMap />} />
        
        {/* Citizen Routes */}
        <Route path="/citizen/home" element={
          <ProtectedRoute allowedRoles={['citizen', 'volunteer']}>
            <DashboardLayout title="Citizen Dashboard">
              <CitizenHome />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/citizen/report" element={
          <ProtectedRoute allowedRoles={['citizen', 'volunteer']}>
            <DashboardLayout title="Report Emergency">
              <ReportForm />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/citizen/find-help" element={
          <ProtectedRoute allowedRoles={['citizen', 'volunteer']}>
            <DashboardLayout title="Find Assistance">
               <CitizenHelpMap />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/citizen/civic" element={
          <ProtectedRoute allowedRoles={['citizen', 'volunteer']}>
            <DashboardLayout title="Report Civic Issue">
              <CivicForm />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/citizen/reports/:id" element={
          <ProtectedRoute allowedRoles={['citizen', 'volunteer']}>
            <DashboardLayout title="Report Status">
              <CitizenReportDetail />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/citizen/*" element={<Navigate to="/citizen/home" />} />

        {/* Volunteer Routes */}
        <Route path="/volunteer/home" element={
          <ProtectedRoute allowedRoles={['volunteer', 'citizen']}>
            <DashboardLayout title="Volunteer Command">
              <VolunteerHome />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/volunteer/map" element={
          <ProtectedRoute allowedRoles={['volunteer', 'citizen']}>
            <DashboardLayout title="Live Field Map">
              <VolunteerMap />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/volunteer/resources" element={
          <ProtectedRoute allowedRoles={['volunteer', 'citizen']}>
            <DashboardLayout title="Resource Check-in">
              <VolunteerResources />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/volunteer/task/:id" element={
          <ProtectedRoute allowedRoles={['volunteer', 'citizen']}>
            <DashboardLayout title="Active Deployment">
              <VolunteerTaskDetail />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/volunteer/profile" element={
          <ProtectedRoute allowedRoles={['volunteer', 'citizen']}>
            <DashboardLayout title="My Profile">
               <VolunteerProfile />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/volunteer/*" element={<Navigate to="/volunteer/home" />} />

        {/* Authority Routes */}
        <Route path="/authority/home" element={
          <ProtectedRoute allowedRoles={['authority']}>
            <DashboardLayout title="Authority Command Center">
              <AuthHome />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/authority/map" element={
          <ProtectedRoute allowedRoles={['authority']}>
            <DashboardLayout title="Live Operations Map">
              <AuthorityMap />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/authority/reports" element={
          <ProtectedRoute allowedRoles={['authority']}>
            <DashboardLayout title="Disaster Reports">
              <AuthorityReports />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/authority/civic" element={
          <ProtectedRoute allowedRoles={['authority']}>
            <DashboardLayout title="Civic Issues">
              <AuthorityCivic />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/authority/matching" element={
          <ProtectedRoute allowedRoles={['authority']}>
            <DashboardLayout title="Volunteer Matching">
              <AuthorityMatching />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/authority/inventory" element={
          <ProtectedRoute allowedRoles={['authority']}>
            <DashboardLayout title="Resource Registry">
               <AuthorityInventory />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/authority/export" element={
          <ProtectedRoute allowedRoles={['authority']}>
            <DashboardLayout title="Data Export & Audit">
               <AuthorityExport />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/authority/users" element={
          <ProtectedRoute allowedRoles={['authority']}>
            <DashboardLayout title="User Management">
               <AuthorityUsers />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/authority/broadcast" element={
          <ProtectedRoute allowedRoles={['authority']}>
            <DashboardLayout title="Emergency Broadcast">
               <AuthorityBroadcast />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/authority/logs" element={
          <ProtectedRoute allowedRoles={['authority']}>
            <DashboardLayout title="Activity Logs">
               <AuthorityLogs />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/authority/*" element={<Navigate to="/authority/home" />} />
        
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/403" element={<div className="p-8 text-rose-600 bg-rose-50 h-screen font-bold flex items-center justify-center">Access Denied (403)</div>} />
      </Routes>
    </BrowserRouter>
    </>
  );
}
