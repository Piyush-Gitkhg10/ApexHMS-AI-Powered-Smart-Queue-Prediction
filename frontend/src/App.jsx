import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import the Theme Context Provider
import { ThemeProvider } from './context/ThemeContext';

// Import the 4 Core Root Pages
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
// import DoctorPortal from './pages/DoctorPortal';
import PatientPortal from './pages/PatientPortal';
import DoctorDashboard from './pages/DoctorDashboard';

const App = () => {
  return (
    // Wrap the entire app in the ThemeProvider so dark mode works everywhere
    <ThemeProvider>
      <Router>
        <Routes>

          {/* Default Route: Redirect anyone visiting the root URL straight to Login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Authentication */}
          <Route path="/login" element={<Login />} />

          {/* Role-Based Dashboards */}
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/patient-portal" element={<PatientPortal />} />

          {/* Fallback Route: Catch any broken/unknown links and send them back to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;