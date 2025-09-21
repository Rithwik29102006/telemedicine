import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { Shield, Users, AlertTriangle, Activity, FileText, TrendingUp } from 'lucide-react';
import { cardanoService } from '../../services/cardanoService';
import styles from './AdminDashboard.module.css';

type AdminView = 'dashboard' | 'emergencies' | 'analytics' | 'blockchain';

const AdminDashboard: React.FC = () => {
  const { state: appState } = useApp();
  const { state: authState } = useAuth();
  const { state: accessibilityState } = useAccessibility();
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  const [networkStatus, setNetworkStatus] = useState<any>(null);

  React.useEffect(() => {
    loadNetworkStatus();
  }, []);

  const loadNetworkStatus = async () => {
    try {
      const status = await cardanoService.getNetworkStatus();
      setNetworkStatus(status);
    } catch (error) {
      console.error('Failed to load network status:', error);
    }
  };

  // Mock emergency alerts for demonstration
  const mockEmergencyAlerts = [
    {
      id: '1',
      patientId: 'patient-123',
      patientName: 'John Doe',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      location: { type: 'coordinates', coordinates: { latitude: 31.6340, longitude: 74.8723 } },
      status: 'active'
    },
    {
      id: '2',
      patientId: 'patient-456',
      patientName: 'Jane Smith',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      location: { type: 'village', village: { name: 'Amritsar', district: 'Amritsar' } },
      status: 'resolved'
    }
  ];

  const renderDashboard = () => (
    <div className={styles.dashboard}>
      <div className={styles.welcomeCard}>
        <h2>Admin Dashboard</h2>
        <p>Healthcare System Monitoring & Analytics</p>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statNumber}>{appState.patients.length}</span>
            <span className={styles.statLabel}>Total Patients</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>{appState.prescriptions.length}</span>
            <span className={styles.statLabel}>Prescriptions</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>{mockEmergencyAlerts.filter(a => a.status === 'active').length}</span>
            <span className={styles.statLabel}>Active Emergencies</span>
          </div>
        </div>
      </div>

      <div className="grid grid-4">
        <div className={`card ${styles.actionCard}`} onClick={() => setCurrentView('emergencies')}>
          <div className={styles.cardIcon}>
            <AlertTriangle size={32} />
          </div>
          <h3>Emergency Alerts</h3>
          <p>Monitor and respond to emergency situations</p>
          {mockEmergencyAlerts.filter(a => a.status === 'active').length > 0 && (
            <div className="badge badge-danger">
              {mockEmergencyAlerts.filter(a => a.status === 'active').length} active
            </div>
          )}
        </div>

        <div className={`card ${styles.actionCard}`} onClick={() => setCurrentView('analytics')}>
          <div className={styles.cardIcon}>
            <TrendingUp size={32} />
          </div>
          <h3>Analytics</h3>
          <p>View system usage and health metrics</p>
        </div>

        <div className={`card ${styles.actionCard}`} onClick={() => setCurrentView('blockchain')}>
          <div className={styles.cardIcon}>
            <Shield size={32} />
          </div>
          <h3>Blockchain Status</h3>
          <p>Monitor Cardano blockchain integration</p>
          <div className={`badge ${networkStatus?.isOnline ? 'badge-success' : 'badge-danger'}`}>
            {networkStatus?.network || 'Unknown'}
          </div>
        </div>

        <div className={`card ${styles.actionCard}`}>
          <div className={styles.cardIcon}>
            <Users size={32} />
          </div>
          <h3>User Management</h3>
          <p>Manage users and role assignments</p>
        </div>
      </div>
    </div>
  );

  const renderEmergencies = () => (
    <div className={styles.emergenciesView}>
      <div className={styles.viewHeader}>
        <h2>Emergency Alerts</h2>
        <button className="btn btn-outline" onClick={() => setCurrentView('dashboard')}>
          Back
        </button>
      </div>

      <div className={styles.emergencyList}>
        {mockEmergencyAlerts.map(alert => (
          <div key={alert.id} className={`card ${styles.emergencyCard} ${styles[alert.status]}`}>
            <div className={styles.emergencyHeader}>
              <div className={styles.emergencyInfo}>
                <h4>{alert.patientName}</h4>
                <p>Patient ID: {alert.patientId}</p>
                <p>Time: {alert.timestamp.toLocaleString()}</p>
              </div>
              <div className={`${styles.emergencyStatus} ${styles[alert.status]}`}>
                <AlertTriangle size={16} />
                {alert.status.toUpperCase()}
              </div>
            </div>
            
            <div className={styles.emergencyDetails}>
              <h5>Location:</h5>
              {alert.location.type === 'coordinates' ? (
                <p>GPS: {alert.location.coordinates?.latitude}, {alert.location.coordinates?.longitude}</p>
              ) : (
                <p>Village: {alert.location.village?.name}, {alert.location.village?.district}</p>
              )}
            </div>
            
            {alert.status === 'active' && (
              <div className={styles.emergencyActions}>
                <button className="btn btn-success btn-sm">Respond</button>
                <button className="btn btn-outline btn-sm">Contact Patient</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className={styles.analyticsView}>
      <div className={styles.viewHeader}>
        <h2>System Analytics</h2>
        <button className="btn btn-outline" onClick={() => setCurrentView('dashboard')}>
          Back
        </button>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className={styles.analyticsCard}>
            <h3>
              <Activity size={20} />
              System Usage
            </h3>
            <div className={styles.metrics}>
              <div className={styles.metric}>
                <span className={styles.metricValue}>{appState.patients.length}</span>
                <span className={styles.metricLabel}>Registered Patients</span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricValue}>{appState.prescriptions.length}</span>
                <span className={styles.metricLabel}>Total Prescriptions</span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricValue}>{appState.prescriptions.filter(p => p.blockchainTxId).length}</span>
                <span className={styles.metricLabel}>Blockchain Secured</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className={styles.analyticsCard}>
            <h3>
              <FileText size={20} />
              Recent Activity
            </h3>
            <div className={styles.activityList}>
              <div className={styles.activityItem}>
                <span>New prescription created</span>
                <span className={styles.activityTime}>2 hours ago</span>
              </div>
              <div className={styles.activityItem}>
                <span>Patient registered</span>
                <span className={styles.activityTime}>4 hours ago</span>
              </div>
              <div className={styles.activityItem}>
                <span>Emergency alert resolved</span>
                <span className={styles.activityTime}>6 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBlockchain = () => (
    <div className={styles.blockchainView}>
      <div className={styles.viewHeader}>
        <h2>Blockchain Status</h2>
        <button className="btn btn-outline" onClick={() => setCurrentView('dashboard')}>
          Back
        </button>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className={styles.blockchainCard}>
            <h3>
              <Shield size={20} />
              Network Status
            </h3>
            <div className={styles.networkInfo}>
              <div className={styles.networkItem}>
                <span>Network:</span>
                <span className={styles.networkValue}>{networkStatus?.network || 'Unknown'}</span>
              </div>
              <div className={styles.networkItem}>
                <span>Status:</span>
                <span className={`${styles.networkValue} ${networkStatus?.isOnline ? styles.online : styles.offline}`}>
                  {networkStatus?.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className={styles.networkItem}>
                <span>Secured Prescriptions:</span>
                <span className={styles.networkValue}>
                  {appState.prescriptions.filter(p => p.blockchainTxId).length} / {appState.prescriptions.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className={styles.blockchainCard}>
            <h3>Recent Blockchain Transactions</h3>
            <div className={styles.transactionList}>
              {appState.prescriptions
                .filter(p => p.blockchainTxId)
                .slice(0, 5)
                .map(prescription => (
                <div key={prescription.id} className={styles.transactionItem}>
                  <div className={styles.transactionInfo}>
                    <span>Prescription #{prescription.id.slice(-6)}</span>
                    <span className={styles.transactionId}>{prescription.blockchainTxId?.slice(0, 16)}...</span>
                  </div>
                  <span className={styles.transactionTime}>
                    {prescription.createdAt ? new Date(prescription.createdAt).toLocaleDateString() : 'Unknown'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container">
      {currentView === 'dashboard' && renderDashboard()}
      {currentView === 'emergencies' && renderEmergencies()}
      {currentView === 'analytics' && renderAnalytics()}
      {currentView === 'blockchain' && renderBlockchain()}
    </div>
  );
};

export default AdminDashboard;