/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import ClientMaster from "./components/ClientMaster";
import TaskCreation from "./components/TaskCreation";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import Dashboard from "./components/Dashboard";
import Settings from "./components/Settings";
import About from "./components/About";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="clients" element={<ProtectedRoute allowedRoles={['admin']}><ClientMaster /></ProtectedRoute>} />
            <Route path="tasks" element={<ProtectedRoute allowedRoles={['admin']}><TaskCreation /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="about" element={<ProtectedRoute><About /></ProtectedRoute>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
