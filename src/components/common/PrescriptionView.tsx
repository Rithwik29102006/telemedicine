import React from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Clock, Shield, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { Prescription } from '../../contexts/AppContext';
import { useApp } from '../../contexts/AppContext';
import { cardanoService } from '../../services/cardanoService';
import SetReminderForm from '../Patient/SetReminderForm';
import styles from './PrescriptionView.module.css';

interface PrescriptionViewProps {
  prescription: Prescription;
  showActions?: boolean;
  showReminderButton?: boolean;
}

const PrescriptionView: React.FC<PrescriptionViewProps> = ({ 
  prescription, 
  showActions = true,
  showReminderButton = false
}) => {
  const { t } = useTranslation();
  const { verifyPrescriptionOnBlockchain } = useApp();
  const [showReminderForm, setShowReminderForm] = React.useState(false);
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [verificationResult, setVerificationResult] = React.useState<boolean | null>(null);

  const handleDownload = async () => {
    // In a real app, this would generate and download a PDF
    const element = document.createElement('a');
    const file = new Blob([generatePrescriptionText()], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `prescription-${prescription.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const generatePrescriptionText = () => {
    return `
PRESCRIPTION
-----------

Prescription ID: ${prescription.id}
Patient ID: ${prescription.patientId}
Doctor ID: ${prescription.doctorId}
Date: ${new Date(prescription.createdAt).toLocaleDateString()}

DIAGNOSIS:
${prescription.diagnosis}

MEDICATIONS:
${prescription.medications.map(med => 
  `- ${med.name}\n  Dosage: ${med.dosage}\n  Instructions: ${med.instructions}`
).join('\n\n')}

NOTES:
${prescription.notes}
    `.trim();
  };

  const generateQRCode = () => {
    // Simulate QR code generation - in real app, use qrcode library
    const qrData = prescription.blockchainTxId || prescription.id;
    return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#000"/><rect x="10" y="10" width="80" height="80" fill="#fff"/><rect x="20" y="20" width="60" height="60" fill="#000"/><rect x="30" y="30" width="40" height="40" fill="#fff"/><text x="50" y="55" text-anchor="middle" fill="#000" font-size="8">${qrData.slice(-8)}</text></svg>`)}`;
  };

  const handleVerifyBlockchain = async () => {
    setIsVerifying(true);
    try {
      const result = await verifyPrescriptionOnBlockchain(prescription.id);
      setVerificationResult(result);
    } catch (error) {
      setVerificationResult(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const openBlockchainExplorer = () => {
    if (prescription.blockchainTxId) {
      const url = cardanoService.getExplorerUrl(prescription.blockchainTxId);
      window.open(url, '_blank');
    }
  };

  return (
    <div className="card">
      <div className={styles.prescriptionHeader}>
        <div className={styles.prescriptionInfo}>
          <h4>Prescription #{prescription.id.slice(-6)}</h4>
          <p className={styles.date}>
            {prescription.createdAt ? new Date(prescription.createdAt).toLocaleDateString() : 'Unknown'}
          </p>
        </div>
        {showActions && (
          <div className={styles.prescriptionActions}>
            {prescription.blockchainTxId && (
              <>
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={handleVerifyBlockchain}
                  disabled={isVerifying}
                  title="Verify prescription on Cardano blockchain"
                  aria-label="Verify prescription authenticity on blockchain"
                >
                  {isVerifying ? (
                    <Clock size={16} className={styles.spinning} />
                  ) : (
                    <Shield size={16} />
                  )}
                  {isVerifying ? 'Verifying...' : 'Verify'}
                </button>
                
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={openBlockchainExplorer}
                  title="View on Cardano blockchain explorer"
                  aria-label="View transaction on Cardano blockchain explorer"
                >
                  <ExternalLink size={16} />
                  Explorer
                </button>
              </>
            )}
            
            <button 
              className="btn btn-outline btn-sm"
              onClick={handleDownload}
              title={t('downloadPrescription')}
              aria-label={`Download prescription ${prescription.id.slice(-6)}`}
            >
              <Download size={16} />
            </button>
            
            {showReminderButton && (
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => setShowReminderForm(true)}
                title={`Set reminder for ${prescription.medications[0]?.name || 'medicine'}`}
                aria-label={`Set medicine reminder for ${prescription.medications[0]?.name || 'medicine'}`}
              >
                <Clock size={16} />
                Set Reminder
              </button>
            )}
          </div>
        )}
      </div>

      <div className={styles.prescriptionContent}>
        {prescription.blockchainTxId && (
          <div className={styles.blockchainInfo}>
            <div className={styles.blockchainHeader}>
              <Shield size={16} />
              <span>Blockchain Secured</span>
              {prescription.isVerified && <CheckCircle size={16} className={styles.verified} />}
            </div>
            <div className={styles.blockchainDetails}>
              <p><strong>Transaction ID:</strong> {prescription.blockchainTxId}</p>
              <p><strong>Hash:</strong> {prescription.prescriptionHash?.slice(0, 16)}...</p>
              {verificationResult !== null && (
                <div className={`${styles.verificationResult} ${verificationResult ? styles.success : styles.error}`}>
                  {verificationResult ? (
                    <>
                      <CheckCircle size={14} />
                      Verified on Cardano blockchain
                    </>
                  ) : (
                    <>
                      <AlertCircle size={14} />
                      Verification failed
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className={styles.section}>
          <h5>Diagnosis</h5>
          <p>{prescription.diagnosis}</p>
        </div>

        <div className={styles.section}>
          <h5>Medications</h5>
          <div className={styles.medications}>
            {prescription.medications.map((med, index) => (
              <div key={index} className={styles.medication}>
                <div className={styles.medName}>{med.name}</div>
                <div className={styles.medDosage}>Dosage: {med.dosage}</div>
                <div className={styles.medInstructions}>{med.instructions}</div>
              </div>
            ))}
          </div>
        </div>

        {prescription.notes && (
          <div className={styles.section}>
            <h5>Additional Notes</h5>
            <p>{prescription.notes}</p>
          </div>
        )}

        <div className={styles.qrSection}>
          <div className={styles.qrCode}>
            <img 
              src={generateQRCode()} 
              alt={`Prescription QR Code ${prescription.blockchainTxId ? '(Blockchain Secured)' : ''}`}
              width={80} 
              height={80}
            />
          </div>
          <p>
            {prescription.blockchainTxId 
              ? 'Scan QR code for blockchain verification' 
              : 'Scan QR code for verification'
            }
          </p>
        </div>
      </div>
      
      {showReminderForm && (
        <SetReminderForm
          prescriptionId={prescription.id}
          medicineName={prescription.medications[0]?.name || 'Medicine'} 
          onClose={() => setShowReminderForm(false)}
          onSuccess={() => {
            // Could show a success message here
          }}
        />
      )}
    </div>
  );
};

export default PrescriptionView;