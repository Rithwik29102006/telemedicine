import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus, Stethoscope, RefreshCw } from 'lucide-react';
import PatientRegistrationForm from './PatientRegistrationForm';
import styles from './CHWDashboard.module.css';

type CHWView = 'dashboard' | 'register' | 'assist' | 'sync';

const CHWDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { state: appState, syncData } = useApp();
  const { state: authState } = useAuth();
  const [currentView, setCurrentView] = useState<CHWView>('dashboard');
  const [isSyncing, setIsSyncing] = useState(false);

  const registeredPatients = appState.patients.filter(
    p => p.registeredBy === authState.user?.id
  );

  const handleSync = async () => {
    setIsSyncing(true);
    await syncData();
    setIsSyncing(false);
  };

  const renderDashboard = () => (
    <div className={styles.dashboard}>
      <div className={styles.welcomeCard}>
        <h2>Welcome, {authState.user?.name}</h2>
        <p>Community Health Worker Dashboard</p>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statNumber}>{registeredPatients.length}</span>
            <span className={styles.statLabel}>Registered Patients</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>{appState.pendingSync.length}</span>
            <span className={styles.statLabel}>Pending Sync</span>
          </div>
        </div>
      </div>

      <div className="grid grid-3">
        <div className={`card ${styles.actionCard}`} onClick={() => setCurrentView('register')}>
          <div className={styles.cardIcon}>
            <UserPlus size={32} />
          </div>
          <h3>{t('registerPatient')}</h3>
          <p>Register new patients for healthcare services</p>
        </div>

        <div className={`card ${styles.actionCard}`} onClick={() => setCurrentView('assist')}>
          <div className={styles.cardIcon}>
            <Stethoscope size={32} />
          </div>
          <h3>{t('assistConsult')}</h3>
          <p>Assist patients with doctor consultations</p>
        </div>

        <div className={`card ${styles.actionCard}`} onClick={handleSync}>
          <div className={styles.cardIcon}>
            <RefreshCw size={32} className={isSyncing ? styles.spinning : ''} />
          </div>
          <h3>{t('sync')}</h3>
          <p>Sync data with central server</p>
          {appState.pendingSync.length > 0 && (
            <div className="badge badge-warning">
              {appState.pendingSync.length} pending
            </div>
          )}
        </div>
      </div>

      {registeredPatients.length > 0 && (
        <div className={styles.patientsSection}>
          <h3>Your Registered Patients</h3>
          <div className="grid grid-2">
            {registeredPatients.map(patient => (
              <div key={patient.id} className="card">
                <div className={styles.patientCard}>
                  <div className={styles.patientInfo}>
                    <h4>{patient.name}</h4>
                    <p>Age: {patient.age} | Gender: {patient.gender}</p>
                    <p>Phone: {patient.phone}</p>
                    <p className={styles.registrationDate}>
                      Registered: {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                  <div className={styles.patientActions}>
                    <button className="btn btn-primary btn-sm">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="container">
      {currentView === 'dashboard' && renderDashboard()}
      {currentView === 'register' && (
        <PatientRegistrationForm 
          onBack={() => setCurrentView('dashboard')}
          onSuccess={() => setCurrentView('dashboard')}
        />
      )}
      {currentView === 'assist' && (
        <div className={styles.assistView}>
          <h2>Assist Consultation</h2>
          <p>Help patients connect with doctors for medical consultations.</p>
          <button className="btn btn-outline" onClick={() => setCurrentView('dashboard')}>
            {t('back')}
          </button>
        </div>
      )}
    </div>
  );
};

export default CHWDashboard;