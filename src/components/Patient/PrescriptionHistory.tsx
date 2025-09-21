import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { FileText, Download, ArrowLeft, Calendar, User, Pill, Shield, ExternalLink } from 'lucide-react';
import jsPDF from 'jspdf';
import { cardanoService } from '../../services/cardanoService';
import styles from './PrescriptionHistory.module.css';

interface PrescriptionHistoryProps {
  onBack: () => void;
}

const PrescriptionHistory: React.FC<PrescriptionHistoryProps> = ({ onBack }) => {
  const { state: appState } = useApp();
  const { state: authState } = useAuth();
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);

  const patientPrescriptions = appState.prescriptions.filter(
    p => p.patientId === authState.user?.id
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const generatePDF = (prescription: any) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Medical Prescription', 20, 30);
    
    // Patient Info
    doc.setFontSize(12);
    doc.text(`Patient: ${prescription.patientName}`, 20, 50);
    doc.text(`Doctor: ${prescription.doctorName}`, 20, 60);
    doc.text(`Date: ${new Date(prescription.date || prescription.createdAt).toLocaleDateString()}`, 20, 70);
    doc.text(`Prescription ID: ${prescription.id}`, 20, 80);
    
    // Diagnosis
    doc.setFontSize(14);
    doc.text('Diagnosis:', 20, 100);
    doc.setFontSize(12);
    const diagnosisLines = doc.splitTextToSize(prescription.diagnosis, 170);
    doc.text(diagnosisLines, 20, 110);
    
    // Medications
    let yPosition = 130 + (diagnosisLines.length * 10);
    doc.setFontSize(14);
    doc.text('Medications:', 20, yPosition);
    
    prescription.medications.forEach((med: any, index: number) => {
      yPosition += 20;
      doc.setFontSize(12);
      doc.text(`${index + 1}. ${med.name}`, 25, yPosition);
      doc.text(`   Dosage: ${med.dosage}`, 25, yPosition + 8);
      if (med.duration) {
        doc.text(`   Duration: ${med.duration}`, 25, yPosition + 16);
      }
      if (med.instructions) {
        doc.text(`   Instructions: ${med.instructions}`, 25, yPosition + 24);
        yPosition += 8;
      }
      yPosition += 16;
    });
    
    // Notes
    if (prescription.notes) {
      yPosition += 10;
      doc.setFontSize(14);
      doc.text('Additional Notes:', 20, yPosition);
      doc.setFontSize(12);
      const notesLines = doc.splitTextToSize(prescription.notes, 170);
      doc.text(notesLines, 20, yPosition + 10);
    }
    
    // Save PDF
    doc.save(`prescription-${prescription.id}.pdf`);
  };

  const renderPrescriptionDetail = (prescription: any) => (
    <div className={styles.prescriptionDetail}>
      <div className={styles.detailHeader}>
        <button 
          className="btn btn-outline btn-sm"
          onClick={() => setSelectedPrescription(null)}
        >
          <ArrowLeft size={16} />
          Back to List
        </button>
        <button 
          className="btn btn-primary btn-sm"
          onClick={() => generatePDF(prescription)}
        >
          <Download size={16} />
          Download PDF
        </button>
      </div>

      <div className="card">
        <div className={styles.prescriptionContent}>
          <div className={styles.prescriptionHeader}>
            <h3>Prescription Details</h3>
            <div className={styles.prescriptionMeta}>
              <span className={styles.prescriptionId}>ID: {prescription.id.slice(-8)}</span>
              <span className={styles.prescriptionDate}>
                {new Date(prescription.date || prescription.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <User size={16} />
              <div>
                <strong>Doctor:</strong>
                <span>{prescription.doctorName}</span>
              </div>
            </div>
            <div className={styles.infoItem}>
              <Calendar size={16} />
              <div>
                <strong>Date:</strong>
                <span>{new Date(prescription.date || prescription.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h4>Diagnosis</h4>
            <p>{prescription.diagnosis}</p>
          </div>

          <div className={styles.section}>
            <h4>Medications</h4>
            <div className={styles.medicationsList}>
              {prescription.medications.map((med: any, index: number) => (
                <div key={index} className={styles.medicationItem}>
                  <div className={styles.medicationHeader}>
                    <Pill size={16} />
                    <strong>{med.name}</strong>
                  </div>
                  <div className={styles.medicationDetails}>
                    <p><strong>Dosage:</strong> {med.dosage}</p>
                    {med.duration && <p><strong>Duration:</strong> {med.duration}</p>}
                    {med.instructions && <p><strong>Instructions:</strong> {med.instructions}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {prescription.notes && (
            <div className={styles.section}>
              <h4>Additional Notes</h4>
              <p>{prescription.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (selectedPrescription) {
    return renderPrescriptionDetail(selectedPrescription);
  }

  return (
    <div className={styles.prescriptionHistory}>
      <div className={styles.header}>
        <button className="btn btn-outline" onClick={onBack}>
          <ArrowLeft size={20} />
          Back
        </button>
        <h2>Prescription History</h2>
      </div>

      {patientPrescriptions.length === 0 ? (
        <div className={styles.emptyState}>
          <FileText size={48} />
          <h3>No prescription history</h3>
          <p>Your prescriptions from doctor consultations will appear here</p>
        </div>
      ) : (
        <div className={styles.prescriptionsList}>
          {patientPrescriptions.map(prescription => (
            <div key={prescription.id} className="card">
              <div className={styles.prescriptionCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>
                    <FileText size={20} />
                    <h4>Prescription #{prescription.id.slice(-8)}</h4>
                  </div>
                  <div className={styles.cardActions}>
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => generatePDF(prescription)}
                    >
                      <Download size={16} />
                      PDF
                    </button>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => setSelectedPrescription(prescription)}
                    >
                      View Details
                    </button>
                  </div>
                </div>

                <div className={styles.cardContent}>
                  <div className={styles.prescriptionInfo}>
                    <div className={styles.infoRow}>
                      <Calendar size={16} />
                      <span>{new Date(prescription.date || prescription.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <User size={16} />
                      <span>Dr. {prescription.doctorName}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <Pill size={16} />
                      <span>{prescription.medications.length} medicine(s)</span>
                    </div>
                    {prescription.blockchainTxId && (
                      <div className={styles.infoRow}>
                        <Shield size={16} />
                        <span>Blockchain Secured</span>
                      </div>
                    )}
                  </div>

                  <div className={styles.diagnosisPreview}>
                    <strong>Diagnosis:</strong>
                    <p>{prescription.diagnosis.length > 100 
                      ? `${prescription.diagnosis.substring(0, 100)}...` 
                      : prescription.diagnosis}
                    </p>
                  </div>

                  <div className={styles.medicinesPreview}>
                    <strong>Medicines:</strong>
                    <div className={styles.medicinesList}>
                      {prescription.medications.slice(0, 2).map((med: any, index: number) => (
                        <span key={index} className={styles.medicineTag}>
                          {med.name}
                        </span>
                      ))}
                      {prescription.medications.length > 2 && (
                        <span className={styles.moreCount}>
                          +{prescription.medications.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {prescription.blockchainTxId && (
                    <div className={styles.blockchainBadge}>
                      <Shield size={14} />
                      <span>Verified on Cardano</span>
                      <button 
                        className={styles.explorerLink}
                        onClick={() => window.open(cardanoService.getExplorerUrl(prescription.blockchainTxId!), '_blank')}
                        title="View on Cardano blockchain explorer"
                      >
                        <ExternalLink size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrescriptionHistory;