import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

// Placeholders for components
import Login from './pages/Login';
import Register from './pages/Register';
import CitizenDashboard from './pages/CitizenDashboard';
import FieldStaffDashboard from './pages/FieldStaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminComplaints from './pages/AdminComplaints';
import AdminFinancials from './pages/AdminFinancials';
import AdminUserDirectory from './pages/AdminUserDirectory';
import AdminKanban from './pages/AdminKanban';
import CitizenComplaints from './pages/CitizenComplaints';
import CitizenFinancials from './pages/CitizenFinancials';
import ServiceRequests from './pages/ServiceRequests';
import CitizenDirectory from './pages/CitizenDirectory';
import PublicDashboard from './pages/PublicDashboard';
import UpdatePassword from './pages/UpdatePassword';
import Layout from './components/Layout';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/public" element={<PublicDashboard />} />
        
        <Route path="/" element={<Layout />}>
          {/* Redirect root path based on user role or to login if not authenticated */}
          <Route index element={
            !user ? <Navigate to="/login" replace /> :
            user.role === 'admin' ? <Navigate to="/admin" replace /> :
            user.role === 'field_staff' ? <Navigate to="/staff" replace /> :
            <Navigate to="/dashboard" replace /> // Default for citizen or unhandled roles
          } />

          <Route path="dashboard" element={
            <ProtectedRoute allowedRoles={['citizen', 'pending_staff']}>
              <CitizenDashboard />
            </ProtectedRoute>
          } />

          <Route path="services" element={
            <ProtectedRoute allowedRoles={['citizen', 'field_staff', 'pending_staff']}>
              <ServiceRequests />
            </ProtectedRoute>
          } />

          <Route path="directory" element={
            <ProtectedRoute allowedRoles={['field_staff']}>
              <CitizenDirectory />
            </ProtectedRoute>
          } />

          <Route path="staff/*" element={
            <ProtectedRoute allowedRoles={['field_staff']}>
              <FieldStaffDashboard />
            </ProtectedRoute>
          } />

          <Route path="staff/complaints" element={
            <ProtectedRoute allowedRoles={['field_staff']}>
              <AdminComplaints />
            </ProtectedRoute>
          } />

          <Route path="staff/operations" element={
            <ProtectedRoute allowedRoles={['field_staff']}>
              <AdminKanban />
            </ProtectedRoute>
          } />

          <Route path="citizen/complaints" element={
            <ProtectedRoute allowedRoles={['citizen', 'pending_staff']}>
              <CitizenComplaints />
            </ProtectedRoute>
          } />

          <Route path="citizen/financials" element={
            <ProtectedRoute allowedRoles={['citizen', 'pending_staff']}>
              <CitizenFinancials />
            </ProtectedRoute>
          } />

          <Route path="admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="admin/complaints" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminComplaints />
            </ProtectedRoute>
          } />

          <Route path="admin/financials" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminFinancials />
            </ProtectedRoute>
          } />

          <Route path="admin/registry" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUserDirectory />
            </ProtectedRoute>
          } />

          <Route path="admin/operations" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminKanban />
            </ProtectedRoute>
          } />
        </Route>

        <Route path="/unauthorized" element={<div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
            <h1 className="text-4xl font-bold text-slate-800 mb-4">Access Denied</h1>
            <p className="text-slate-600 mb-8 max-w-md">You do not have permission to view this page. If you are pending staff approval, your account is limited until an administrator approves it.</p>
            <a href="/" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Return to Dashboard</a>
        </div>} />
        <Route path="*" element={<div className="min-h-screen flex items-center justify-center text-2xl font-bold text-slate-400">404 - Page Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
