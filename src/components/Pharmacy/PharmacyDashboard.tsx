import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { Package, FileText, Clock } from 'lucide-react';
import InventoryManager from './InventoryManager';
import PrescriptionRequests from './PrescriptionRequests';
import styles from './PharmacyDashboard.module.css';

type PharmacyView = 'dashboard' | 'inventory' | 'requests' | 'history';

const PharmacyDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { state: appState } = useApp();
  const { state: authState } = useAuth();
  const [currentView, setCurrentView] = useState<PharmacyView>('dashboard');

  const pendingRequests = appState.prescriptionRequests.filter(
    pr => pr.status === 'pending'
  );

  const renderDashboard = () => (
    <div className={styles.dashboard}>
      <div className={styles.welcomeCard}>
        <h2>{authState.user?.name} Pharmacy</h2>
        <p>Pharmacy Management Dashboard</p>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statNumber}>{appState.medicines.length}</span>
            <span className={styles.statLabel}>Inventory Items</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>{pendingRequests.length}</span>
            <span className={styles.statLabel}>Pending Requests</span>
          </div>
        </div>
      </div>

      <div className="grid grid-3">
        <div className={`card ${styles.actionCard}`} onClick={() => setCurrentView('inventory')}>
          <div className={styles.cardIcon}>
            <Package size={32} />
          </div>
          <h3>{t('inventory')}</h3>
          <p>Manage medicine inventory and stock levels</p>
          <div className="badge badge-info">
            {appState.medicines.length} items
          </div>
        </div>

        <div className={`card ${styles.actionCard}`} onClick={() => setCurrentView('requests')}>
          <div className={styles.cardIcon}>
            <FileText size={32} />
          </div>
          <h3>{t('prescriptionRequests')}</h3>
          <p>Review and process prescription requests</p>
          {pendingRequests.length > 0 && (
            <div className="badge badge-warning">
              {pendingRequests.length} pending
            </div>
          )}
        </div>

        <div className={`card ${styles.actionCard}`} onClick={() => setCurrentView('history')}>
          <div className={styles.cardIcon}>
            <Clock size={32} />
          </div>
          <h3>{t('history')}</h3>
          <p>View transaction and fulfillment history</p>
        </div>
      </div>

      {appState.medicines.length > 0 && (
        <div className={styles.inventoryPreview}>
          <h3>Low Stock Items</h3>
          <div className="grid grid-2">
            {appState.medicines
              .filter(med => med.quantity < 10)
              .slice(0, 4)
              .map(medicine => (
              <div key={medicine.id} className="card">
                <div className={styles.medicineCard}>
                  <div className={styles.medicineInfo}>
                    <h4>{medicine.name}</h4>
                    <p>Quantity: <span className={styles.lowStock}>{medicine.quantity}</span></p>
                    <p>Price: ${medicine.price.toFixed(2)}</p>
                    <p>Expires: {medicine.expiryDate ? new Date(medicine.expiryDate).toLocaleDateString() : 'Unknown'}</p>
                  </div>
                  <button className="btn btn-warning btn-sm">
                    Restock
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderHistory = () => (
    <div className={styles.historyView}>
      <div className={styles.viewHeader}>
        <h2>{t('history')}</h2>
        <button className="btn btn-outline" onClick={() => setCurrentView('dashboard')}>
          {t('back')}
        </button>
      </div>

      <div className={styles.historyContent}>
        <div className="card">
          <div className={styles.historySection}>
            <h3>Recent Transactions</h3>
            <p>No transactions recorded yet.</p>
          </div>
        </div>

        <div className="card">
          <div className={styles.historySection}>
            <h3>Fulfilled Prescriptions</h3>
            <p>Prescription fulfillments will appear here.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container">
      {currentView === 'dashboard' && renderDashboard()}
      {currentView === 'inventory' && (
        <InventoryManager onBack={() => setCurrentView('dashboard')} />
      )}
      {currentView === 'requests' && (
        <PrescriptionRequests onBack={() => setCurrentView('dashboard')} />
      )}
      {currentView === 'history' && renderHistory()}
    </div>
  );
};

export default PharmacyDashboard;