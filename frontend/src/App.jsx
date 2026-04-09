import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import the Theme Context Provider
import { ThemeProvider } from './context/ThemeContext';

// Import the 4 Core Root Pages
// import DoctorPortal from './pages/DoctorPortal';
// import PatientDashboard from './pages/PatientPortal';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';

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
          <Route path="/patient-dashboard" element={<PatientDashboard />} />

          {/* Fallback Route: Catch any broken/unknown links and send them back to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;