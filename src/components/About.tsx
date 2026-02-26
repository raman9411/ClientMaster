import React from "react";
import { BookOpen, Shield, Users, CheckSquare, Settings, LayoutDashboard, Fingerprint, Lock, Zap } from "lucide-react";

export default function About() {
    return (
        <div className="max-w-5xl mx-auto py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
                    Documentation & Usage Guide
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-500">
                    Everything you need to know about navigating and utilizing the ClientMaster system effectively.
                </p>
            </div>

            <div className="space-y-16">
                {/* Core Architecture */}
                <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                        <Zap className="w-6 h-6 mr-3 text-indigo-500" />
                        Core Capabilities
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-4 border border-indigo-100">
                                <LayoutDashboard className="w-6 h-6 text-indigo-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Centralized Dashboard</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Your command center. View upcoming deadlines, overdue tasks, and high-level client insights. Real-time metrics help admins and auditors track organizational health effortlessly.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4 border border-blue-100">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Client Master</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Maintain a unified database of all clients. Store primary contact details, track service portfolios, and ensure up-to-date compliance records without the friction of spreadsheets.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-4 border border-emerald-100">
                                <CheckSquare className="w-6 h-6 text-emerald-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Task Execution Engine</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Assign recurring duties to employees. Define precise due date logic (e.g., "15th of next month"). Includes built-in workflows for internal audits and multi-stage sign-offs.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mb-4 border border-purple-100">
                                <Settings className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Role & Access Control</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Granular security through Settings. Add new Doers (employees), configure notifications, or upgrade privileges instantly. Designed explicitly around the Principle of Least Privilege.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Roles & Security */}
                <section className="bg-slate-900 rounded-3xl p-8 lg:p-12 overflow-hidden relative">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-3xl mix-blend-screen" />

                    <h2 className="text-2xl font-bold text-white mb-8 flex items-center relative z-10">
                        <Shield className="w-6 h-6 mr-3 text-indigo-400" />
                        Security & Permission Hierarchy
                    </h2>

                    <div className="space-y-6 relative z-10">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 text-indigo-300 font-bold text-sm">
                                A
                            </div>
                            <div className="ml-4">
                                <h4 className="text-lg font-semibold text-white">Administrator</h4>
                                <p className="mt-1 text-slate-400">Total system control. Can create clients, issue new tasks, add/remove system users, and oversee the entire firm's workflow velocity.</p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 text-blue-300 font-bold text-sm">
                                E
                            </div>
                            <div className="ml-4">
                                <h4 className="text-lg font-semibold text-white">Employee (The "Doer")</h4>
                                <p className="mt-1 text-slate-400">Task executors. They receive assignments, update statuses, attach artifacts/remarks upon task completion, and pass items forward for auditing.</p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30 text-amber-300 font-bold text-sm">
                                R
                            </div>
                            <div className="ml-4">
                                <h4 className="text-lg font-semibold text-white">Auditor</h4>
                                <p className="mt-1 text-slate-400">Quality assurance. They review completed workflows, approve final deliverables, or reject them with remarks back to the assigned doer.</p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 text-emerald-300 font-bold text-sm">
                                C
                            </div>
                            <div className="ml-4">
                                <h4 className="text-lg font-semibold text-white">Client</h4>
                                <p className="mt-1 text-slate-400">Read-only transparency portals. Can track the immediate status of their own relevant filings and tasks without penetrating the firm's internal data.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Technical Architecture */}
                <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                        <Fingerprint className="w-6 h-6 mr-3 text-indigo-500" />
                        Under the Hood
                    </h2>
                    <div className="prose prose-slate prose-lg max-w-none text-slate-600">
                        <p>
                            ClientMaster is built as a highly robust, modern Single Page Application (SPA). The frontend is powered by <strong>Vite, React 19, and Tailwind CSS v4</strong> ensuring sub-millisecond route transitions and a buttery-smooth, responsive user interface. Local client state is maintained efficiently via context providers.
                        </p>
                        <p>
                            On the backend, an embedded <strong>Express API server</strong> leverages a high-performance <strong>Better-SQLite3</strong> database engine. This prevents overhead commonly associated with external database latency while maintaining ACID compliance for all complex relational mappings (Users ↔ Clients ↔ Tasks). Passwords are cryptographically hashed using <strong>bcrypt</strong> before DB insertion, ensuring military-grade credential storage natively.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
