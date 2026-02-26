import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Shield, Bell, Check, Users, Save, Loader2, Mail, MessageSquare, Smartphone, Plus, Trash2, X } from "lucide-react";

export default function Settings() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const [users, setUsers] = useState<any[]>([]);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'employee' });
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const [toggles, setToggles] = useState({
        email: true,
        sms: false,
        inApp: true,
        whatsapp: false
    });

    useEffect(() => {
        if (isAdmin) {
            fetchUsers();
        }
    }, [isAdmin]);

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/users");
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        }
    };

    const updateRole = async (id: number, role: string) => {
        try {
            const res = await fetch(`/api/users/${id}/role`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role })
            });
            if (res.ok) {
                fetchUsers();
            }
        } catch (error) {
            console.error("Failed to update role", error);
        }
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAddingUser(true);
        setErrorMsg('');
        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newUser)
            });
            if (res.ok) {
                setIsAddModalOpen(false);
                setNewUser({ name: '', email: '', password: '', role: 'employee' });
                fetchUsers();
            } else {
                const data = await res.json();
                setErrorMsg(data.error || 'Failed to add user');
            }
        } catch (error) {
            setErrorMsg('An error occurred');
        } finally {
            setIsAddingUser(false);
        }
    };

    const deleteUser = async (id: number) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            const res = await fetch(`/api/users/${id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                fetchUsers();
            }
        } catch (error) {
            console.error("Failed to delete user", error);
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings</h1>
                <p className="mt-1 text-sm text-slate-500">Manage your preferences and system configuration.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Profile & Notifications */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Profile Summary */}
                    <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                            <Shield className="w-5 h-5 mr-2 text-indigo-500" />
                            My Profile
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Name</p>
                                <p className="text-base text-slate-900">{user?.name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Email</p>
                                <p className="text-base text-slate-900">{user?.email}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Role</p>
                                <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 capitalize">
                                    {user?.role}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                            <Bell className="w-5 h-5 mr-2 text-indigo-500" />
                            Automated Reminders
                        </h2>
                        <p className="text-sm text-slate-500 mb-6">Visual toggle only for demonstration</p>

                        <div className="space-y-4">
                            {[
                                { id: 'email', label: 'Email Notifications', icon: Mail },
                                { id: 'sms', label: 'SMS Alerts', icon: Smartphone },
                                { id: 'inApp', label: 'In-App Alerts', icon: Bell },
                                { id: 'whatsapp', label: 'WhatsApp Messages', icon: MessageSquare }
                            ].map((item) => (
                                <div key={item.id} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <item.icon className="w-5 h-5 text-slate-400 mr-3" />
                                        <span className="text-sm font-medium text-slate-700">{item.label}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setToggles({ ...toggles, [item.id]: !toggles[item.id as keyof typeof toggles] })}
                                        className={`${toggles[item.id as keyof typeof toggles] ? 'bg-indigo-600' : 'bg-slate-200'
                                            } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                                    >
                                        <span
                                            className={`${toggles[item.id as keyof typeof toggles] ? 'translate-x-5' : 'translate-x-0'
                                                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                                        />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column - Admin User Management */}
                {isAdmin && (
                    <div className="lg:col-span-2">
                        <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
                            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                                    <Users className="w-5 h-5 mr-2 text-indigo-500" />
                                    Staff & User Management
                                </h2>
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add User
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-white">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {users.map((u) => (
                                            <tr key={u.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{u.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{u.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 capitalize">
                                                    <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                        u.role === 'auditor' ? 'bg-amber-100 text-amber-800' :
                                                            u.role === 'client' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-emerald-100 text-emerald-800'
                                                        }`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <select
                                                            className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 inline-block w-32 p-1.5"
                                                            value={u.role}
                                                            onChange={(e) => updateRole(u.id, e.target.value)}
                                                            disabled={u.id === user.id}
                                                        >
                                                            <option value="admin">Admin</option>
                                                            <option value="employee">Employee</option>
                                                            <option value="auditor">Auditor</option>
                                                            <option value="client">Client</option>
                                                        </select>
                                                        <button
                                                            onClick={() => deleteUser(u.id)}
                                                            disabled={u.id === user.id}
                                                            className={`p-2 rounded-lg transition-colors ${u.id === user.id ? 'text-slate-300 cursor-not-allowed' : 'text-rose-600 hover:bg-rose-50'}`}
                                                            title={u.id === user.id ? "Cannot delete yourself" : "Delete user"}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add User Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={() => setIsAddModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="relative z-10 inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                            <form onSubmit={handleAddUser}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="flex justify-between items-center mb-5">
                                        <h3 className="text-lg leading-6 font-semibold text-slate-900" id="modal-title">
                                            Add New User
                                        </h3>
                                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {errorMsg && (
                                            <div className="p-3 bg-rose-50 text-rose-700 rounded-lg text-sm">
                                                {errorMsg}
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={newUser.name}
                                                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="e.g. Jane Doe"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                            <input
                                                type="email"
                                                required
                                                value={newUser.email}
                                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="e.g. jane@company.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                            <input
                                                type="password"
                                                required
                                                value={newUser.password}
                                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                                            <select
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                                value={newUser.role}
                                                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                            >
                                                <option value="employee">Employee</option>
                                                <option value="admin">Admin</option>
                                                <option value="auditor">Auditor</option>
                                                <option value="client">Client</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-slate-200">
                                    <button
                                        type="submit"
                                        disabled={isAddingUser}
                                        className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isAddingUser ? <Loader2 className="w-5 h-5 animate-spin" /> : "Add User"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="mt-3 w-full inline-flex justify-center rounded-lg border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
