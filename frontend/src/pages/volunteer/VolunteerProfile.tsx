import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import StatusBadge from '../../components/StatusBadge';

export default function VolunteerProfile() {
  const { user } = useAuthStore();
  const { reports } = useAppStore();

  // Compute stats from real data
  const assignedTasks = reports.filter(r => r.assigned_volunteers?.includes(user?.id || ''));
  const appliedTasks = reports.filter(r => r.applied_volunteers?.includes(user?.id || ''));
  const completedTasks = assignedTasks.filter(r => r.status === 'resolved');
  const activeTasks = assignedTasks.filter(r => r.status === 'in_progress' || r.status === 'active');

  return (
    <div className="col-span-1 md:col-span-3 pb-8">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm max-w-4xl mx-auto overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 border-b border-slate-800 p-6 md:p-8 text-white">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-slate-800 rounded-full border-2 border-slate-700 flex items-center justify-center text-3xl font-bold">
              {user?.name?.charAt(0) || 'V'}
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">{user?.name || 'Volunteer'}</h2>
              <p className="text-slate-400 text-sm font-mono">{user?.email}</p>
              <p className="text-slate-500 text-xs mt-1 capitalize">Role: {user?.role}</p>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold font-mono text-slate-800">{appliedTasks.length}</div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">Tasks Applied</div>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold font-mono text-blue-600">{activeTasks.length}</div>
              <div className="text-[10px] uppercase font-bold text-blue-400 tracking-wider mt-1">Active Assignments</div>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold font-mono text-emerald-600">{completedTasks.length}</div>
              <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider mt-1">Completed</div>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold font-mono text-amber-600">{assignedTasks.length}</div>
              <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider mt-1">Total Assigned</div>
            </div>
          </div>
          
          {/* Active Assignments */}
          <div className="mb-8">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500 mb-4 border-b border-slate-100 pb-2">Active Assignments</h3>
            {activeTasks.length > 0 ? (
              <div className="space-y-3">
                {activeTasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-slate-50 hover:border-slate-300 transition">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-slate-600">{task.id}</span>
                        <StatusBadge status={task.severity} type="severity" />
                      </div>
                      <p className="text-sm font-medium text-slate-800 line-clamp-1">{task.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge status={task.status} />
                      <span className="text-[10px] text-slate-400">{task.progress || 0}% done</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm border border-dashed border-slate-200 rounded-lg">
                No active assignments. Apply for tasks from the Task Queue.
              </div>
            )}
          </div>

          {/* Completed History */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500 mb-4 border-b border-slate-100 pb-2">Completed Deployments</h3>
            {completedTasks.length > 0 ? (
              <div className="space-y-3">
                {completedTasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-white">
                    <div>
                      <span className="font-mono text-xs font-bold text-slate-500">{task.id}</span>
                      <p className="text-sm text-slate-600 line-clamp-1">{task.description}</p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded uppercase">Resolved</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm border border-dashed border-slate-200 rounded-lg">
                No completed deployments yet. Your history will appear here.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
