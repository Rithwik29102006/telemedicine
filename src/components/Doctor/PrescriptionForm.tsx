import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Minus, ArrowLeft, Shield, Loader } from 'lucide-react';
import styles from './PrescriptionForm.module.css';

interface PrescriptionFormProps {
  patientData: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const PrescriptionForm: React.FC<PrescriptionFormProps> = ({
  patientData,
  onSubmit,
  onCancel
}) => {
  const { t } = useTranslation();
  const { state: authState } = useAuth();
  const [isSubmittingToBlockchain, setIsSubmittingToBlockchain] = useState(false);
  const [blockchainStatus, setBlockchainStatus] = useState<'pending' | 'success' | 'error' | null>(null);
  const [formData, setFormData] = useState({
    patientId: patientData?.id || 'unknown-patient',
    patientName: patientData?.name || 'Unknown Patient',
    doctorName: authState.user?.name || 'Unknown Doctor',
    date: new Date().toISOString().split('T')[0],
    diagnosis: '',
    notes: '',
    medications: [
      { name: '', dosage: '', duration: '', instructions: '' }
    ]
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleMedicationChange = (index: number, field: string, value: string) => {
    const updatedMedications = [...formData.medications];
    updatedMedications[index] = {
      ...updatedMedications[index],
      [field]: value
    };
    setFormData({
      ...formData,
      medications: updatedMedications
    });
  };

  const addMedication = () => {
    setFormData({
      ...formData,
      medications: [
        ...formData.medications,
        { name: '', dosage: '', duration: '', instructions: '' }
      ]
    });
  };

  const removeMedication = (index: number) => {
    if (formData.medications.length > 1) {
      const updatedMedications = formData.medications.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        medications: updatedMedications
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingToBlockchain(true);
    setBlockchainStatus('pending');
    
    try {
      onSubmit(formData);
      setBlockchainStatus('success');
    } catch (error) {
      setBlockchainStatus('error');
    } finally {
      setIsSubmittingToBlockchain(false);
    }
  };

  return (
    <div className={styles.prescriptionForm}>
      <div className={styles.header}>
        <button className="btn btn-outline" onClick={onCancel}>
          <ArrowLeft size={20} />
          {t('back')}
        </button>
        <h2>{t('createPrescription')}</h2>
      </div>

      <div className="card">
        <div className={styles.formContent}>
          <div className={styles.patientInfo}>
            <h3>Patient Information</h3>
            <div className="grid grid-2">
              <div className="form-group">
                <label htmlFor="patientId" className="form-label">
                  Patient ID
                </label>
                <input
                  type="text"
                  id="patientId"
                  name="patientId"
                  value={formData.patientId}
                  className="form-input"
                  readOnly
                  style={{ backgroundColor: '#f8fafc' }}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="date" className="form-label">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  className="form-input"
                  readOnly
                  style={{ backgroundColor: '#f8fafc' }}
                />
              </div>
            </div>
            
            <div className="grid grid-2">
              <div className="form-group">
                <label htmlFor="patientName" className="form-label">
                  Patient Name
                </label>
                <input
                  type="text"
                  id="patientName"
                  name="patientName"
                  value={formData.patientName}
                  className="form-input"
                  readOnly
                  style={{ backgroundColor: '#f8fafc' }}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="doctorName" className="form-label">
                  Doctor Name
                </label>
                <input
                  type="text"
                  id="doctorName"
                  name="doctorName"
                  value={formData.doctorName}
                  className="form-input"
                  readOnly
                  style={{ backgroundColor: '#f8fafc' }}
                />
              </div>
            </div>
            
            {patientData?.symptoms && (
              <p><strong>Symptoms:</strong> {patientData.symptoms}</p>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="diagnosis" className="form-label">
                Diagnosis/Notes *
              </label>
              <textarea
                id="diagnosis"
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Enter diagnosis and clinical notes"
                rows={4}
                required
              />
            </div>

            <div className={styles.medicationsSection}>
              <div className={styles.sectionHeader}>
                <h4>Medications</h4>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={addMedication}
                >
                  <Plus size={16} />
                  Add Medication
                </button>
              </div>

              {formData.medications.map((medication, index) => (
                <div key={index} className={styles.medicationGroup}>
                  <div className={styles.medicationHeader}>
                    <h5>Medication {index + 1}</h5>
                    {formData.medications.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => removeMedication(index)}
                      >
                        <Minus size={16} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-2">
                    <div className="form-group">
                      <label className="form-label">
                        Medicine Name *
                      </label>
                      <input
                        type="text"
                        value={medication.name}
                        onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                        className="form-input"
                        placeholder="Medicine name"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        {t('dosage')} *
                      </label>
                      <input
                        type="text"
                        value={medication.dosage}
                        onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                        className="form-input"
                        placeholder="e.g., 1 tablet twice daily"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      Duration *
                    </label>
                    <input
                      type="text"
                      value={medication.duration}
                      onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                      className="form-input"
                      placeholder="e.g., 7 days, 2 weeks"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Special Instructions
                    </label>
                    <textarea
                      value={medication.instructions}
                      onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                      className="form-textarea"
                      placeholder="Special instructions (before/after meals, etc.)"
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="form-group">
              <label htmlFor="notes" className="form-label">
                Additional Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Follow-up instructions, lifestyle recommendations, etc."
                rows={3}
              />
            </div>

            <div className={styles.submitSection}>
              {blockchainStatus && (
                <div className={`${styles.blockchainStatus} ${styles[blockchainStatus]}`}>
                  {blockchainStatus === 'pending' && (
                    <>
                      <Loader size={16} className={styles.spinning} />
                      Submitting to Cardano blockchain...
                    </>
                  )}
                  {blockchainStatus === 'success' && (
                    <>
                      <Shield size={16} />
                      Prescription secured on Cardano blockchain
                    </>
                  )}
                  {blockchainStatus === 'error' && (
                    <>
                      <Shield size={16} />
                      Blockchain submission failed (prescription saved locally)
                    </>
                  )}
                </div>
              )}
              
              <button type="button" className="btn btn-outline" onClick={onCancel}>
                {t('cancel')}
              </button>
              <button 
                type="submit" 
                className="btn btn-success"
                disabled={isSubmittingToBlockchain}
              >
                {isSubmittingToBlockchain ? (
                  <>
                    <Loader size={16} className={styles.spinning} />
                    Creating & Securing...
                  </>
                ) : (
                  <>
                    <Shield size={16} />
                    Create & Secure on Blockchain
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionForm;