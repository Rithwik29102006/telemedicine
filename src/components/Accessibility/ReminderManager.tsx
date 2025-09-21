import React, { useState } from 'react';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { useApp } from '../../contexts/AppContext';
import { Clock, Plus, Edit, Trash2, Bell } from 'lucide-react';
import styles from './ReminderManager.module.css';

interface ReminderManagerProps {
  prescriptionId?: string;
  medicineName?: string;
  onClose?: () => void;
}

const ReminderManager: React.FC<ReminderManagerProps> = ({ 
  prescriptionId, 
  medicineName, 
  onClose 
}) => {
  const { state: accessibilityState, addReminder, updateReminder, deleteReminder, speak } = useAccessibility();
  const { state: appState } = useApp();
  const [isAddingReminder, setIsAddingReminder] = useState(false);
  const [editingReminder, setEditingReminder] = useState<any>(null);
  const [formData, setFormData] = useState({
    time: '',
    repeat: 'daily' as 'daily' | 'weekly' | 'custom',
    enabled: true
  });

  const reminders = prescriptionId 
    ? accessibilityState.reminders.filter(r => r.prescriptionId === prescriptionId)
    : accessibilityState.reminders;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const reminderData = {
      prescriptionId: prescriptionId || 'general',
      medicineName: medicineName || 'Medicine',
      time: formData.time,
      repeat: formData.repeat,
      enabled: formData.enabled
    };

    if (editingReminder) {
      await updateReminder({
        ...reminderData,
        id: editingReminder.id
      });
      setEditingReminder(null);
      if (accessibilityState.settings.isEnabled) {
        speak('Reminder updated successfully');
      }
    } else {
      await addReminder(reminderData);
      if (accessibilityState.settings.isEnabled) {
        speak('Reminder added successfully');
      }
    }

    setIsAddingReminder(false);
    setFormData({ time: '', repeat: 'daily', enabled: true });
  };

  const handleEdit = (reminder: any) => {
    setEditingReminder(reminder);
    setFormData({
      time: reminder.time,
      repeat: reminder.repeat,
      enabled: reminder.enabled
    });
    setIsAddingReminder(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      await deleteReminder(id);
      if (accessibilityState.settings.isEnabled) {
        speak('Reminder deleted');
      }
    }
  };

  const handleSnooze = (reminderId: string) => {
    const reminder = reminders.find(r => r.id === reminderId);
    if (reminder) {
      const snoozeTime = new Date();
      snoozeTime.setMinutes(snoozeTime.getMinutes() + 10);
      
      updateReminder({
        ...reminder,
        snoozeUntil: snoozeTime
      });
      
      if (accessibilityState.settings.isEnabled) {
        speak('Reminder snoozed for 10 minutes');
      }
    }
  };

  const cancelForm = () => {
    setIsAddingReminder(false);
    setEditingReminder(null);
    setFormData({ time: '', repeat: 'daily', enabled: true });
  };

  return (
    <div className={styles.reminderManager} role="region" aria-label="Medicine Reminders">
      <div className={styles.header}>
        <h3>
          <Clock size={20} />
          Medicine Reminders
          {medicineName && <span> - {medicineName}</span>}
        </h3>
        
        <div className={styles.headerActions}>
          {!isAddingReminder && (
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => setIsAddingReminder(true)}
              aria-label="Add new reminder"
            >
              <Plus size={16} />
              Add Reminder
            </button>
          )}
          
          {onClose && (
            <button 
              className="btn btn-outline btn-sm"
              onClick={onClose}
              aria-label="Close reminder manager"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {isAddingReminder && (
        <div className={styles.reminderForm} role="form" aria-label="Add or edit reminder">
          <h4>{editingReminder ? 'Edit Reminder' : 'Add New Reminder'}</h4>
          
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
                Set the time when you want to be reminded
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="repeat" className="form-label">
                Repeat Schedule
              </label>
              <select
                id="repeat"
                name="repeat"
                value={formData.repeat}
                onChange={handleInputChange}
                className="form-select"
                aria-describedby="repeat-help"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="custom">Custom</option>
              </select>
              <small id="repeat-help" className={styles.helpText}>
                How often should this reminder repeat
              </small>
            </div>

            <div className="form-group">
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="enabled"
                  checked={formData.enabled}
                  onChange={handleInputChange}
                  aria-describedby="enabled-help"
                />
                <span>Enable this reminder</span>
              </label>
              <small id="enabled-help" className={styles.helpText}>
                Uncheck to temporarily disable this reminder
              </small>
            </div>

            <div className={styles.formActions}>
              <button type="button" className="btn btn-outline" onClick={cancelForm}>
                Cancel
              </button>
              <button type="submit" className="btn btn-success">
                {editingReminder ? 'Update Reminder' : 'Add Reminder'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.remindersList} role="list" aria-label="Current reminders">
        {reminders.length === 0 ? (
          <div className={styles.emptyState}>
            <Bell size={48} />
            <h4>No reminders set</h4>
            <p>Add reminders to help you remember to take your medicine on time</p>
          </div>
        ) : (
          reminders.map(reminder => (
            <div 
              key={reminder.id} 
              className={`${styles.reminderCard} ${!reminder.enabled ? styles.disabled : ''}`}
              role="listitem"
            >
              <div className={styles.reminderInfo}>
                <div className={styles.reminderTime}>
                  <Clock size={16} />
                  <span>{reminder.time}</span>
                  <span className={styles.repeatInfo}>({reminder.repeat})</span>
                </div>
                
                <div className={styles.reminderMedicine}>
                  {reminder.medicineName}
                </div>
                
                {reminder.snoozeUntil && new Date(reminder.snoozeUntil) > new Date() && (
                  <div className={styles.snoozeInfo}>
                    Snoozed until {new Date(reminder.snoozeUntil).toLocaleTimeString()}
                  </div>
                )}
                
                {!reminder.enabled && (
                  <div className={styles.disabledInfo}>
                    Reminder disabled
                  </div>
                )}
              </div>
              
              <div className={styles.reminderActions}>
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => handleSnooze(reminder.id)}
                  disabled={!reminder.enabled}
                  aria-label={`Snooze reminder for ${reminder.medicineName}`}
                >
                  Snooze
                </button>
                
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => handleEdit(reminder)}
                  aria-label={`Edit reminder for ${reminder.medicineName}`}
                >
                  <Edit size={16} />
                </button>
                
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(reminder.id)}
                  aria-label={`Delete reminder for ${reminder.medicineName}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReminderManager;