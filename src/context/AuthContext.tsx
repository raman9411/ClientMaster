import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  dbError: string | null;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");

        if (res.status === 503) {
          const errorData = await res.json();
          setDbError(errorData.message || "Database connection failed.");
          return;
        }

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error("Failed to fetch user", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
    } catch (error) {
      console.error("Failed to logout", error);
    }
  };

  if (dbError) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden border border-red-100 p-8">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-center text-2xl font-bold text-slate-900 mb-2">System Unavailable</h2>
          <p className="text-center text-slate-600 mb-8">{dbError}</p>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-800 mb-2">Troubleshooting Steps:</h3>
            <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
              <li>Check your <code>.env</code> file configuration.</li>
              <li>Verify the <code>DB_PATH</code> parameter exists and points to a valid file.</li>
              <li>Ensure the server process has read/write permissions for the directory.</li>
              <li>Restart the application server.</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, dbError, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
