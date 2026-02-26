import { supabase } from "../db/database.js";
import bcrypt from "bcryptjs";

export const dbService = {
  // Users
  getUserByEmail: async (email: string) => {
    const { data } = await supabase.from('users').select('*').eq('email', email).single();
    return data;
  },
  getUserById: async (id: number) => {
    const { data } = await supabase.from('users').select('id, name, email, role').eq('id', id).single();
    return data;
  },
  getUsersByRole: async (role: string) => {
    const { data } = await supabase.from('users').select('id, name, email, role').eq('role', role);
    return data || [];
  },
  getAllUsers: async () => {
    const { data } = await supabase.from('users').select('id, name, email, role').order('created_at', { ascending: false });
    return data || [];
  },
  updateUserRole: async (id: number, role: string) => {
    const { error } = await supabase.from('users').update({ role }).eq('id', id);
    return !error;
  },
  createUser: async (user: any) => {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const { data } = await supabase.from('users').insert([{
      name: user.name,
      email: user.email,
      password: hashedPassword,
      role: user.role || 'employee'
    }]).select('id, name, email, role').single();
    return data;
  },
  deleteUser: async (id: number) => {
    const { error } = await supabase.from('users').delete().eq('id', id);
    return !error;
  },

  // Clients
  getAllClients: async () => {
    const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
    return data || [];
  },
  getClientById: async (id: number) => {
    const { data } = await supabase.from('clients').select('*').eq('id', id).single();
    return data;
  },
  createClient: async (client: any) => {
    const servicesStr = Array.isArray(client.services) ? JSON.stringify(client.services) : (client.services || "[]");
    const { data } = await supabase.from('clients').insert([{
      name: client.name,
      contact_person: client.contact_person || "",
      email: client.email || "",
      phone: client.phone || "",
      services: servicesStr
    }]).select('*').single();
    return data;
  },
  updateClient: async (id: number, client: any) => {
    const servicesStr = Array.isArray(client.services) ? JSON.stringify(client.services) : (client.services || "[]");
    const { data } = await supabase.from('clients').update({
      name: client.name,
      contact_person: client.contact_person || "",
      email: client.email || "",
      phone: client.phone || "",
      services: servicesStr,
      updated_at: new Date().toISOString()
    }).eq('id', id).select('*').single();
    return data;
  },
  deleteClient: async (id: number) => {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    return !error;
  },

  // Tasks
  getAllTasks: async () => {
    // Supabase automatically formats joined tables as nested objects
    const { data } = await supabase.from('tasks').select(`
      *,
      client:clients!client_id(name),
      doer:users!doer_id(name)
    `).order('created_at', { ascending: false });

    // Map it back to the flat structure the frontend expects
    return (data || []).map((t: any) => ({
      ...t,
      client_name: t.client ? t.client.name : null,
      doer_name: t.doer ? t.doer.name : null
    }));
  },
  getTaskById: async (id: number) => {
    const { data } = await supabase.from('tasks').select(`
      *,
      client:clients!client_id(name),
      doer:users!doer_id(name)
    `).eq('id', id).single();

    if (data) {
      data.client_name = data.client ? data.client.name : null;
      data.doer_name = data.doer ? data.doer.name : null;
    }
    return data;
  },
  createTask: async (task: any) => {
    const { data } = await supabase.from('tasks').insert([{
      title: task.title,
      client_id: task.client_id || null,
      doer_id: task.doer_id || null,
      remarks: task.remarks || "",
      frequency: task.frequency || "One Time",
      due_date_logic: task.due_date_logic ? JSON.stringify(task.due_date_logic) : "{}",
      due_date: task.due_date || null,
      status: task.status || "Not Started"
    }]).select('*').single();
    return data;
  },
  updateTaskStatus: async (id: number, status: string, completedAt: string | null) => {
    const { error } = await supabase.from('tasks').update({
      status,
      completed_at: completedAt,
      updated_at: new Date().toISOString()
    }).eq('id', id);
    return !error;
  },
  updateTaskAudit: async (id: number, status: string, auditStatus: string, auditRemarks: string) => {
    const { error } = await supabase.from('tasks').update({
      status,
      audit_status: auditStatus,
      audit_remarks: auditRemarks,
      updated_at: new Date().toISOString()
    }).eq('id', id);
    return !error;
  },
  logTaskHistory: async (taskId: number, userId: number | null, userName: string, action: string, details: string) => {
    const { error } = await supabase.from('task_history').insert([{
      task_id: taskId,
      user_id: userId,
      user_name: userName,
      action,
      details
    }]);
    return !error;
  },
  getTaskHistory: async (taskId: number) => {
    const { data } = await supabase.from('task_history').select('*').eq('task_id', taskId).order('created_at', { ascending: false });
    return data || [];
  }
};
