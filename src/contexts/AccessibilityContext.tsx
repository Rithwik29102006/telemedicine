import React, { createContext, useContext, useReducer, useEffect } from 'react';
import localforage from 'localforage';

export interface AccessibilitySettings {
  isEnabled: boolean;
  voiceNavigation: boolean;
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export interface EmergencySettings {
  contacts: EmergencyContact[];
  locationConsent: boolean;
  autoCall: boolean;
}

export interface ReminderSettings {
  browserNotifications: boolean;
  smsNotifications: boolean;
  ivrNotifications: boolean;
}

export interface Reminder {
  id: string;
  prescriptionId: string;
  medicineName: string;
  time: string;
  repeat: 'daily' | 'weekly' | 'custom';
  enabled: boolean;
  lastTriggered?: Date;
  snoozeUntil?: Date;
}

interface AccessibilityState {
  settings: AccessibilitySettings;
  emergencySettings: EmergencySettings;
  reminderSettings: ReminderSettings;
  reminders: Reminder[];
  isListening: boolean;
  lastCommand: string | null;
}

type AccessibilityAction =
  | { type: 'SET_ACCESSIBILITY_SETTINGS'; payload: Partial<AccessibilitySettings> }
  | { type: 'SET_EMERGENCY_SETTINGS'; payload: Partial<EmergencySettings> }
  | { type: 'SET_REMINDER_SETTINGS'; payload: Partial<ReminderSettings> }
  | { type: 'ADD_REMINDER'; payload: Reminder }
  | { type: 'UPDATE_REMINDER'; payload: Reminder }
  | { type: 'DELETE_REMINDER'; payload: string }
  | { type: 'SET_LISTENING'; payload: boolean }
  | { type: 'SET_LAST_COMMAND'; payload: string | null }
  | { type: 'LOAD_DATA'; payload: Partial<AccessibilityState> };

const AccessibilityContext = createContext<{
  state: AccessibilityState;
  updateAccessibilitySettings: (settings: Partial<AccessibilitySettings>) => void;
  updateEmergencySettings: (settings: Partial<EmergencySettings>) => void;
  updateReminderSettings: (settings: Partial<ReminderSettings>) => void;
  addReminder: (reminder: Omit<Reminder, 'id'>) => void;
  updateReminder: (reminder: Reminder) => void;
  deleteReminder: (id: string) => void;
  triggerEmergency: () => Promise<void>;
  speak: (text: string) => void;
  startListening: () => void;
  stopListening: () => void;
} | null>(null);

const accessibilityReducer = (state: AccessibilityState, action: AccessibilityAction): AccessibilityState => {
  switch (action.type) {
    case 'SET_ACCESSIBILITY_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'SET_EMERGENCY_SETTINGS':
      return { ...state, emergencySettings: { ...state.emergencySettings, ...action.payload } };
    case 'SET_REMINDER_SETTINGS':
      return { ...state, reminderSettings: { ...state.reminderSettings, ...action.payload } };
    case 'ADD_REMINDER':
      return { ...state, reminders: [...state.reminders, action.payload] };
    case 'UPDATE_REMINDER':
      return {
        ...state,
        reminders: state.reminders.map(r => r.id === action.payload.id ? action.payload : r)
      };
    case 'DELETE_REMINDER':
      return {
        ...state,
        reminders: state.reminders.filter(r => r.id !== action.payload)
      };
    case 'SET_LISTENING':
      return { ...state, isListening: action.payload };
    case 'SET_LAST_COMMAND':
      return { ...state, lastCommand: action.payload };
    case 'LOAD_DATA':
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(accessibilityReducer, {
    settings: {
      isEnabled: false,
      voiceNavigation: false,
      highContrast: false,
      largeText: false,
      screenReader: false
    },
    emergencySettings: {
      contacts: [],
      locationConsent: false,
      autoCall: false
    },
    reminderSettings: {
      browserNotifications: true,
      smsNotifications: false,
      ivrNotifications: false
    },
    reminders: [],
    isListening: false,
    lastCommand: null
  });

  useEffect(() => {
    loadData();
    setupNotifications();
    applyAccessibilityStyles();
  }, []);

  useEffect(() => {
    applyAccessibilityStyles();
    saveData();
  }, [state.settings]);

  const loadData = async () => {
    try {
      const [settings, emergencySettings, reminderSettings, reminders] = await Promise.all([
        localforage.getItem<AccessibilitySettings>('accessibility-settings'),
        localforage.getItem<EmergencySettings>('emergency-settings'),
        localforage.getItem<ReminderSettings>('reminder-settings'),
        localforage.getItem<Reminder[]>('reminders')
      ]);

      dispatch({
        type: 'LOAD_DATA',
        payload: {
          settings: settings || state.settings,
          emergencySettings: emergencySettings || state.emergencySettings,
          reminderSettings: reminderSettings || state.reminderSettings,
          reminders: reminders || []
        }
      });
    } catch (error) {
      console.error('Failed to load accessibility data:', error);
    }
  };

  const saveData = async () => {
    try {
      await Promise.all([
        localforage.setItem('accessibility-settings', state.settings),
        localforage.setItem('emergency-settings', state.emergencySettings),
        localforage.setItem('reminder-settings', state.reminderSettings),
        localforage.setItem('reminders', state.reminders)
      ]);
    } catch (error) {
      console.error('Failed to save accessibility data:', error);
    }
  };

  const applyAccessibilityStyles = () => {
    const root = document.documentElement;
    
    if (state.settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (state.settings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }
  };

  const setupNotifications = async () => {
    if ('Notification' in window && state.reminderSettings.browserNotifications) {
      await Notification.requestPermission();
    }

    if ('serviceWorker' in navigator && import.meta.env.MODE === 'production') {
      try {
        await navigator.serviceWorker.register('/sw.js');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  };

  const updateAccessibilitySettings = async (settings: Partial<AccessibilitySettings>) => {
    dispatch({ type: 'SET_ACCESSIBILITY_SETTINGS', payload: settings });
  };

  const updateEmergencySettings = async (settings: Partial<EmergencySettings>) => {
    dispatch({ type: 'SET_EMERGENCY_SETTINGS', payload: settings });
  };

  const updateReminderSettings = async (settings: Partial<ReminderSettings>) => {
    dispatch({ type: 'SET_REMINDER_SETTINGS', payload: settings });
  };

  const addReminder = async (reminderData: Omit<Reminder, 'id'>) => {
    const reminder: Reminder = {
      ...reminderData,
      id: Math.random().toString(36).substr(2, 9)
    };
    
    dispatch({ type: 'ADD_REMINDER', payload: reminder });
    scheduleNotification(reminder);
  };

  const updateReminder = async (reminder: Reminder) => {
    dispatch({ type: 'UPDATE_REMINDER', payload: reminder });
    scheduleNotification(reminder);
  };

  const deleteReminder = async (id: string) => {
    dispatch({ type: 'DELETE_REMINDER', payload: id });
    cancelNotification(id);
  };

  const scheduleNotification = (reminder: Reminder) => {
    if (!reminder.enabled) return;

    try {
      const now = new Date();
      const [hours, minutes] = reminder.time.split(':').map(Number);
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);

      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      const timeUntilNotification = scheduledTime.getTime() - now.getTime();

      setTimeout(() => {
        showReminderNotification(reminder);
      }, timeUntilNotification);
    } catch (error) {
      console.error('Failed to schedule notification:', error);
    }
  };

  const showReminderNotification = (reminder: Reminder) => {
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(`Medicine Reminder: ${reminder.medicineName}`, {
          body: `Time to take your ${reminder.medicineName}`,
          icon: '/icon-192x192.png',
          tag: reminder.id,
          requireInteraction: true
        });

        notification.onclick = () => {
          window.focus();
          if (state.settings.isEnabled) {
            speak(`Time to take your ${reminder.medicineName}`);
          }
          notification.close();
        };
      }
      
      // Always try to speak if accessibility is enabled
      if (state.settings.isEnabled) {
        speak(`Time to take your ${reminder.medicineName}`);
      }
    } catch (error) {
      console.error('Failed to show reminder notification:', error);
    }
  };

  const cancelNotification = (reminderId: string) => {
    // Cancel scheduled notifications - in a real app, you'd track timeouts
    console.log(`Cancelled notification for reminder ${reminderId}`);
  };

  const triggerEmergency = async () => {
    try {
      let location = null;
      
      if (state.emergencySettings.locationConsent && 'geolocation' in navigator) {
        location = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            enableHighAccuracy: true
          });
        });
      }

