import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { CheckCircle2, Clock, AlertCircle, FileText, UploadCloud, MessageSquare, History } from "lucide-react";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedTask, setExpandedTask] = useState<number | null>(null);
  const [taskHistory, setTaskHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      // Filter tasks for this specific employee
      setTasks(data.filter((t: any) => t.doer_id === user?.id));
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      await fetch(`/api/tasks/${taskId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      fetchTasks();
      if (expandedTask === taskId) toggleHistory(taskId, true); // refresh history if open
    } catch (error) {
      console.error("Failed to update status", error);
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const pendingTasks = tasks.filter(t => !['Completed', 'Completed Late', 'Not Required'].includes(t.status));
  const dueToday = pendingTasks.filter(t => {
    if (!t.due_date) return false;
    const d = new Date(t.due_date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });
  const overdue = pendingTasks.filter(t => {
    if (!t.due_date) return false;
    const d = new Date(t.due_date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() < today.getTime();
  });

  const completionRate = tasks.length > 0
    ? Math.round((tasks.filter(t => ['Completed', 'Completed Late'].includes(t.status)).length / tasks.length) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Workspace</h1>
        <p className="mt-1 text-sm text-slate-500">Welcome back, {user?.name}. Here's your task overview.</p>
      </div>

      {/* Premium Stat Counters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Total Workload */}
        <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-6 shadow-lg shadow-indigo-500/20 text-white relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-indigo-100 text-sm font-semibold tracking-wider uppercase">Workload</p>
              <h3 className="text-3xl font-bold mt-1">{pendingTasks.length}</h3>
            </div>
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-indigo-100 font-medium flex items-center gap-1.5 mt-4">
            Total active tasks assigned
          </p>
        </div>

        {/* Due Today */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-500 text-sm font-semibold tracking-wider uppercase">Due Today</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{dueToday.length}</h3>
            </div>
            <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-100">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
          </div>
          <p className="text-sm text-slate-500 font-medium mt-4">Requires immediate attention</p>
        </div>

        {/* Overdue */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-500 text-sm font-semibold tracking-wider uppercase">Overdue</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{overdue.length}</h3>
            </div>
            <div className="bg-rose-50 p-2.5 rounded-xl border border-rose-100">
              <AlertCircle className="h-6 w-6 text-rose-500" />
            </div>
          </div>
          <p className="text-sm text-slate-500 font-medium mt-4">Missed deadline occurrences</p>
        </div>

        {/* Completion Rate */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-500 text-sm font-semibold tracking-wider uppercase">Win Rate</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{completionRate}%</h3>
            </div>
            <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
          </div>
          <p className="text-sm text-slate-500 font-medium mt-4">Task completion percentage</p>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-medium text-slate-900">My Tasks</h3>
        </div>
        <div className="divide-y divide-slate-200">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No tasks assigned to you.</div>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="text-base font-medium text-slate-900">{task.title}</h4>
                    <div className="mt-1 flex items-center gap-4 text-sm text-slate-500">
                      <span>Client: {task.client_name}</span>
                      <span>•</span>
                      <span className={
                        task.due_date && new Date(task.due_date) < new Date() && !['Completed', 'Completed Late'].includes(task.status)
                          ? "text-red-600 font-medium"
                          : ""
                      }>
                        Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className={`text-sm rounded-md border-slate-300 py-1.5 pl-3 pr-8 focus:ring-indigo-500 focus:border-indigo-500 ${task.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        task.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-white'
                        }`}
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Waiting for Client">Waiting for Client</option>
                      <option value="Filed">Filed</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="Completed Late">Completed Late</option>
                      <option value="Not Required">Not Required</option>
                    </select>

                    <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" title="Add Remarks">
                      <MessageSquare className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" title="Attach File">
                      <UploadCloud className="h-5 w-5" />
                    </button>
                    <button onClick={() => toggleHistory(task.id)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" title="View History">
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}
