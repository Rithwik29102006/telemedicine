import React, { createContext, useContext, useReducer, useEffect } from 'react';
import localforage from 'localforage';
import { cardanoService } from '../services/cardanoService';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone: string;
  address: string;
  registeredBy?: string; // CHW ID
  createdAt: Date;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  diagnosis: string;
  medications: Array<{
    name: string;
    dosage: string;
    duration: string;
    instructions: string;
  }>;
  notes: string;
  createdAt: Date;
  qrCode?: string;
  blockchainTxId?: string;
  prescriptionHash?: string;
  isVerified?: boolean;
}

export interface Medicine {
  id: string;
  name: string;
  quantity: number;
  price: number;
  expiryDate: Date;
}

export interface PrescriptionRequest {
  id: string;
  prescriptionId: string;
  pharmacyId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

interface AppState {
  patients: Patient[];
  prescriptions: Prescription[];
  medicines: Medicine[];
  prescriptionRequests: PrescriptionRequest[];
  isOnline: boolean;
  pendingSync: string[];
}

type AppAction =
  | { type: 'SET_ONLINE_STATUS'; payload: boolean }
  | { type: 'ADD_PATIENT'; payload: Patient }
  | { type: 'ADD_PRESCRIPTION'; payload: Prescription }
  | { type: 'ADD_MEDICINE'; payload: Medicine }
  | { type: 'UPDATE_MEDICINE'; payload: Medicine }
  | { type: 'DELETE_MEDICINE'; payload: string }
  | { type: 'ADD_PRESCRIPTION_REQUEST'; payload: PrescriptionRequest }
  | { type: 'UPDATE_PRESCRIPTION_REQUEST'; payload: PrescriptionRequest }
  | { type: 'LOAD_DATA'; payload: Partial<AppState> }
  | { type: 'ADD_PENDING_SYNC'; payload: string };

const AppContext = createContext<{
  state: AppState;
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt'>) => void;
  addPrescription: (prescription: Omit<Prescription, 'id' | 'createdAt'>) => void;
  addMedicine: (medicine: Omit<Medicine, 'id'>) => void;
  updateMedicine: (medicine: Medicine) => void;
  deleteMedicine: (id: string) => void;
  addPrescriptionRequest: (request: Omit<PrescriptionRequest, 'id' | 'createdAt'>) => void;
  updatePrescriptionRequest: (request: PrescriptionRequest) => void;
  syncData: () => Promise<void>;
  submitPrescriptionToBlockchain: (prescriptionId: string) => Promise<void>;
  verifyPrescriptionOnBlockchain: (prescriptionId: string) => Promise<boolean>;
} | null>(null);

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_ONLINE_STATUS':
      return { ...state, isOnline: action.payload };
    case 'ADD_PATIENT':
      return { ...state, patients: [...state.patients, action.payload] };
    case 'ADD_PRESCRIPTION':
      return { ...state, prescriptions: [...state.prescriptions, action.payload] };
    case 'ADD_MEDICINE':
      return { ...state, medicines: [...state.medicines, action.payload] };
    case 'UPDATE_MEDICINE':
      return {
        ...state,
        medicines: state.medicines.map(m => 
          m.id === action.payload.id ? action.payload : m
        )
      };
    case 'DELETE_MEDICINE':
      return {
        ...state,
        medicines: state.medicines.filter(m => m.id !== action.payload)
      };
    case 'ADD_PRESCRIPTION_REQUEST':
      return { 
        ...state, 
        prescriptionRequests: [...state.prescriptionRequests, action.payload] 
      };
    case 'UPDATE_PRESCRIPTION_REQUEST':
      return {
        ...state,
        prescriptionRequests: state.prescriptionRequests.map(pr =>
          pr.id === action.payload.id ? action.payload : pr
        )
      };
    case 'LOAD_DATA':
      return { ...state, ...action.payload };
    case 'ADD_PENDING_SYNC':
      return {
        ...state,
        pendingSync: [...state.pendingSync, action.payload]
      };
    default:
      return state;
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, {
    patients: [],
    prescriptions: [],
    medicines: [],
    prescriptionRequests: [],
    isOnline: navigator.onLine,
    pendingSync: []
  });

  useEffect(() => {
    loadData();
    
    const handleOnline = () => dispatch({ type: 'SET_ONLINE_STATUS', payload: true });
    const handleOffline = () => dispatch({ type: 'SET_ONLINE_STATUS', payload: false });
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadData = async () => {
    try {
      const [patients, prescriptions, medicines, prescriptionRequests, pendingSync] = await Promise.all([
        localforage.getItem<Patient[]>('patients').then(data => data || []),
        localforage.getItem<Prescription[]>('prescriptions').then(data => data || []),
        localforage.getItem<Medicine[]>('medicines').then(data => data || []),
        localforage.getItem<PrescriptionRequest[]>('prescriptionRequests').then(data => data || []),
        localforage.getItem<string[]>('pendingSync').then(data => data || [])
      ]);
      
      dispatch({ 
        type: 'LOAD_DATA', 
        payload: { patients, prescriptions, medicines, prescriptionRequests, pendingSync } 
      });
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const addPatient = async (patientData: Omit<Patient, 'id' | 'createdAt'>) => {
    const patient: Patient = {
      ...patientData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date()
    };
    
    dispatch({ type: 'ADD_PATIENT', payload: patient });
    
    const updatedPatients = [...state.patients, patient];
    await localforage.setItem('patients', updatedPatients);
    
    if (!state.isOnline) {
      dispatch({ type: 'ADD_PENDING_SYNC', payload: 'patients' });
    }
  };

  const addPrescription = async (prescriptionData: Omit<Prescription, 'id' | 'createdAt'>) => {
    const prescription: Prescription = {
      ...prescriptionData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      isVerified: false
    };
    
    dispatch({ type: 'ADD_PRESCRIPTION', payload: prescription });
    
    const updatedPrescriptions = [...state.prescriptions, prescription];
    await localforage.setItem('prescriptions', updatedPrescriptions);
    
    // Automatically submit to blockchain
    try {
      await submitPrescriptionToBlockchain(prescription.id);
    } catch (error) {
      console.error('Failed to submit prescription to blockchain:', error);
    }
  };

  const addMedicine = async (medicineData: Omit<Medicine, 'id'>) => {
    const medicine: Medicine = {
      ...medicineData,
      id: Math.random().toString(36).substr(2, 9)
    };
    
    dispatch({ type: 'ADD_MEDICINE', payload: medicine });
    
    const updatedMedicines = [...state.medicines, medicine];
    await localforage.setItem('medicines', updatedMedicines);
  };

  const updateMedicine = async (medicine: Medicine) => {
    dispatch({ type: 'UPDATE_MEDICINE', payload: medicine });
    
    const updatedMedicines = state.medicines.map(m => 
      m.id === medicine.id ? medicine : m
    );
    await localforage.setItem('medicines', updatedMedicines);
  };

  const deleteMedicine = async (id: string) => {
    dispatch({ type: 'DELETE_MEDICINE', payload: id });
    
    const updatedMedicines = state.medicines.filter(m => m.id !== id);
    await localforage.setItem('medicines', updatedMedicines);
  };

  const addPrescriptionRequest = async (requestData: Omit<PrescriptionRequest, 'id' | 'createdAt'>) => {
    const request: PrescriptionRequest = {
      ...requestData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date()
    };
    
    dispatch({ type: 'ADD_PRESCRIPTION_REQUEST', payload: request });
    
    const updatedRequests = [...state.prescriptionRequests, request];
    await localforage.setItem('prescriptionRequests', updatedRequests);
  };

  const updatePrescriptionRequest = async (request: PrescriptionRequest) => {
    dispatch({ type: 'UPDATE_PRESCRIPTION_REQUEST', payload: request });
    
    const updatedRequests = state.prescriptionRequests.map(pr =>
      pr.id === request.id ? request : pr
    );
    await localforage.setItem('prescriptionRequests', updatedRequests);
  };

  const submitPrescriptionToBlockchain = async (prescriptionId: string) => {
    const prescription = state.prescriptions.find(p => p.id === prescriptionId);
    if (!prescription) {
      throw new Error('Prescription not found');
    }

    try {
      // Generate hash of prescription data
      const hash = cardanoService.generatePrescriptionHash(prescription);
      
      // Submit hash to blockchain
      const txId = await cardanoService.submitHashToBlockchain(hash, {
        type: 'prescription',
        patientId: prescription.patientId,
        doctorId: prescription.doctorId,
        timestamp: prescription.createdAt.toISOString()
      });

      // Update prescription with blockchain data
      const updatedPrescription = {
        ...prescription,
        blockchainTxId: txId,
        prescriptionHash: hash,
        isVerified: true
      };

      // Update in state and storage
      const updatedPrescriptions = state.prescriptions.map(p =>
        p.id === prescriptionId ? updatedPrescription : p
      );
      
      dispatch({ type: 'LOAD_DATA', payload: { prescriptions: updatedPrescriptions } });
      await localforage.setItem('prescriptions', updatedPrescriptions);
      
    } catch (error) {
      console.error('Blockchain submission failed:', error);
      throw error;
    }
  };

  const verifyPrescriptionOnBlockchain = async (prescriptionId: string): Promise<boolean> => {
    const prescription = state.prescriptions.find(p => p.id === prescriptionId);
    if (!prescription || !prescription.blockchainTxId || !prescription.prescriptionHash) {
      return false;
    }

    try {
      return await cardanoService.verifyPrescriptionHash(
        prescription.blockchainTxId,
        prescription.prescriptionHash
      );
    } catch (error) {
      console.error('Verification failed:', error);
      return false;
    }
  };

  const syncData = async () => {
    if (!state.isOnline) return;
    
    try {
      // Simulate API sync - in real app, sync with backend
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear pending sync
      await localforage.setItem('pendingSync', []);
      dispatch({ type: 'LOAD_DATA', payload: { pendingSync: [] } });
      
      console.log('Data synced successfully');
    } catch (error) {
      console.error('Failed to sync data:', error);
    }
  };

  return (
    <AppContext.Provider value={{
      state,
      addPatient,
      addPrescription,
      addMedicine,
      updateMedicine,
      deleteMedicine,
      addPrescriptionRequest,
      updatePrescriptionRequest,
      syncData,
      submitPrescriptionToBlockchain,
      verifyPrescriptionOnBlockchain
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};