import React from 'react';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { Clock, Trash2, Bell, BellOff, Plus } from 'lucide-react';
import styles from './ReminderList.module.css';

const ReminderList: React.FC = () => {
  const { state, updateReminder, deleteReminder, addReminder, speak } = useAccessibility();
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [formData, setFormData] = React.useState({
    medicineName: '',
    time: '',
    frequency: 'daily' as 'once' | 'daily'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await addReminder({
        prescriptionId: 'personal',
        medicineName: formData.medicineName,
        time: formData.time,
        repeat: formData.frequency,
        enabled: true
      });

      if (state.settings.isEnabled) {
        speak(`Personal reminder set for ${formData.medicineName} at ${formData.time}`);
      }

      // Reset form
      setFormData({ medicineName: '', time: '', frequency: 'daily' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add personal reminder:', error);
    }
  };

  const handleToggleReminder = async (reminder: any) => {
    const updatedReminder = { ...reminder, enabled: !reminder.enabled };
    await updateReminder(updatedReminder);
    
    if (state.settings.isEnabled) {
      speak(`Reminder ${updatedReminder.enabled ? 'enabled' : 'disabled'}`);
    }
  };

  const handleDeleteReminder = async (id: string, medicineName: string) => {
    if (window.confirm(`Delete reminder for ${medicineName}?`)) {
      await deleteReminder(id);
      
      if (state.settings.isEnabled) {
        speak(`Reminder for ${medicineName} deleted`);
      }
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className={styles.reminderList}>
      <div className={styles.header}>
        <h2>
          <Clock size={24} />
          Medicine Reminders
        </h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
          aria-label="Add personal reminder"
        >
          <Plus size={16} />
          Add Personal Reminder
        </button>
      </div>

      {showAddForm && (
        <div className={styles.addReminderForm}>
          <h3>Add Personal Reminder</h3>
          <form onSubmit={handleAddReminder}>
            <div className="form-group">
              <label htmlFor="medicineName" className="form-label">
                Medicine Name *
              </label>
              <input
                type="text"
                id="medicineName"
                name="medicineName"
                value={formData.medicineName}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter medicine name"
                required
              />
            </div>

            <div className="grid grid-2">
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
                />
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
                >
                  <option value="once">Once</option>
                  <option value="daily">Daily</option>
                </select>
              </div>
            </div>

            <div className={styles.formActions}>
              <button 
                type="button" 
                className="btn btn-outline"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({ medicineName: '', time: '', frequency: 'daily' });
                }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={!formData.medicineName || !formData.time}
              >
                Add Reminder
              </button>
            </div>
          </form>
        </div>
      )}

      {state.reminders.length === 0 ? (
        <div className={styles.emptyState}>
          <Bell size={48} />
          <h3>No reminders set</h3>
          <p>Set reminders from your prescription details to never miss your medicine.</p>
          <button 
            className="btn btn-primary"
            onClick={() => window.history.back()}
          >
            Go to Prescriptions
          </button>
        </div>
      ) : (
        <div className={styles.reminders}>
          {state.reminders.map(reminder => (
            <div 
              key={reminder.id} 
              className={`${styles.reminderCard} ${!reminder.enabled ? styles.disabled : ''}`}
            >
              <div className={styles.reminderInfo}>
                <div className={styles.medicineInfo}>
                  <h4>{reminder.medicineName}</h4>
                  <div className={styles.timeInfo}>
                    <Clock size={16} />
                    <span>{formatTime(reminder.time)}</span>
                    <span className={styles.frequency}>({reminder.repeat})</span>
                  </div>
                </div>
                
                {reminder.snoozeUntil && new Date(reminder.snoozeUntil) > new Date() && (
                  <div className={styles.snoozeInfo}>
                    Snoozed until {new Date(reminder.snoozeUntil).toLocaleTimeString()}
                  </div>
                )}
              </div>

              <div className={styles.reminderActions}>
                <button
                  className={`btn btn-outline btn-sm ${styles.toggleButton}`}
                  onClick={() => handleToggleReminder(reminder)}
                  aria-label={`${reminder.enabled ? 'Disable' : 'Enable'} reminder for ${reminder.medicineName}`}
                >
                  {reminder.enabled ? <BellOff size={16} /> : <Bell size={16} />}
                  {reminder.enabled ? 'Disable' : 'Enable'}
                </button>

                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteReminder(reminder.id, reminder.medicineName)}
                  aria-label={`Delete reminder for ${reminder.medicineName}`}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReminderList;