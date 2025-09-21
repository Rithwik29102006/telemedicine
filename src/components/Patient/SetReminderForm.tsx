import React, { useState } from 'react';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { Clock, X } from 'lucide-react';
import styles from './SetReminderForm.module.css';

interface SetReminderFormProps {
  prescriptionId: string;
  medicineName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const SetReminderForm: React.FC<SetReminderFormProps> = ({
  prescriptionId,
  medicineName,
  onClose,
  onSuccess
}) => {
  const { addReminder, speak, state } = useAccessibility();
  const [formData, setFormData] = useState({
    time: '',
    frequency: 'daily' as 'once' | 'daily'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addReminder({
        prescriptionId,
        medicineName,
        time: formData.time,
        repeat: formData.frequency,
        enabled: true
      });

      if (state.settings.isEnabled) {
        speak(`Reminder set for ${medicineName} at ${formData.time}`);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to set reminder:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="reminder-title">
      <div className={styles.form}>
        <div className={styles.header}>
          <h3 id="reminder-title">
            <Clock size={20} />
            Set Medicine Reminder
          </h3>
          <button 
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close reminder form"
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.medicineInfo}>
            <strong>Medicine:</strong> {medicineName}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="time" className="form-label">
                Reminder Time *
              </label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                className="form-input"
                required
                aria-describedby="time-help"
              />
              <small id="time-help" className={styles.helpText}>
                Choose when you want to be reminded to take this medicine
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="frequency" className="form-label">
                Frequency *
              </label>
              <select
                id="frequency"
                name="frequency"
                value={formData.frequency}
                onChange={handleInputChange}
                className="form-select"
                required
                aria-describedby="frequency-help"
              >
                <option value="once">Once</option>
                <option value="daily">Daily</option>
              </select>
              <small id="frequency-help" className={styles.helpText}>
                How often should this reminder repeat
              </small>
            </div>

            <div className={styles.actions}>
              <button 
                type="button" 
                className="btn btn-outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSubmitting || !formData.time}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner" />
                    Setting...
                  </>
                ) : (
                  'Set Reminder'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetReminderForm;