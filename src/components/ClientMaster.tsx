import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, X } from "lucide-react";
import { clsx } from "clsx";

interface Client {
  id: number;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  services: string;
  created_at: string;
}

const AVAILABLE_SERVICES = [
  "Audit & Assurance",
  "Tax Advisory",
  "Accounting & Bookkeeping",
  "Corporate Compliance",
  "Financial Consulting",
];

export default function ClientMaster() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    services: [] as string[],
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/clients");
      if (!res.ok) throw new Error("Failed to fetch clients");
      const data = await res.json();
      setClients(data);
    } catch (error) {
      console.error(error);
      // In a real app, show a toast notification
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      let parsedServices: string[] = [];
      try {
        parsedServices = JSON.parse(client.services);
      } catch (e) {
        parsedServices = client.services ? client.services.split(",") : [];
      }
      setFormData({
        name: client.name || "",
        contact_person: client.contact_person || "",
        email: client.email || "",
        phone: client.phone || "",
        services: parsedServices,
      });
    } else {
      setEditingClient(null);
      setFormData({
        name: "",
        contact_person: "",
        email: "",
        phone: "",
        services: [],
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const handleServiceToggle = (service: string) => {
    setFormData((prev) => {
      const services = prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service];
      return { ...prev, services };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingClient ? `/api/clients/${editingClient.id}` : "/api/clients";
      const method = editingClient ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to save client");
      }

      await fetchClients();
      handleCloseModal();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "An error occurred");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this client?")) return;
    try {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete client");
      await fetchClients();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.contact_person?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Client Master</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your organization's clients and their subscribed services.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-colors select-none"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
              placeholder="Search clients by name, contact, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Client Details
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Contact Info
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Subscribed Services
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-500">
                    Loading clients...
                  </td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-500">
                    No clients found matching your search.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  let services: string[] = [];
                  try {
                    services = JSON.parse(client.services);
                  } catch (e) {
                    services = client.services ? client.services.split(",") : [];
                  }

                  return (
                    <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-700 font-medium text-sm">
                              {client.name.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900">{client.name}</div>
                            <div className="text-sm text-slate-500">Added {new Date(client.created_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">{client.contact_person || "N/A"}</div>
                        <div className="text-sm text-slate-500">{client.email || "No email"}</div>
                        <div className="text-sm text-slate-500">{client.phone || "No phone"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {services.length > 0 ? (
                            services.map((service, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800"
                              >
                                {service}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-slate-500 italic">No services</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleOpenModal(client)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4 transition-colors select-none"
                        >
                          <Edit2 className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="text-red-600 hover:text-red-900 transition-colors select-none"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black/50 transition-opacity z-40" aria-hidden="true" onClick={handleCloseModal}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="relative inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full z-50">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg leading-6 font-medium text-slate-900" id="modal-title">
                        {editingClient ? "Edit Client" : "Add New Client"}
                      </h3>
                      <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-500">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                          Client Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="contact_person" className="block text-sm font-medium text-slate-700">
                          Contact Person
                        </label>
                        <input
                          type="text"
                          name="contact_person"
                          id="contact_person"
                          value={formData.contact_person}
                          onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                          className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                            Email Address
                          </label>
                          <input
                            type="email"
                            name="email"
                            id="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
                            Phone Number
                          </label>
                          <input
                            type="text"
                            name="phone"
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Subscribed Services
                        </label>
                        <div className="space-y-2 max-h-48 overflow-y-auto p-2 border border-slate-200 rounded-md bg-slate-50">
                          {AVAILABLE_SERVICES.map((service) => (
                            <div key={service} className="flex items-start">
                              <div className="flex items-center h-5">
                                <input
                                  id={`service-${service}`}
                                  name={`service-${service}`}
                                  type="checkbox"
                                  checked={formData.services.includes(service)}
                                  onChange={() => handleServiceToggle(service)}
                                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-slate-300 rounded"
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <label htmlFor={`service-${service}`} className="font-medium text-slate-700 cursor-pointer">
                                  {service}
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse border-t border-slate-200 pt-4">
                        <button
                          type="submit"
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm select-none"
                        >
                          {editingClient ? "Save Changes" : "Add Client"}
                        </button>
                        <button
                          type="button"
                          onClick={handleCloseModal}
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
