import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { Video, VideoOff, Mic, MicOff, Phone } from 'lucide-react';
import PrescriptionForm from '../Doctor/PrescriptionForm';
import styles from './VideoCall.module.css';

interface VideoCallProps {
  consultationData: any;
  onEnd: (prescription?: any) => void;
  userRole: 'patient' | 'doctor';
}

const VideoCall: React.FC<VideoCallProps> = ({ consultationData, onEnd, userRole }) => {
  const { t } = useTranslation();
  const { addPrescription } = useApp();
  const { state: authState } = useAuth();
  const [callState, setCallState] = useState<'waiting' | 'connected' | 'prescription'>('waiting');
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    // Simulate call connection after 3 seconds
    const timer = setTimeout(() => {
      setCallState('connected');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callState === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    if (userRole === 'doctor') {
      setCallState('prescription');
    } else {
      onEnd();
    }
  };

  const handlePrescriptionSubmit = async (prescriptionData: any) => {
    const prescription = {
      patientId: userRole === 'doctor' ? consultationData.patientId || 'patient-id' : authState.user!.id,
      doctorId: userRole === 'doctor' ? authState.user!.id : 'doctor-id',
      ...prescriptionData
    };
    
    await addPrescription(prescription);
    onEnd(prescription);
  };

  const renderWaitingRoom = () => (
    <div className={styles.waitingRoom}>
      <div className={styles.waitingContent}>
        <div className={styles.spinner} />
        <h3>Connecting to {userRole === 'patient' ? 'doctor' : 'patient'}...</h3>
        <p>Please wait while we establish the connection</p>
      </div>
    </div>
  );

  const renderVideoCall = () => (
    <div className={styles.videoCall}>
      <div className={styles.videoContainer}>
        <div className={styles.remoteVideo}>
          <div className={styles.mockVideo}>
            <div className={styles.mockAvatar}>
              {userRole === 'patient' ? 'Dr. Smith' : 'Patient'}
            </div>
          </div>
        </div>
        
        <div className={styles.localVideo}>
          <div className={styles.mockVideo}>
            <div className={styles.mockAvatar}>You</div>
          </div>
        </div>
      </div>

      <div className={styles.callInfo}>
        <div className={styles.callDuration}>
          {formatDuration(callDuration)}
        </div>
      </div>

      <div className={styles.callControls}>
        <button
          className={`${styles.controlBtn} ${!audioEnabled ? styles.muted : ''}`}
          onClick={() => setAudioEnabled(!audioEnabled)}
        >
          {audioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
        </button>

        <button
          className={`${styles.controlBtn} ${!videoEnabled ? styles.muted : ''}`}
          onClick={() => setVideoEnabled(!videoEnabled)}
        >
          {videoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
        </button>

        <button
          className={`${styles.controlBtn} ${styles.endCall}`}
          onClick={handleEndCall}
        >
          <Phone size={20} />
        </button>
      </div>

      {consultationData && (
        <div className={styles.consultationInfo}>
          <div className="card">
            <div className={styles.infoContent}>
              <h4>Consultation Details</h4>
              <p><strong>Symptoms:</strong> {consultationData.symptoms || 'Not specified'}</p>
              {consultationData.duration && <p><strong>Duration:</strong> {consultationData.duration}</p>}
              {consultationData.severity && <p><strong>Severity:</strong> {consultationData.severity}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={styles.videoCallContainer}>
      {callState === 'waiting' && renderWaitingRoom()}
      {callState === 'connected' && renderVideoCall()}
      {callState === 'prescription' && userRole === 'doctor' && (
        <PrescriptionForm
          patientData={consultationData}
          onSubmit={handlePrescriptionSubmit}
          onCancel={() => onEnd()}
        />
      )}
    </div>
  );
};

export default VideoCall;