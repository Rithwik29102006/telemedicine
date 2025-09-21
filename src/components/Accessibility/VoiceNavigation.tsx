import React, { useEffect } from 'react';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import styles from './VoiceNavigation.module.css';

const VoiceNavigation: React.FC = () => {
  const { state, startListening, stopListening, speak } = useAccessibility();

  useEffect(() => {
    // Auto-start listening if voice navigation is enabled
    if (state.settings.voiceNavigation && !state.isListening) {
      const timer = setTimeout(() => {
        startListening();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.settings.voiceNavigation]);

  if (!state.settings.isEnabled || !state.settings.voiceNavigation) {
    return null;
  }

  const handleToggleListening = () => {
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleVoiceCommand = (command: string) => {
    speak(`Executing ${command}`);
    // Command will be processed by the voice recognition system
  };

  const voiceCommands = [
    { text: 'Consult Doctor', command: 'consult doctor' },
    { text: 'My Prescriptions', command: 'my prescriptions' },
    { text: 'My Records', command: 'my records' },
    { text: 'Set Reminder', command: 'set reminder' },
    { text: 'Emergency', command: 'emergency' }
  ];

  return (
    <div className={styles.voiceNavigation} role="region" aria-label="Voice Navigation">
      <div className={styles.voiceControls}>
        <button
          className={`${styles.voiceButton} ${state.isListening ? styles.listening : ''}`}
          onClick={handleToggleListening}
          aria-label={state.isListening ? 'Stop voice recognition' : 'Start voice recognition'}
          aria-pressed={state.isListening}
        >
          {state.isListening ? <MicOff size={20} /> : <Mic size={20} />}
          <span>{state.isListening ? 'Listening...' : 'Voice Control'}</span>
        </button>

        <button
          className={styles.speakButton}
          onClick={() => speak('Voice navigation is active. Say a command or use the buttons below.')}
          aria-label="Hear voice navigation instructions"
        >
          <Volume2 size={20} />
          <span>Instructions</span>
        </button>
      </div>

      {state.lastCommand && (
        <div 
          className={styles.lastCommand}
          role="status"
          aria-live="polite"
          aria-label={`Last command: ${state.lastCommand}`}
        >
          Last command: "{state.lastCommand}"
        </div>
      )}

      <div className={styles.commandButtons} role="group" aria-label="Voice command buttons">
        <h3>Available Commands:</h3>
        <div className={styles.buttonGrid}>
          {voiceCommands.map((cmd, index) => (
            <button
              key={index}
              className={styles.commandButton}
              onClick={() => handleVoiceCommand(cmd.command)}
              aria-label={`Execute command: ${cmd.text}`}
            >
              {cmd.text}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.voiceHelp}>
        <p>
          <strong>Voice Commands:</strong> Say any of the commands above, or use the buttons.
          <br />
          <strong>Punjabi Support:</strong> "ਡਾਕਟਰ ਨਾਲ ਸਲਾਹ", "ਮੇਰੇ ਨੁਸਖੇ", "ਮਰੀਜ਼ ਰਜਿਸਟਰ ਕਰੋ"
        </p>
      </div>
    </div>
  );
};

export default VoiceNavigation;