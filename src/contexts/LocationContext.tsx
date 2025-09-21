import React, { createContext, useContext, useReducer, useEffect } from 'react';
import localforage from 'localforage';

export interface Village {
  id: string;
  name: string;
  district: string;
}

export interface LocationData {
  type: 'coordinates' | 'village';
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  village?: Village;
  timestamp: Date;
}

interface LocationState {
  hasConsent: boolean;
  consentGiven: boolean;
  locationData: LocationData | null;
  villages: Village[];
  isLoading: boolean;
  error: string | null;
}

type LocationAction =
  | { type: 'SET_CONSENT'; payload: boolean }
  | { type: 'SET_LOCATION_DATA'; payload: LocationData }
  | { type: 'SET_VILLAGES'; payload: Village[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOAD_DATA'; payload: Partial<LocationState> };

const LocationContext = createContext<{
  state: LocationState;
  requestLocationConsent: () => Promise<boolean>;
  getCurrentLocation: () => Promise<LocationData>;
  selectVillage: (village: Village) => Promise<void>;
  clearLocation: () => Promise<void>;
} | null>(null);

// Mock villages data - in real app, this would come from API
// Mock villages data - in real app, this would come from API
const MOCK_VILLAGES: Village[] = [
  { id: '1', name: 'Amritsar', district: 'Amritsar' },
  { id: '2', name: 'Ludhiana', district: 'Ludhiana' },
  { id: '3', name: 'Jalandhar', district: 'Jalandhar' },
  { id: '4', name: 'Patiala', district: 'Patiala' },
  { id: '5', name: 'Bathinda', district: 'Bathinda' },
  { id: '6', name: 'Mohali', district: 'Mohali' },
  { id: '7', name: 'Firozpur', district: 'Firozpur' },
  { id: '8', name: 'Gurdaspur', district: 'Gurdaspur' },
  { id: '9', name: 'Hoshiarpur', district: 'Hoshiarpur' },
  { id: '10', name: 'Kapurthala', district: 'Kapurthala' },
  // Add more villages as needed
];

const locationReducer = (state: LocationState, action: LocationAction): LocationState => {
  switch (action.type) {
    case 'SET_CONSENT':
      return { ...state, hasConsent: true, consentGiven: action.payload };
    case 'SET_LOCATION_DATA':
      return { ...state, locationData: action.payload, isLoading: false, error: null };
    case 'SET_VILLAGES':
      return { ...state, villages: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'LOAD_DATA':
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(locationReducer, {
    hasConsent: false,
    consentGiven: false,
    locationData: null,
    villages: MOCK_VILLAGES,
    isLoading: false,
    error: null
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [hasConsent, consentGiven, locationData] = await Promise.all([
        localforage.getItem<boolean>('location-consent'),
        localforage.getItem<boolean>('location-consent-given'),
        localforage.getItem<LocationData>('location-data')
      ]);

      dispatch({
        type: 'LOAD_DATA',
        payload: {
          hasConsent: hasConsent || false,
          consentGiven: consentGiven || false,
          locationData: locationData || null,
          villages: MOCK_VILLAGES
        }
      });
    } catch (error) {
      console.error('Failed to load location data:', error);
    }
  };

  const requestLocationConsent = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      // This will be handled by the ConsentPopup component
      // For now, just return the current consent status
      resolve(state.consentGiven);
    });
  };

  const getCurrentLocation = async (): Promise<LocationData> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });

      const locationData: LocationData = {
        type: 'coordinates',
        coordinates: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        },
        timestamp: new Date()
      };

      await localforage.setItem('location-data', locationData);
      dispatch({ type: 'SET_LOCATION_DATA', payload: locationData });

      return locationData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get location';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const selectVillage = async (village: Village): Promise<void> => {
    const locationData: LocationData = {
      type: 'village',
      village,
      timestamp: new Date()
    };

    await localforage.setItem('location-data', locationData);
    dispatch({ type: 'SET_LOCATION_DATA', payload: locationData });
  };

  const clearLocation = async (): Promise<void> => {
    await Promise.all([
      localforage.removeItem('location-consent'),
      localforage.removeItem('location-consent-given'),
      localforage.removeItem('location-data')
    ]);

    dispatch({
      type: 'LOAD_DATA',
      payload: {
        hasConsent: false,
        consentGiven: false,
        locationData: null
      }
    });
  };

  return (
    <LocationContext.Provider value={{
      state,
      requestLocationConsent,
      getCurrentLocation,
      selectVillage,
      clearLocation
    }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};