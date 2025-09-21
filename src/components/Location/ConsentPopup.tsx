import React, { useState } from 'react';
import { useLocation } from '../../contexts/LocationContext';
import { MapPin, X } from 'lucide-react';
import VillageDropdown from './VillageDropdown';
import styles from './ConsentPopup.module.css';

interface ConsentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConsent: (hasLocation: boolean) => void;
}

const ConsentPopup: React.FC<ConsentPopupProps> = ({ isOpen, onClose, onConsent }) => {
  const { getCurrentLocation, selectVillage, state } = useLocation();
  const [step, setStep] = useState<'consent' | 'village'>('consent');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleShareLocation = async () => {
    setIsGettingLocation(true);
    setError(null);

    try {
      await getCurrentLocation();
      await saveConsent(true);
      onConsent(true);
      onClose();
    } catch (error) {
      setError('Failed to get location. Please select your village instead.');
      setStep('village');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleSelectVillage = () => {
    setStep('village');
  };

  const handleVillageSelected = async (village: any) => {
    try {
      await selectVillage(village);
      await saveConsent(false);
      onConsent(false);
      onClose();
    } catch (error) {
      setError('Failed to save village selection');
    }
  };

  const saveConsent = async (locationShared: boolean) => {
    await Promise.all([
      localStorage.setItem('location-consent', 'true'),
      localStorage.setItem('location-consent-given', locationShared.toString())
    ]);
  };

  const handleClose = () => {
    setStep('consent');
    setError(null);
    onClose();
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="consent-title">
      <div className={styles.popup}>
        <div className={styles.header}>
          <h3 id="consent-title">
            <MapPin size={20} />
            Location Access
          </h3>
          <button 
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Close location consent dialog"
          >
            <X size={20} />
          </button>
        </div>

        {step === 'consent' && (
          <div className={styles.content}>
            <p>Do you want to share your location for better service?</p>
            <p className={styles.subtext}>
              This helps us provide more accurate emergency services and pharmacy recommendations.
            </p>

            {error && (
              <div className={styles.error} role="alert">
                {error}
              </div>
            )}

            <div className={styles.actions}>
              <button 
                className="btn btn-primary"
                onClick={handleShareLocation}
                disabled={isGettingLocation}
              >
                {isGettingLocation ? (
                  <>
                    <div className="spinner" />
                    Getting Location...
                  </>
                ) : (
                  <>
                    <MapPin size={16} />
                    Yes, Share Location
                  </>
                )}
              </button>

              <button 
                className="btn btn-outline"
                onClick={handleSelectVillage}
                disabled={isGettingLocation}
              >
                No, Select Village
              </button>
            </div>
          </div>
        )}

        {step === 'village' && (
          <div className={styles.content}>
            <h4>Select Your Village</h4>
            <p className={styles.subtext}>
              Choose your village from the list below:
            </p>

            {error && (
              <div className={styles.error} role="alert">
                {error}
              </div>
            )}

            <VillageDropdown 
              villages={state.villages}
              onSelect={handleVillageSelected}
            />

            <div className={styles.actions}>
              <button 
                className="btn btn-outline"
                onClick={() => setStep('consent')}
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsentPopup;