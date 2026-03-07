import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import VoiceWidget from './components/VoiceWidget/VoiceWidget';
import HomePage from './pages/HomePage';
import PatientLogin from './pages/patientlogin';
import PatientRegister from './pages/PatientRegister';
import DoctorLogin from './pages/doctorloginpage';
import DoctorRegister from './pages/doctorregisterpage';

const queryClient = new QueryClient();

const getUser  = () => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } };
const logout   = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); };

function App() {
  const [page, setPage] = useState('home');
  const [user, setUser] = useState(getUser());

  useEffect(() => {
    const sync = () => setUser(getUser());
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const handleAuthSuccess = (u) => {
    setUser(u);
    setPage('home');
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setPage('home');
  };

  const renderPage = () => {
    switch (page) {
      case 'patient-login':
        return (
          <PatientLogin
            onSuccess={handleAuthSuccess}
            onSwitchToRegister={() => setPage('patient-register')}
            onSwitchToDoctor={() => setPage('doctor-login')}
          />
        );
      case 'patient-register':
        return (
          <PatientRegister
            onSuccess={handleAuthSuccess}
            onSwitchToLogin={() => setPage('patient-login')}
          />
        );
      case 'doctor-login':
        return (
          <DoctorLogin
            onSuccess={handleAuthSuccess}
            onSwitchToPatient={() => setPage('patient-login')}
            onSwitchToRegister={() => setPage('doctor-register')}  // ← added
          />
        );
      case 'doctor-register':
        return (
          <DoctorRegister
            onSuccess={handleAuthSuccess}
            onSwitchToLogin={() => setPage('doctor-login')}  // ← was 'doctor-register' (bug)
          />
        );
      default:
        return (
          <HomePage
            user={user}
            onLogin={() => setPage('patient-login')}
            onRegister={() => setPage('patient-register')}
            onDoctorLogin={() => setPage('doctor-login')}
            onLogout={handleLogout}
          />
        );
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        {renderPage()}
        {page === 'home' && <VoiceWidget user={user} />}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { background: '#363636', color: '#fff' },
          }}
        />
      </div>
    </QueryClientProvider>
  );
}

export default App;