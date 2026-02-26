import React from "react";
import { useAuth } from "../context/AuthContext";
import AdminDashboard from "./AdminDashboard";
import EmployeeDashboard from "./EmployeeDashboard";
import AuditorDashboard from "./AuditorDashboard";

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case "admin":
      return <AdminDashboard />;
    case "auditor":
      return <AuditorDashboard />;
    case "employee":
    default:
      return <EmployeeDashboard />;
  }
}
