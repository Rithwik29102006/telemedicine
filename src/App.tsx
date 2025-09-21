import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { LocationProvider } from './contexts/LocationContext';
import Header from './components/Layout/Header';
import AuthForm from './components/Auth/AuthForm';
import PatientDashboard from './components/Patient/PatientDashboard';
import CHWDashboard from './components/CHW/CHWDashboard';
import DoctorDashboard from './components/Doctor/DoctorDashboard';
import PharmacyDashboard from './components/Pharmacy/PharmacyDashboard';
import AdminDashboard from './components/Admin/AdminDashboard';
import AccessibilitySettings from './components/Accessibility/AccessibilitySettings';
import './styles/global.css';

const AppContent: React.FC = () => {
  const { state } = useAuth();

  if (!state.user) {
    return <AuthForm />;
  }

  const getDashboard = () => {
    switch (state.user?.role) {
      case 'patient':
        return <PatientDashboard />;
      case 'chw':
        return <CHWDashboard />;
      case 'doctor':
        return <DoctorDashboard />;
      case 'pharmacy':
        return <PharmacyDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <Navigate to="/auth" replace />;
    }
  };

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/settings" element={<AccessibilitySettings />} />
          <Route path="/*" element={getDashboard()} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <AccessibilityProvider>
        <LocationProvider>
          <AuthProvider>
            <AppProvider>
              <Router>
                <Routes>
                  <Route path="/*" element={<AppContent />} />
                </Routes>
              </Router>
            </AppProvider>
          </AuthProvider>
        </LocationProvider>
      </AccessibilityProvider>
    </I18nextProvider>
  );
};

export default App;