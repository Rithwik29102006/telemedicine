import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, User } from 'lucide-react';
import styles from './PatientRegistrationForm.module.css';

interface PatientRegistrationFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

const PatientRegistrationForm: React.FC<PatientRegistrationFormProps> = ({ 
  onBack, 
  onSuccess 
}) => {
  const { t } = useTranslation();
  const { addPatient } = useApp();
  const { state: authState } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male' as 'male' | 'female' | 'other',
    phone: '',
    address: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addPatient({
        ...formData,
        age: parseInt(formData.age),
        registeredBy: authState.user!.id
      });
      
      onSuccess();
    } catch (error) {
      console.error('Failed to register patient:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.registrationForm}>
      <div className={styles.header}>
        <button className="btn btn-outline" onClick={onBack}>
          <ArrowLeft size={20} />
          {t('back')}
        </button>
        <h2>{t('registerPatient')}</h2>
      </div>

      <div className="card">
        <div className={styles.formContent}>
          <div className={styles.formHeader}>
            <User size={32} />
            <h3>Patient Information</h3>
            <p>Enter the patient's details to register them in the system</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                {t('patientName')} *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label htmlFor="age" className="form-label">
                  {t('patientAge')} *
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="form-input"
                  min="0"
                  max="120"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="gender" className="form-label">
                  {t('patientGender')} *
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                >
                  <option value="male">{t('male')}</option>
                  <option value="female">{t('female')}</option>
                  <option value="other">{t('other')}</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                {t('phone')} *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="address" className="form-label">
                {t('patientAddress')} *
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Enter complete address"
                required
              />
            </div>

            <div className={styles.submitSection}>
              <button 
                type="submit" 
                className="btn btn-success"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner" />
                    Registering...
                  </>
                ) : (
                  'Register Patient'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PatientRegistrationForm;