import React from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../contexts/AppContext';
import { ArrowLeft, Check, X, FileText } from 'lucide-react';
import styles from './PrescriptionRequests.module.css';

interface PrescriptionRequestsProps {
  onBack: () => void;
}

const PrescriptionRequests: React.FC<PrescriptionRequestsProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const { state: appState, updatePrescriptionRequest } = useApp();

  const pendingRequests = appState.prescriptionRequests.filter(
    pr => pr.status === 'pending'
  );

  const handleAccept = async (requestId: string) => {
    const request = appState.prescriptionRequests.find(pr => pr.id === requestId);
    if (request) {
      await updatePrescriptionRequest({
        ...request,
        status: 'accepted'
      });
    }
  };

  const handleReject = async (requestId: string) => {
    const request = appState.prescriptionRequests.find(pr => pr.id === requestId);
    if (request) {
      await updatePrescriptionRequest({
        ...request,
        status: 'rejected'
      });
    }
  };

  const getPrescriptionById = (prescriptionId: string) => {
    return appState.prescriptions.find(p => p.id === prescriptionId);
  };

  return (
    <div className={styles.prescriptionRequests}>
      <div className={styles.header}>
        <button className="btn btn-outline" onClick={onBack}>
          <ArrowLeft size={20} />
          {t('back')}
        </button>
        <h2>{t('prescriptionRequests')}</h2>
      </div>

      {pendingRequests.length === 0 ? (
        <div className={styles.emptyState}>
          <FileText size={48} />
          <h3>No pending requests</h3>
          <p>Prescription requests will appear here when received</p>
        </div>
      ) : (
        <div className={styles.requestsList}>
          {pendingRequests.map(request => {
            const prescription = getPrescriptionById(request.prescriptionId);
            
            return (
              <div key={request.id} className="card">
                <div className={styles.requestCard}>
                  <div className={styles.requestHeader}>
                    <h4>Request #{request.id.slice(-6)}</h4>
                    <div className={styles.requestDate}>
                      {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'Unknown'}
                    </div>
                  </div>

                  {prescription && (
                    <div className={styles.prescriptionDetails}>
                      <div className={styles.prescriptionInfo}>
                        <h5>Prescription Details</h5>
                        <p><strong>ID:</strong> {prescription.id.slice(-6)}</p>
                        <p><strong>Diagnosis:</strong> {prescription.diagnosis}</p>
                        
                        <div className={styles.medications}>
                          <h6>Medications:</h6>
                          {prescription.medications.map((med, index) => (
                            <div key={index} className={styles.medication}>
                              <span className={styles.medName}>{med.name}</span>
                              <span className={styles.medDosage}>{med.dosage}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className={styles.requestActions}>
                    <button 
                      className="btn btn-success"
                      onClick={() => handleAccept(request.id)}
                    >
                      <Check size={16} />
                      {t('accept')}
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleReject(request.id)}
                    >
                      <X size={16} />
                      {t('reject')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className={styles.completedSection}>
        <h3>Recent Decisions</h3>
        <div className={styles.completedRequests}>
          {appState.prescriptionRequests
            .filter(pr => pr.status !== 'pending')
            .slice(0, 5)
            .map(request => (
              <div key={request.id} className={`${styles.completedRequest} ${styles[request.status]}`}>
                <span>Request #{request.id.slice(-6)}</span>
                <span className={`badge ${request.status === 'accepted' ? 'badge-success' : 'badge-danger'}`}>
                  {request.status}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default PrescriptionRequests;