import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { CheckCircle2, Clock, AlertCircle, FileText, Calendar as CalendarIcon, TrendingUp, Users, Activity } from "lucide-react";

export default function AdminDashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState("Monthly");

  useEffect(() => {
    fetchTasks();
  }, [dateRange]);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalDue = tasks.length;
  const pending = tasks.filter(t => !['Completed', 'Completed Late', 'Not Required'].includes(t.status)).length;
  const completed = tasks.filter(t => t.status === 'Completed').length;
  const completedLate = tasks.filter(t => t.status === 'Completed Late').length;

  // Prepare Bar Chart Data (Staff Performance)
  const doerStats = tasks.reduce((acc: any, task: any) => {
    if (!task.doer_name) return acc;
    if (!acc[task.doer_name]) {
      acc[task.doer_name] = { name: task.doer_name, Pending: 0, Completed: 0, Late: 0 };
    }
    if (task.status === 'Completed') acc[task.doer_name].Completed++;
    else if (task.status === 'Completed Late') acc[task.doer_name].Late++;
    else if (task.status !== 'Not Required') acc[task.doer_name].Pending++;
    return acc;
  }, {});
  const barChartData = Object.values(doerStats);

  // Prepare Pie Chart Data (Status Distribution)
  const statusCounts = tasks.reduce((acc: any, task: any) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});
  const pieChartData = Object.keys(statusCounts).map(key => ({
    name: key,
    value: statusCounts[key]
  })).sort((a, b) => b.value - a.value);

  const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#64748b'];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
            <Activity className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Dashboard</h1>
            <p className="text-sm text-slate-500 font-medium">Real-time overview of firm workload and performance.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
          <CalendarIcon className="h-5 w-5 text-slate-400 ml-2" />
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            className="block w-36 rounded-md border-transparent py-1.5 pl-2 pr-8 text-sm font-semibold text-slate-700 bg-transparent focus:border-transparent focus:ring-0 cursor-pointer"
          >
            <option value="Daily">Today</option>
            <option value="Weekly">This Week</option>
            <option value="Monthly">This Month</option>
            <option value="Custom">All Time</option>
          </select>
        </div>
      </div>

      {/* Premium Stat Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Tasks */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 shadow-lg shadow-blue-500/20 text-white relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-blue-100 text-sm font-semibold tracking-wider uppercase">Volume</p>
              <h3 className="text-3xl font-bold mt-1">{totalDue}</h3>
            </div>
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-blue-100 font-medium flex items-center gap-1.5 mt-4">
            <TrendingUp className="h-4 w-4" /> Total active records
          </p>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-500 text-sm font-semibold tracking-wider uppercase">Pending</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{pending}</h3>
            </div>
            <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-100">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
          </div>
          <p className="text-sm text-slate-500 font-medium mt-4">Requiring action or review</p>
        </div>

        {/* Completed On Time */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-500 text-sm font-semibold tracking-wider uppercase">Completed</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{completed}</h3>
            </div>
            <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
          </div>
          <p className="text-sm text-slate-500 font-medium mt-4">Processed within SLA</p>
        </div>

        {/* Completed Late */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-500 text-sm font-semibold tracking-wider uppercase">Late</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{completedLate}</h3>
            </div>
            <div className="bg-rose-50 p-2.5 rounded-xl border border-rose-100">
              <AlertCircle className="h-6 w-6 text-rose-500" />
            </div>
          </div>
          <p className="text-sm text-slate-500 font-medium mt-4">Missed deadline occurrences</p>
        </div>
      </div>

      {/* Enhanced Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Status Breakdown Pie Chart */}
        <div className="lg:col-span-1 bg-white shadow-sm rounded-2xl border border-slate-200 p-6 flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900">Task Distribution</h3>
            <p className="text-sm text-slate-500 font-medium">Breakdown by current status</p>
          </div>

          <div className="flex-1 min-h-[300px] flex items-center justify-center">
            {isLoading ? (
              <div className="text-slate-400 font-medium">Loading distribution...</div>
            ) : pieChartData.length === 0 ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Activity className="h-6 w-6 text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium">No tasks available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', fontWeight: 600 }}
                    itemStyle={{ color: '#0f172a' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    formatter={(value, entry, index) => <span className="text-slate-700 font-medium text-xs ml-1">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Staff Workload Bar Chart */}
        <div className="lg:col-span-2 bg-white shadow-sm rounded-2xl border border-slate-200 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Staff Workload & Performance</h3>
              <p className="text-sm text-slate-500 font-medium">Task completion metrics per employee</p>
            </div>
            <div className="bg-indigo-50 p-2 rounded-lg">
              <Users className="h-5 w-5 text-indigo-600" />
            </div>
          </div>

          <div className="flex-1 min-h-[300px]">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-slate-400 font-medium">Loading performance data...</div>
            ) : barChartData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium">No assignee data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                  />
                  <RechartsTooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                    itemStyle={{ fontWeight: 600 }}
                    labelStyle={{ color: '#64748b', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="circle"
                    formatter={(value) => <span className="text-slate-700 font-medium text-xs ml-1">{value}</span>}
                  />
                  <Bar dataKey="Completed" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="Late" stackId="a" fill="#f43f5e" />
                  <Bar dataKey="Pending" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
