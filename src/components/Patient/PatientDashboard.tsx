import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { useLocation } from '../../contexts/LocationContext';
import { Stethoscope, FileText, User, Settings, Clock, MapPin } from 'lucide-react';
import ConsultationForm from './ConsultationForm';
import VideoCall from '../common/VideoCall';
import PrescriptionView from '../common/PrescriptionView';
import ReminderList from './ReminderList';
import PrescriptionHistory from './PrescriptionHistory';
import VoiceNavigation from '../Accessibility/VoiceNavigation';
import EmergencyButton from '../Accessibility/EmergencyButton';
import ConsentPopup from '../Location/ConsentPopup';
import styles from './PatientDashboard.module.css';

type PatientView = 'dashboard' | 'consult' | 'consultation' | 'prescriptions' | 'records' | 'reminders' | 'history';

const PatientDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { state: appState } = useApp();
  const { state: authState } = useAuth();
  const { state: accessibilityState } = useAccessibility();
  const { state: locationState } = useLocation();
  const [currentView, setCurrentView] = useState<PatientView>('dashboard');
  const [consultationData, setConsultationData] = useState<any>(null);
  const [showConsentPopup, setShowConsentPopup] = useState(false);
  const [showLocationInfo, setShowLocationInfo] = useState(false);

  const patientPrescriptions = appState.prescriptions.filter(
    p => p.patientId === authState.user?.id
  );

  const handleStartConsultation = (data: any) => {
    setConsultationData(data);
    setCurrentView('consultation');
  };

  const handleConsultationEnd = (prescription: any) => {
    if (prescription) {
      setCurrentView('prescriptions');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleEmergencyClick = () => {
    if (!locationState.hasConsent) {
      setShowConsentPopup(true);
    }
    // Emergency logic will be handled by the EmergencyButton component
  };

  const handleLocationClick = () => {
    if (!locationState.hasConsent) {
      setShowConsentPopup(true);
    } else {
      setShowLocationInfo(true);
    }
  };

  const getLocationDisplay = () => {
    if (!locationState.locationData) return 'Not Set';
    
    if (locationState.locationData.type === 'coordinates') {
      return `${locationState.locationData.coordinates?.latitude.toFixed(4)}, ${locationState.locationData.coordinates?.longitude.toFixed(4)}`;
    } else if (locationState.locationData.type === 'village') {
      return `${locationState.locationData.village?.name}, ${locationState.locationData.village?.district}`;
    }
    
    return 'Not Set';
  };

  const renderDashboard = () => (
    <div className={styles.dashboard}>
      <div className={styles.accessibilityControls}>
        <Link 
          to="/settings" 
          className="btn btn-outline btn-sm"
          title="Accessibility Settings"
          aria-label="Open accessibility settings"
        >
          <Settings size={16} />
          Accessibility Settings
        </Link>
        
        <EmergencyButton onClick={handleEmergencyClick} />
        
        <button 
          className="btn btn-primary btn-sm"
          onClick={() => setCurrentView('reminders')}
          aria-label="View and manage medicine reminders"
        >
          <Clock size={16} />
          View Reminders
        </button>
        
        <button 
          className="btn btn-outline btn-sm"
          onClick={handleLocationClick}
          aria-label="View and manage location settings"
        >
          <MapPin size={16} />
          Location: {getLocationDisplay()}
        </button>
      </div>

      <div className={styles.welcomeCard}>
        <h2>{t('welcomeBack')}, {authState.user?.name}!</h2>
        <p>Manage your health consultations and prescriptions</p>
      </div>

      <div className="grid grid-3">
        <div className={`card ${styles.actionCard}`} onClick={() => setCurrentView('consult')}>
          <div className={styles.cardIcon}>
            <Stethoscope size={32} />
          </div>
          <h3>{t('consultDoctor')}</h3>
          <p>Connect with a doctor for medical consultation</p>
        </div>

        <div className={`card ${styles.actionCard}`} onClick={() => setCurrentView('prescriptions')}>
          <div className={styles.cardIcon}>
            <FileText size={32} />
          </div>
          <h3>{t('myPrescriptions')}</h3>
          <p>View and download your prescriptions</p>
          {patientPrescriptions.length > 0 && (
            <div className="badge badge-info">
              {patientPrescriptions.length} active
            </div>
          )}
        </div>

        <div className={`card ${styles.actionCard}`} onClick={() => setCurrentView('records')}>
          <div className={styles.cardIcon}>
            <User size={32} />
          </div>
          <h3>{t('myRecords')}</h3>
          <p>Access your medical history and records</p>
        </div>
        
        <div className={`card ${styles.actionCard}`} onClick={() => setCurrentView('history')}>
          <div className={styles.cardIcon}>
            <FileText size={32} />
          </div>
          <h3>Medical Reports</h3>
          <p>View detailed prescription history and medical reports</p>
          {patientPrescriptions.length > 0 && (
            <div className="badge badge-success">
              {patientPrescriptions.length} reports
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderPrescriptions = () => (
    <div className={styles.prescriptionsView}>
      <div className={styles.viewHeader}>
        <h2>{t('myPrescriptions')}</h2>
        <button className="btn btn-outline" onClick={() => setCurrentView('dashboard')}>
          {t('back')}
        </button>
      </div>

      {patientPrescriptions.length === 0 ? (
        <div className={styles.emptyState}>
          <FileText size={48} />
          <h3>No prescriptions found</h3>
          <p>Start a consultation with a doctor to get prescriptions</p>
          <button className="btn btn-primary" onClick={() => setCurrentView('consult')}>
            {t('consultDoctor')}
          </button>
        </div>
      ) : (
        <div className="grid grid-2">
          {patientPrescriptions.map(prescription => (
            <PrescriptionView 
              key={prescription.id} 
              prescription={prescription} 
              showReminderButton={true}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderRecords = () => (
    <div className={styles.recordsView}>
      <div className={styles.viewHeader}>
        <h2>{t('myRecords')}</h2>
        <button className="btn btn-outline" onClick={() => setCurrentView('dashboard')}>
          {t('back')}
        </button>
      </div>

      <div className="card">
        <div className={styles.recordsContent}>
          <h3>Personal Information</h3>
          <div className={styles.recordItem}>
            <strong>Name:</strong> {authState.user?.name}
          </div>
          <div className={styles.recordItem}>
            <strong>Email:</strong> {authState.user?.email}
          </div>
          <div className={styles.recordItem}>
            <strong>Phone:</strong> {authState.user?.phone}
          </div>
          <div className={styles.recordItem}>
            <strong>Last consultation:</strong> {patientPrescriptions.length > 0 ? 
            (patientPrescriptions[0].createdAt ? new Date(patientPrescriptions[0].createdAt).toLocaleDateString() : 'Unknown') : 'None'}
          </div>
        </div>
      </div>

      <div className="card">
        <div className={styles.recordsContent}>
          <h3>Consultation History</h3>
          <div className={styles.recordItem}>
            <strong>Total consultations:</strong> {patientPrescriptions.length}
          </div>
          <div className={styles.recordItem}>
            <strong>Last consultation:</strong> {patientPrescriptions.length > 0 ? 
            (patientPrescriptions[0].createdAt ? new Date(patientPrescriptions[0].createdAt).toLocaleDateString() : 'Unknown') : 'None'}
          </div>
        </div>
      </div>

      {showReminders && (
        <div className="card">
          <div style={{ padding: '1rem' }}>
            <h3>Medicine Reminders</h3>
            <p>Reminder management will be shown here.</p>
            <button 
              className="btn btn-outline"
              onClick={() => setShowReminders(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderReminders = () => (
    <div className={styles.remindersView}>
      <div className={styles.viewHeader}>
        <button className="btn btn-outline" onClick={() => setCurrentView('dashboard')}>
          {t('back')}
        </button>
      </div>
      <ReminderList />
    </div>
  );
  
  const renderHistory = () => (
    <div className={styles.historyView}>
      <PrescriptionHistory onBack={() => setCurrentView('dashboard')} />
    </div>
  );

  return (
    <div className="container">
      {accessibilityState.settings.isEnabled && <VoiceNavigation />}
      
      {currentView === 'dashboard' && renderDashboard()}
      {currentView === 'consult' && (
        <ConsultationForm 
          onBack={() => setCurrentView('dashboard')}
          onStartConsultation={handleStartConsultation}
        />
      )}
      {currentView === 'consultation' && (
        <VideoCall 
          consultationData={consultationData}
          onEnd={handleConsultationEnd}
          userRole="patient"
        />
      )}
      {currentView === 'prescriptions' && renderPrescriptions()}
      {currentView === 'records' && renderRecords()}
      {currentView === 'reminders' && renderReminders()}
      {currentView === 'history' && renderHistory()}
      
      {showConsentPopup && (
        <ConsentPopup
          isOpen={showConsentPopup}
          onClose={() => setShowConsentPopup(false)}
          onConsent={(hasLocation) => {
            console.log('Location consent:', hasLocation);
          }}
        />
      )}
      
      {showLocationInfo && locationState.locationData && (
        <div className={styles.locationInfoModal}>
          <div className={styles.locationInfoContent}>
            <div className={styles.locationInfoHeader}>
              <h3>
                <MapPin size={20} />
                Your Location
              </h3>
              <button 
                className={styles.closeButton}
                onClick={() => setShowLocationInfo(false)}
                aria-label="Close location information"
              >
                ×
              </button>
            </div>
            
            <div className={styles.locationDetails}>
              {locationState.locationData.type === 'coordinates' ? (
                <>
                  <p><strong>Type:</strong> GPS Coordinates</p>
                  <p><strong>Latitude:</strong> {locationState.locationData.coordinates?.latitude}</p>
                  <p><strong>Longitude:</strong> {locationState.locationData.coordinates?.longitude}</p>
                </>
              ) : (
                <>
                  <p><strong>Type:</strong> Village Selection</p>
                  <p><strong>Village:</strong> {locationState.locationData.village?.name}</p>
                  <p><strong>District:</strong> {locationState.locationData.village?.district}</p>
                </>
              )}
              <p><strong>Last Updated:</strong> {new Date(locationState.locationData.timestamp).toLocaleString()}</p>
            </div>
            
            <div className={styles.locationActions}>
              <button 
                className="btn btn-outline"
                onClick={() => {
                  setShowLocationInfo(false);
                  setShowConsentPopup(true);
                }}
              >
                Update Location
              </button>
              <button 
                className="btn btn-danger"
                onClick={async () => {
                  await locationState.clearLocation();
                  setShowLocationInfo(false);
                }}
              >
                Clear Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;