import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import styles from './ConsultationForm.module.css';

interface ConsultationFormProps {
  onBack: () => void;
  onStartConsultation: (data: any) => void;
}

const ConsultationForm: React.FC<ConsultationFormProps> = ({ onBack, onStartConsultation }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    symptoms: '',
    duration: '',
    severity: 'mild',
    previousTreatment: '',
    allergies: '',
    currentMedications: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartConsultation(formData);
  };

  return (
    <div className={styles.consultationForm}>
      <div className={styles.header}>
        <button className="btn btn-outline" onClick={onBack}>
          <ArrowLeft size={20} />
          {t('back')}
        </button>
        <h2>{t('consultDoctor')}</h2>
      </div>

      <div className="card">
        <div className={styles.formContent}>
          <h3>Medical Information Form</h3>
          <p>Please provide detailed information about your symptoms and medical history.</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="symptoms" className="form-label">
                {t('symptoms')} *
              </label>
              <textarea
                id="symptoms"
                name="symptoms"
                value={formData.symptoms}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder={t('describeSymptoms')}
                required
              />
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label htmlFor="duration" className="form-label">
                  Duration
                </label>
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., 3 days, 1 week"
                />
              </div>

              <div className="form-group">
                <label htmlFor="severity" className="form-label">
                  Severity
                </label>
                <select
                  id="severity"
                  name="severity"
                  value={formData.severity}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="previousTreatment" className="form-label">
                Previous Treatment
              </label>
              <textarea
                id="previousTreatment"
                name="previousTreatment"
                value={formData.previousTreatment}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Any previous treatments or consultations for this issue"
              />
            </div>

            <div className="form-group">
              <label htmlFor="allergies" className="form-label">
                Known Allergies
              </label>
              <input
                type="text"
                id="allergies"
                name="allergies"
                value={formData.allergies}
                onChange={handleInputChange}
                className="form-input"
                placeholder="List any known allergies"
              />
            </div>

            <div className="form-group">
              <label htmlFor="currentMedications" className="form-label">
                Current Medications
              </label>
              <textarea
                id="currentMedications"
                name="currentMedications"
                value={formData.currentMedications}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="List any medications you are currently taking"
              />
            </div>

            <div className={styles.submitSection}>
              <button type="submit" className="btn btn-primary">
                {t('startConsultation')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConsultationForm;