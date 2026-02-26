import React, { useState, useEffect } from "react";
import { Save, Calendar, User, Building2, AlignLeft, RefreshCw, Loader2 } from "lucide-react";

export default function TaskCreation() {
  const [clients, setClients] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    title: "",
    client_id: "",
    doer_id: "",
    remarks: "",
    frequency: "One Time",
    due_date_logic: {} as any
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/clients").then(res => res.json()),
      fetch("/api/users?role=employee").then(res => res.json())
    ]).then(([clientsData, employeesData]) => {
      setClients(clientsData);
      setEmployees(employeesData);
    }).catch(err => console.error("Failed to fetch data", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error("Failed to create task");
      setMessage({ type: "success", text: "Task created successfully!" });
      setFormData({ ...formData, title: "", remarks: "", due_date_logic: {} });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const renderFrequencyLogic = () => {
    switch (formData.frequency) {
      case "One Time":
        return (
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Select Date</label>
            <input type="date" className="block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm" 
              onChange={e => setFormData({...formData, due_date_logic: { date: e.target.value }})} />
          </div>
        );
      case "Daily":
        return <p className="text-sm text-slate-500 mt-4 bg-slate-50 p-3 rounded-md border border-slate-100">Task will repeat daily. No specific date logic required.</p>;
      case "Weekly":
        return (
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Day of the Week</label>
            <select className="block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              onChange={e => setFormData({...formData, due_date_logic: { dayOfWeek: e.target.value }})}>
              <option value="">Select Day</option>
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        );
      case "Monthly":
        return (
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Date of the Month</label>
            <input type="number" min="1" max="31" placeholder="e.g., 15" className="block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              onChange={e => setFormData({...formData, due_date_logic: { dateOfMonth: e.target.value }})} />
          </div>
        );
      case "Quarterly":
      case "Half yearly":
      case "Yearly":
        return (
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">First Occurrence Date</label>
            <input type="date" className="block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              onChange={e => setFormData({...formData, due_date_logic: { firstDate: e.target.value }})} />
            <p className="text-xs text-slate-500 mt-2">Subsequent dates will be calculated automatically based on the frequency.</p>
          </div>
        );
      case "Specific Day's":
        return (
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Specific Day Logic</label>
            <div className="flex gap-2">
              <select className="block w-1/3 rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                onChange={e => setFormData({...formData, due_date_logic: { ...formData.due_date_logic, occurrence: e.target.value }})}>
                <option value="">Occurrence</option>
                <option value="1st">1st</option><option value="2nd">2nd</option><option value="3rd">3rd</option><option value="4th">4th</option><option value="Last">Last</option>
              </select>
              <select className="block w-1/3 rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                onChange={e => setFormData({...formData, due_date_logic: { ...formData.due_date_logic, day: e.target.value }})}>
                <option value="">Day</option>
                {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select className="block w-1/3 rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                onChange={e => setFormData({...formData, due_date_logic: { ...formData.due_date_logic, period: e.target.value }})}>
                <option value="">Period</option>
                <option value="of the month">of the month</option><option value="of the quarter">of the quarter</option><option value="of the year">of the year</option>
              </select>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Task Creation</h1>
        <p className="mt-1 text-sm text-slate-500">Create and assign new tasks to employees with specific frequency logic.</p>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
          
          {/* Task Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700">
              Task Title <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="text"
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="block w-full rounded-md border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
                placeholder="e.g., Monthly GST Return Filing"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-y-6 gap-x-8 sm:grid-cols-2">
            {/* Client Selection */}
            <div>
              <label htmlFor="client" className="block text-sm font-medium text-slate-700">
                Client <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-slate-400" />
                </div>
                <select
                  id="client"
                  required
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  className="block w-full rounded-md border border-slate-300 pl-10 py-3 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm bg-white"
                >
                  <option value="">Select a Client</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Assigned Doer */}
            <div>
              <label htmlFor="doer" className="block text-sm font-medium text-slate-700">
                Assigned Doer (Employee) <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <select
                  id="doer"
                  required
                  value={formData.doer_id}
                  onChange={(e) => setFormData({ ...formData, doer_id: e.target.value })}
                  className="block w-full rounded-md border border-slate-300 pl-10 py-3 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm bg-white"
                >
                  <option value="">Select an Employee</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-y-6 gap-x-8 sm:grid-cols-2">
            {/* Frequency Logic */}
            <div className="bg-slate-50 p-5 rounded-lg border border-slate-200">
              <div className="flex items-center mb-4">
                <RefreshCw className="h-5 w-5 text-indigo-500 mr-2" />
                <h3 className="text-sm font-semibold text-slate-900">Schedule & Frequency</h3>
              </div>
              
              <label htmlFor="frequency" className="block text-sm font-medium text-slate-700">
                Frequency Type
              </label>
              <select
                id="frequency"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value, due_date_logic: {} })}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm bg-white"
              >
                {["One Time", "Daily", "Weekly", "Monthly", "Quarterly", "Half yearly", "Yearly", "Specific Day's"].map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>

              {renderFrequencyLogic()}
            </div>

            {/* Remarks */}
            <div>
              <label htmlFor="remarks" className="block text-sm font-medium text-slate-700">
                Remarks / Notes
              </label>
              <div className="mt-1 relative rounded-md shadow-sm h-full">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <AlignLeft className="h-5 w-5 text-slate-400" />
                </div>
                <textarea
                  id="remarks"
                  rows={6}
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="block w-full h-[calc(100%-1.5rem)] rounded-md border border-slate-300 pl-10 py-3 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm resize-none"
                  placeholder="Add any specific instructions or notes for the doer..."
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
