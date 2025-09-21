import React, { useState } from 'react';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { Settings, Eye, Volume2, Mic, Phone, MapPin, Bell } from 'lucide-react';
import styles from './AccessibilitySettings.module.css';

const AccessibilitySettings: React.FC = () => {
  const { 
    state, 
    updateAccessibilitySettings, 
    updateEmergencySettings, 
    updateReminderSettings,
    speak 
  } = useAccessibility();
  
  const [activeTab, setActiveTab] = useState<'accessibility' | 'emergency' | 'reminders'>('accessibility');
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: '' });

  const handleAccessibilityChange = (setting: string, value: boolean) => {
    updateAccessibilitySettings({ [setting]: value });
    
    if (state.settings.isEnabled) {
      speak(`${setting.replace(/([A-Z])/g, ' $1').toLowerCase()} ${value ? 'enabled' : 'disabled'}`);
    }
  };

  const handleEmergencyChange = (setting: string, value: any) => {
    updateEmergencySettings({ [setting]: value });
  };

  const handleReminderChange = (setting: string, value: boolean) => {
    updateReminderSettings({ [setting]: value });
  };

  const addEmergencyContact = () => {
    if (newContact.name && newContact.phone) {
      const contact = {
        id: Math.random().toString(36).substr(2, 9),
        ...newContact
      };
      
      const updatedContacts = [...state.emergencySettings.contacts, contact];
      updateEmergencySettings({ contacts: updatedContacts });
      setNewContact({ name: '', phone: '', relationship: '' });
      
      if (state.settings.isEnabled) {
        speak(`Emergency contact ${newContact.name} added`);
      }
    }
  };

  const removeEmergencyContact = (id: string) => {
    const updatedContacts = state.emergencySettings.contacts.filter(c => c.id !== id);
    updateEmergencySettings({ contacts: updatedContacts });
    
    if (state.settings.isEnabled) {
      speak('Emergency contact removed');
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        handleReminderChange('browserNotifications', true);
        if (state.settings.isEnabled) {
          speak('Browser notifications enabled');
        }
      }
    }
  };

  return (
    <div className={styles.settingsContainer} role="main" aria-label="Accessibility Settings">
      <div className={styles.header}>
        <h2>
          <Settings size={24} />
          Accessibility & Settings
        </h2>
      </div>

      <div className={styles.tabNavigation} role="tablist">
        <button
          className={`${styles.tab} ${activeTab === 'accessibility' ? styles.active : ''}`}
          onClick={() => setActiveTab('accessibility')}
          role="tab"
          aria-selected={activeTab === 'accessibility'}
          aria-controls="accessibility-panel"
        >
          <Eye size={20} />
          Accessibility
        </button>
        
        <button
          className={`${styles.tab} ${activeTab === 'emergency' ? styles.active : ''}`}
          onClick={() => setActiveTab('emergency')}
          role="tab"
          aria-selected={activeTab === 'emergency'}
          aria-controls="emergency-panel"
        >
          <Phone size={20} />
          Emergency
        </button>
        
        <button
          className={`${styles.tab} ${activeTab === 'reminders' ? styles.active : ''}`}
          onClick={() => setActiveTab('reminders')}
          role="tab"
          aria-selected={activeTab === 'reminders'}
          aria-controls="reminders-panel"
        >
          <Bell size={20} />
          Reminders
        </button>
      </div>

      {activeTab === 'accessibility' && (
        <div 
          id="accessibility-panel" 
          className={styles.tabPanel}
          role="tabpanel"
          aria-labelledby="accessibility-tab"
        >
          <div className={styles.settingsSection}>
            <h3>Accessibility Features</h3>
            
            <div className={styles.settingItem}>
              <label className={styles.settingLabel}>
                <input
                  type="checkbox"
                  checked={state.settings.isEnabled}
                  onChange={(e) => handleAccessibilityChange('isEnabled', e.target.checked)}
                  aria-describedby="accessibility-help"
                />
                <span>Enable Accessibility Mode</span>
              </label>
              <p id="accessibility-help" className={styles.helpText}>
                Enables all accessibility features including voice navigation and screen reader support
              </p>
            </div>

            <div className={styles.settingItem}>
              <label className={styles.settingLabel}>
                <input
                  type="checkbox"
                  checked={state.settings.voiceNavigation}
                  onChange={(e) => handleAccessibilityChange('voiceNavigation', e.target.checked)}
                  disabled={!state.settings.isEnabled}
                  aria-describedby="voice-help"
                />
                <Mic size={16} />
                <span>Voice Navigation</span>
              </label>
              <p id="voice-help" className={styles.helpText}>
                Control the app using voice commands
              </p>
            </div>

            <div className={styles.settingItem}>
              <label className={styles.settingLabel}>
                <input
                  type="checkbox"
                  checked={state.settings.screenReader}
                  onChange={(e) => handleAccessibilityChange('screenReader', e.target.checked)}
                  disabled={!state.settings.isEnabled}
                  aria-describedby="screen-reader-help"
                />
                <Volume2 size={16} />
                <span>Screen Reader Support</span>
              </label>
              <p id="screen-reader-help" className={styles.helpText}>
                Enhanced ARIA labels and announcements for screen readers
              </p>
            </div>

            <div className={styles.settingItem}>
              <label className={styles.settingLabel}>
                <input
                  type="checkbox"
                  checked={state.settings.highContrast}
                  onChange={(e) => handleAccessibilityChange('highContrast', e.target.checked)}
                  disabled={!state.settings.isEnabled}
                  aria-describedby="contrast-help"
                />
                <span>High Contrast Mode</span>
              </label>
              <p id="contrast-help" className={styles.helpText}>
                Increases contrast for better visibility
              </p>
            </div>

            <div className={styles.settingItem}>
              <label className={styles.settingLabel}>
                <input
                  type="checkbox"
                  checked={state.settings.largeText}
                  onChange={(e) => handleAccessibilityChange('largeText', e.target.checked)}
                  disabled={!state.settings.isEnabled}
                  aria-describedby="large-text-help"
                />
                <span>Large Text</span>
              </label>
              <p id="large-text-help" className={styles.helpText}>
                Increases text size for better readability
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'emergency' && (
        <div 
          id="emergency-panel" 
          className={styles.tabPanel}
          role="tabpanel"
          aria-labelledby="emergency-tab"
        >
          <div className={styles.settingsSection}>
            <h3>Emergency Settings</h3>
            
            <div className={styles.settingItem}>
              <label className={styles.settingLabel}>
                <input
                  type="checkbox"
                  checked={state.emergencySettings.locationConsent}
                  onChange={(e) => handleEmergencyChange('locationConsent', e.target.checked)}
                  aria-describedby="location-help"
                />
                <MapPin size={16} />
                <span>Share Location in Emergency</span>
              </label>
              <p id="location-help" className={styles.helpText}>
                Allow sharing your location with emergency services
              </p>
            </div>

            <div className={styles.settingItem}>
              <label className={styles.settingLabel}>
                <input
                  type="checkbox"
                  checked={state.emergencySettings.autoCall}
                  onChange={(e) => handleEmergencyChange('autoCall', e.target.checked)}
                  aria-describedby="auto-call-help"
                />
                <Phone size={16} />
                <span>Auto-call Emergency Services</span>
              </label>
              <p id="auto-call-help" className={styles.helpText}>
                Automatically call emergency services when emergency is triggered
              </p>
            </div>
          </div>

          <div className={styles.settingsSection}>
            <h3>Emergency Contacts</h3>
            
            <div className={styles.contactForm}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Contact Name"
                  value={newContact.name}
                  onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                  className="form-input"
                  aria-label="Emergency contact name"
                />
              </div>
              
              <div className="form-group">
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                  className="form-input"
                  aria-label="Emergency contact phone number"
                />
              </div>
              
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Relationship"
                  value={newContact.relationship}
                  onChange={(e) => setNewContact({...newContact, relationship: e.target.value})}
                  className="form-input"
                  aria-label="Relationship to emergency contact"
                />
              </div>
              
              <button 
                className="btn btn-primary"
                onClick={addEmergencyContact}
                disabled={!newContact.name || !newContact.phone}
              >
                Add Contact
              </button>
            </div>

            <div className={styles.contactsList} role="list" aria-label="Emergency contacts">
              {state.emergencySettings.contacts.map(contact => (
                <div key={contact.id} className={styles.contactItem} role="listitem">
                  <div className={styles.contactInfo}>
                    <strong>{contact.name}</strong>
                    <span>{contact.phone}</span>
                    <span>{contact.relationship}</span>
                  </div>
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => removeEmergencyContact(contact.id)}
                    aria-label={`Remove ${contact.name} from emergency contacts`}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reminders' && (
        <div 
          id="reminders-panel" 
          className={styles.tabPanel}
          role="tabpanel"
          aria-labelledby="reminders-tab"
        >
          <div className={styles.settingsSection}>
            <h3>Reminder Channels</h3>
            
            <div className={styles.settingItem}>
              <label className={styles.settingLabel}>
                <input
                  type="checkbox"
                  checked={state.reminderSettings.browserNotifications}
                  onChange={(e) => handleReminderChange('browserNotifications', e.target.checked)}
                  aria-describedby="browser-notifications-help"
                />
                <Bell size={16} />
                <span>Browser Notifications</span>
              </label>
              <p id="browser-notifications-help" className={styles.helpText}>
                Show notifications in your browser for medicine reminders
              </p>
              
              {!state.reminderSettings.browserNotifications && (
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={requestNotificationPermission}
                >
                  Enable Notifications
                </button>
              )}
            </div>

            <div className={styles.settingItem}>
              <label className={styles.settingLabel}>
                <input
                  type="checkbox"
                  checked={state.reminderSettings.smsNotifications}
                  onChange={(e) => handleReminderChange('smsNotifications', e.target.checked)}
                  aria-describedby="sms-help"
                />
                <Phone size={16} />
                <span>SMS Notifications</span>
              </label>
              <p id="sms-help" className={styles.helpText}>
                Receive text message reminders (requires backend integration)
              </p>
            </div>

            <div className={styles.settingItem}>
              <label className={styles.settingLabel}>
                <input
                  type="checkbox"
                  checked={state.reminderSettings.ivrNotifications}
                  onChange={(e) => handleReminderChange('ivrNotifications', e.target.checked)}
                  aria-describedby="ivr-help"
                />
                <Volume2 size={16} />
                <span>Voice Call Reminders</span>
              </label>
              <p id="ivr-help" className={styles.helpText}>
                Receive automated voice call reminders (requires backend integration)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessibilitySettings;