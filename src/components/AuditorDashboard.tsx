import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Clock, XCircle, Search, History } from "lucide-react";

export default function AuditorDashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [remarks, setRemarks] = useState<{ [key: number]: string }>({});
  const [expandedTask, setExpandedTask] = useState<number | null>(null);
  const [taskHistory, setTaskHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      // Filter tasks that are completed and need auditing
      setTasks(data.filter((t: any) => ['Completed', 'Completed Late'].includes(t.status) || t.audit_status !== 'Pending'));
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuditAction = async (taskId: number, action: 'Approve' | 'Reopen') => {
    try {
      const auditRemarks = remarks[taskId] || "";
      const newStatus = action === 'Approve' ? 'Audited' : 'In Progress';
      const newAuditStatus = action === 'Approve' ? 'Approved' : 'Reopened';

      await fetch(`/api/tasks/${taskId}/audit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, audit_status: newAuditStatus, audit_remarks: auditRemarks })
      });
      fetchTasks();
      if (expandedTask === taskId) toggleHistory(taskId, true);
    } catch (error) {
      console.error("Failed to update audit status", error);
    }
  };

  const toggleHistory = async (taskId: number, forceRefresh = false) => {
    if (expandedTask === taskId && !forceRefresh) {
      setExpandedTask(null);
      return;
    }
    setExpandedTask(taskId);
    setTaskHistory([]);
    try {
      const res = await fetch(`/api/tasks/${taskId}/history`);
      const data = await res.json();
      setTaskHistory(data);
    } catch (e) {
      console.error("Failed to fetch history", e);
    }
  };

  const getDaysRemaining = (completedAt: string) => {
    if (!completedAt) return 0;
    const completedDate = new Date(completedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - completedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, 6 - diffDays);
  };

  const pendingAudits = tasks.filter(t => t.audit_status === 'Pending');
  const completedAudits = tasks.filter(t => t.audit_status !== 'Pending');

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Auditor Module</h1>
        <p className="mt-1 text-sm text-slate-500">Review completed tasks within the 6-day SLA window.</p>
      </div>

      {/* Premium Stat Counters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        {/* Pending Audits */}
        <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-6 shadow-lg shadow-indigo-500/20 text-white relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-indigo-100 text-sm font-semibold tracking-wider uppercase">Pending Queue</p>
              <h3 className="text-3xl font-bold mt-1">{pendingAudits.length}</h3>
            </div>
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-indigo-100 font-medium flex items-center gap-1.5 mt-4">
            Awaiting your review
          </p>
        </div>

        {/* Approved Audits */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-500 text-sm font-semibold tracking-wider uppercase">Approved</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{completedAudits.filter(t => t.audit_status === 'Approved').length}</h3>
            </div>
            <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
          </div>
          <p className="text-sm text-slate-500 font-medium mt-4">Successfully verified tasks</p>
        </div>

        {/* Reopened Audits */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-500 text-sm font-semibold tracking-wider uppercase">Reopened</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{completedAudits.filter(t => t.audit_status === 'Reopened').length}</h3>
            </div>
            <div className="bg-rose-50 p-2.5 rounded-xl border border-rose-100">
              <AlertCircle className="h-6 w-6 text-rose-500" />
            </div>
          </div>
          <p className="text-sm text-slate-500 font-medium mt-4">Sent back for corrections</p>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="text-lg font-medium text-slate-900">Tasks Awaiting Audit</h3>
        </div>
        <div className="divide-y divide-slate-200">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">Loading tasks...</div>
          ) : pendingAudits.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No tasks pending audit.</div>
          ) : (
            pendingAudits.map((task) => {
              const daysLeft = getDaysRemaining(task.completed_at);
              return (
                <div key={task.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-base font-medium text-slate-900">{task.title}</h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${daysLeft <= 2 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                          {daysLeft} days left to audit
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 mb-4">
                        <span>Client: <span className="font-medium text-slate-700">{task.client_name}</span></span>
                        <span>•</span>
                        <span>Doer: <span className="font-medium text-slate-700">{task.doer_name}</span></span>
                        <span>•</span>
                        <span>Completed: {new Date(task.completed_at).toLocaleDateString()}</span>
                      </div>

                      <div className="w-full max-w-2xl">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Audit Remarks (Optional)</label>
                        <textarea
                          rows={2}
                          value={remarks[task.id] || ''}
                          onChange={(e) => setRemarks({ ...remarks, [task.id]: e.target.value })}
                          className="block w-full rounded-md border border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                          placeholder="Add notes before approving or reopening..."
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 mt-4 lg:mt-0">
                      <button
                        onClick={() => handleAuditAction(task.id, 'Reopen')}
                        className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                      >
                        <XCircle className="h-4 w-4 mr-2 text-red-500" />
                        Reopen
                      </button>
                      <button
                        onClick={() => handleAuditAction(task.id, 'Approve')}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Approve
                      </button>
                      <button onClick={() => toggleHistory(task.id)} className="p-2 ml-2 text-slate-400 hover:text-indigo-600 transition-colors" title="View History">
                        <History className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  {expandedTask === task.id && (
                    <div className="mt-4 p-4 bg-slate-100 rounded-md border border-slate-200">
                      <h5 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                        <History className="h-4 w-4 mr-2 text-indigo-500" /> Task History
                      </h5>
                      {taskHistory.length === 0 ? <p className="text-sm text-slate-500">No history found.</p> : (
                        <ul className="space-y-4">
                          {taskHistory.map(audit => (
                            <li key={audit.id} className="text-sm text-slate-600 flex justify-between border-l-2 border-indigo-400 pl-3">
                              <div>
                                <span className="font-medium text-slate-900">{audit.action}</span> - {audit.details}
                                <p className="text-xs text-slate-500 mt-1">By <span className="font-medium text-slate-700">{audit.user_name || "System"}</span></p>
                              </div>
                              <span className="text-xs font-medium text-slate-400 whitespace-nowrap pl-4">
                                {new Date(audit.created_at).toLocaleString()}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
