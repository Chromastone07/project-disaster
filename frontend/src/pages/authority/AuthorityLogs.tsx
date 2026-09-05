import React from 'react';
import { useAppStore } from '../../store/appStore';

export default function AuthorityLogs() {
  const { logs } = useAppStore();

  return (
    <div className="col-span-1 md:col-span-3 space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Activity & Audit Logs</h3>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold">{logs.length} Records</span>
          </div>
          
          {logs && logs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                    <th className="py-3 px-4 font-bold uppercase text-[10px]">Timestamp</th>
                    <th className="py-3 px-4 font-bold uppercase text-[10px]">Actor</th>
                    <th className="py-3 px-4 font-bold uppercase text-[10px]">Action</th>
                    <th className="py-3 px-4 font-bold uppercase text-[10px]">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-xs font-mono text-slate-500 min-w-[160px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{log.user_name}</span>
                          <span className="text-[10px] text-slate-500 uppercase">{log.user_role}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-600">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-sm truncate" title={log.details}>
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
              <div className="text-slate-400 font-medium">No activity recorded yet.</div>
            </div>
          )}
      </div>
    </div>
  );
}
