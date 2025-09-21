import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Video, FileText, Clock } from 'lucide-react';
import VideoCall from '../common/VideoCall';
import PrescriptionForm from './PrescriptionForm';
import styles from './DoctorDashboard.module.css';

type DoctorView = 'dashboard' | 'queue' | 'consultation' | 'prescription' | 'history';

const DoctorDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { state: appState, addPrescription } = useApp();
  const { state: authState } = useAuth();
  const [currentView, setCurrentView] = useState<DoctorView>('dashboard');
  const [currentPatient, setCurrentPatient] = useState<any>(null);

  const doctorPrescriptions = appState.prescriptions.filter(
    p => p.doctorId === authState.user?.id
  );

  // Mock patient queue - in real app, this would come from backend
  const patientQueue = [
    { id: '1', name: 'John Doe', symptoms: 'Headache, fever', waitTime: 15 },
    { id: '2', name: 'Jane Smith', symptoms: 'Cough, cold', waitTime: 8 },
    { id: '3', name: 'Bob Johnson', symptoms: 'Stomach pain', waitTime: 3 }
  ];

  const handleStartConsultation = (patient: any) => {
    setCurrentPatient(patient);
    setCurrentView('consultation');
  };

  const handleConsultationEnd = () => {
    setCurrentView('prescription');
  };

  const handlePrescriptionSubmit = async (prescriptionData: any) => {
    await addPrescription({
      patientId: currentPatient.id,
      patientName: currentPatient.name,
      doctorId: authState.user!.id,
      doctorName: authState.user!.name,
      date: new Date().toISOString().split('T')[0],
      ...prescriptionData
    });
    
    setCurrentPatient(null);
    setCurrentView('dashboard');
  };

  const renderDashboard = () => (
    <div className={styles.dashboard}>
      <div className={styles.welcomeCard}>
        <h2>Dr. {authState.user?.name}</h2>
        <p>Doctor Dashboard</p>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statNumber}>{patientQueue.length}</span>
            <span className={styles.statLabel}>Waiting Patients</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>{doctorPrescriptions.length}</span>
            <span className={styles.statLabel}>Total Prescriptions</span>
          </div>
        </div>
      </div>

      <div className="grid grid-3">
        <div className={`card ${styles.actionCard}`} onClick={() => setCurrentView('queue')}>
          <div className={styles.cardIcon}>
            <Users size={32} />
          </div>
          <h3>{t('patientQueue')}</h3>
          <p>View and manage waiting patients</p>
          {patientQueue.length > 0 && (
            <div className="badge badge-info">
              {patientQueue.length} waiting
            </div>
          )}
        </div>

        <div className={`card ${styles.actionCard}`} onClick={() => setCurrentView('consultation')}>
          <div className={styles.cardIcon}>
            <Video size={32} />
          </div>
          <h3>{t('consultScreen')}</h3>
          <p>Start video consultation with patient</p>
        </div>

        <div className={`card ${styles.actionCard}`} onClick={() => setCurrentView('history')}>
          <div className={styles.cardIcon}>
            <FileText size={32} />
          </div>
          <h3>{t('prescriptionHistory')}</h3>
          <p>View past prescriptions and patient history</p>
        </div>
      </div>

      {patientQueue.length > 0 && (
        <div className={styles.queuePreview}>
          <h3>Next Patients</h3>
          <div className="grid grid-2">
            {patientQueue.slice(0, 2).map(patient => (
              <div key={patient.id} className="card">
                <div className={styles.patientCard}>
                  <div className={styles.patientInfo}>
                    <h4>{patient.name}</h4>
                    <p>Symptoms: {patient.symptoms}</p>
                    <div className={styles.waitTime}>
                      <Clock size={16} />
                      <span>Waiting: {patient.waitTime} min</span>
                    </div>
                  </div>
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleStartConsultation(patient)}
                  >
                    Start Consultation
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderQueue = () => (
    <div className={styles.queueView}>
      <div className={styles.viewHeader}>
        <h2>{t('patientQueue')}</h2>
        <button className="btn btn-outline" onClick={() => setCurrentView('dashboard')}>
          {t('back')}
        </button>
      </div>

      {patientQueue.length === 0 ? (
        <div className={styles.emptyState}>
          <Users size={48} />
          <h3>No patients in queue</h3>
          <p>Patients will appear here when they join the consultation queue</p>
        </div>
      ) : (
        <div className="grid grid-2">
          {patientQueue.map(patient => (
            <div key={patient.id} className="card">
              <div className={styles.patientCard}>
                <div className={styles.patientInfo}>
                  <h4>{patient.name}</h4>
                  <p><strong>Symptoms:</strong> {patient.symptoms}</p>
                  <div className={styles.waitTime}>
                    <Clock size={16} />
                    <span>Waiting: {patient.waitTime} minutes</span>
                  </div>
                </div>
                <div className={styles.patientActions}>
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleStartConsultation(patient)}
                  >
                    Start Consultation
                  </button>
                  <button className="btn btn-outline">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderHistory = () => (
    <div className={styles.historyView}>
      <div className={styles.viewHeader}>
        <h2>{t('prescriptionHistory')}</h2>
        <div className={styles.headerActions}>
          <button 
            className="btn btn-primary"
            onClick={() => setCurrentView('prescription')}
          >
            Create New Prescription
          </button>
          <button className="btn btn-outline" onClick={() => setCurrentView('dashboard')}>
            {t('back')}
          </button>
        </div>
      </div>

      {doctorPrescriptions.length === 0 ? (
        <div className={styles.emptyState}>
          <FileText size={48} />
          <h3>No prescription history</h3>
          <p>Prescriptions you create will appear here</p>
        </div>
      ) : (
        <div className="grid grid-2">
          {doctorPrescriptions.map(prescription => (
            <div key={prescription.id} className="card">
              <div className={styles.prescriptionCard}>
                <div className={styles.prescriptionHeader}>
                  <h4>Prescription #{prescription.id.slice(-6)}</h4>
                  <span className={styles.date}>
                    {prescription.createdAt ? new Date(prescription.createdAt).toLocaleDateString() : 'Unknown'}
                  </span>
                </div>
                <p><strong>Diagnosis:</strong> {prescription.diagnosis}</p>
                <p><strong>Medications:</strong> {prescription.medications.length}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="container">
      {currentView === 'dashboard' && renderDashboard()}
      {currentView === 'queue' && renderQueue()}
      {currentView === 'consultation' && currentPatient && (
        <VideoCall
          consultationData={currentPatient}
          onEnd={handleConsultationEnd}
          userRole="doctor"
        />
      )}
      {currentView === 'prescription' && currentPatient && (
        <PrescriptionForm
          patientData={currentPatient}
          onSubmit={handlePrescriptionSubmit}
          onCancel={() => {
            setCurrentPatient(null);
            setCurrentView('dashboard');
          }}
        />
      )}
      {currentView === 'prescription' && !currentPatient && (
        <PrescriptionForm
          patientData={{ id: 'manual-entry', name: 'Manual Entry' }}
          onSubmit={handlePrescriptionSubmit}
          onCancel={() => setCurrentView('history')}
        />
      )}
      {currentView === 'history' && renderHistory()}
    </div>
  );
};

export default DoctorDashboard;