      const emergencyData = {
        timestamp: new Date().toISOString(),
        location: location ? {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        } : null,
        contacts: state.emergencySettings.contacts,
        patientSummary: 'Emergency triggered from healthcare portal'
      };

      // In a real app, this would POST to /api/emergency
      console.log('Emergency triggered:', emergencyData);
      
      if (state.settings.isEnabled) {
        speak('Emergency services have been notified. Help is on the way.');
      }

      // Show success notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Emergency Alert Sent', {
          body: 'Emergency services have been notified',
          icon: '/icon-192x192.png'
        });
      }

    } catch (error) {
      console.error('Emergency trigger failed:', error);
      
      if (state.settings.isEnabled) {
        speak('Emergency alert failed. Please call emergency services directly.');
      }
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window && state.settings.isEnabled) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      dispatch({ type: 'SET_LISTENING', payload: true });
    };

    recognition.onresult = (event: any) => {
      const command = event.results[0][0].transcript.toLowerCase();
      dispatch({ type: 'SET_LAST_COMMAND', payload: command });
      processVoiceCommand(command);
    };

    recognition.onerror = () => {
      dispatch({ type: 'SET_LISTENING', payload: false });
    };

    recognition.onend = () => {
      dispatch({ type: 'SET_LISTENING', payload: false });
    };

    recognition.start();
  };

  const stopListening = () => {
    dispatch({ type: 'SET_LISTENING', payload: false });
  };

  const processVoiceCommand = (command: string) => {
    const commands = {
      'consult doctor': () => {
        speak('Opening doctor consultation');
        // Navigate to consultation
      },
      'my prescriptions': () => {
        speak('Opening your prescriptions');
        // Navigate to prescriptions
      },
      'register patient': () => {
        speak('Opening patient registration');
        // Navigate to patient registration
      },
      'set reminder': () => {
        speak('Opening reminder settings');
        // Navigate to reminders
      },
      'emergency': () => {
        speak('Triggering emergency alert');
        triggerEmergency();
      }
    };

    const matchedCommand = Object.keys(commands).find(cmd => 
      command.includes(cmd)
    );

    if (matchedCommand) {
      (commands as any)[matchedCommand]();
    } else {
      speak('Command not recognized. Please try again.');
    }
  };

  return (
    <AccessibilityContext.Provider value={{
      state,
      updateAccessibilitySettings,
      updateEmergencySettings,
      updateReminderSettings,
      addReminder,
      updateReminder,
      deleteReminder,
      triggerEmergency,
      speak,
      startListening,
      stopListening
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};