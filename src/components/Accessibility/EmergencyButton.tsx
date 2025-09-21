import React, { useState, useRef } from 'react';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../contexts/LocationContext';
import { AlertTriangle, Phone } from 'lucide-react';
import styles from './EmergencyButton.module.css';

interface EmergencyButtonProps {
  onClick?: () => void;
}

const EmergencyButton: React.FC<EmergencyButtonProps> = ({ onClick }) => {
  const { triggerEmergency, speak, state } = useAccessibility();
  const { state: authState } = useAuth();
  const { state: locationState } = useLocation();
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isTriggering, setIsTriggering] = useState(false);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startHold = () => {
    if (isTriggering) return;
    
    // Call the onClick handler if provided (for consent popup)
    if (onClick) {
      onClick();
    }
    
    setIsHolding(true);
    setHoldProgress(0);
    
    if (state.settings.isEnabled) {
      speak('Hold to confirm emergency alert');
    }

    // Progress animation
    progressTimerRef.current = setInterval(() => {
      setHoldProgress(prev => {
        const newProgress = prev + 5;
        return newProgress > 100 ? 100 : newProgress;
      });
    }, 100);

    // Trigger after 2 seconds
    holdTimerRef.current = setTimeout(() => {
      confirmEmergency();
    }, 2000);
  };

  const stopHold = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    
    setIsHolding(false);
    setHoldProgress(0);
    
    if (state.settings.isEnabled && holdProgress > 0 && holdProgress < 100) {
      speak('Emergency alert cancelled');
    }
  };

  const confirmEmergency = async () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
    }
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
    }
    
    setIsTriggering(true);
    setIsHolding(false);
    setHoldProgress(100);
    
    try {
      // Enhanced emergency data with patient ID and location
      const emergencyData = {
        patientId: authState.user?.id,
        patientName: authState.user?.name,
        timestamp: new Date().toISOString(),
        location: locationState.locationData,
        userRole: authState.user?.role
      };
      
      console.log('Emergency Alert Triggered:', emergencyData);
      
      // Call the original emergency function
      await triggerEmergency();
      
      // Additional emergency handling could be added here
      // e.g., send to emergency services API, notify CHWs, etc.
      
    } catch (error) {
      console.error('Emergency trigger failed:', error);
    } finally {
      setIsTriggering(false);
      setHoldProgress(0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!isHolding) {
        startHold();
      }
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      stopHold();
    }
  };

  return (
    <div className={styles.emergencyContainer}>
      <button
        className={`${styles.emergencyButton} ${isHolding ? styles.holding : ''} ${isTriggering ? styles.triggering : ''}`}
        onMouseDown={startHold}
        onMouseUp={stopHold}
        onMouseLeave={stopHold}
        onTouchStart={startHold}
        onTouchEnd={stopHold}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        disabled={isTriggering}
        aria-label="Emergency alert button - hold for 2 seconds to confirm"
        aria-describedby="emergency-instructions"
        role="button"
        tabIndex={0}
      >
        <div className={styles.buttonContent}>
          {isTriggering ? (
            <Phone size={24} />
          ) : (
            <AlertTriangle size={24} />
          )}
          <span className={styles.buttonText}>
            {isTriggering ? 'Calling...' : isHolding ? 'Hold...' : 'Emergency'}
          </span>
        </div>
        
        {isHolding && (
          <div 
            className={styles.progressBar}
            style={{ width: `${holdProgress}%` }}
            aria-hidden="true"
          />
        )}
      </button>
      
      <div 
        id="emergency-instructions" 
        className={styles.instructions}
        aria-live="polite"
      >
        {isHolding ? 
          'Keep holding to confirm emergency alert...' : 
          'Hold for 2 seconds to trigger emergency alert'
        }
      </div>
    </div>
  );
};

export default EmergencyButton;