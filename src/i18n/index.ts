import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Common
      'login': 'Login',
      'signup': 'Sign Up',
      'logout': 'Logout',
      'submit': 'Submit',
      'cancel': 'Cancel',
      'save': 'Save',
      'edit': 'Edit',
      'delete': 'Delete',
      'add': 'Add',
      'back': 'Back',
      'next': 'Next',
      'loading': 'Loading...',
      'offline': 'Offline',
      'sync': 'Sync Data',
      
      // Auth
      'email': 'Email',
      'password': 'Password',
      'name': 'Name',
      'phone': 'Phone Number',
      'selectRole': 'Select Role',
      'patient': 'Patient',
      'chw': 'Community Health Worker',
      'doctor': 'Doctor',
      'pharmacy': 'Pharmacy',
      'admin': 'Admin',
      'welcomeBack': 'Welcome back!',
      'createAccount': 'Create your account',
      
      // Patient
      'consultDoctor': 'Consult Doctor',
      'myPrescriptions': 'My Prescriptions',
      'myRecords': 'My Records',
      'symptoms': 'Symptoms',
      'describeSymptoms': 'Describe your symptoms',
      'startConsultation': 'Start Consultation',
      'joinCall': 'Join Video Call',
      'downloadPrescription': 'Download Prescription',
      
      // CHW
      'registerPatient': 'Register Patient',
      'assistConsult': 'Assist Consult',
      'patientName': 'Patient Name',
      'patientAge': 'Age',
      'patientGender': 'Gender',
      'patientAddress': 'Address',
      'male': 'Male',
      'female': 'Female',
      'other': 'Other',
      
      // Doctor
      'patientQueue': 'Patient Queue',
      'consultScreen': 'Consultation',
      'prescriptionHistory': 'Prescription History',
      'patientNotes': 'Patient Notes',
      'diagnosis': 'Diagnosis',
      'medication': 'Medication',
      'dosage': 'Dosage',
      'instructions': 'Instructions',
      'createPrescription': 'Create Prescription',
      
      // Pharmacy
      'inventory': 'Inventory',
      'prescriptionRequests': 'Prescription Requests',
      'history': 'History',
      'medicineName': 'Medicine Name',
      'quantity': 'Quantity',
      'price': 'Price',
      'expiryDate': 'Expiry Date',
      'accept': 'Accept',
      'reject': 'Reject'
    }
  },
  pa: {
    translation: {
      // Common
      'login': 'ਲਾਗਇਨ',
      'signup': 'ਸਾਈਨ ਅੱਪ',
      'logout': 'ਲਾਗਆਉਟ',
      'submit': 'ਜਮ੍ਹਾ ਕਰੋ',
      'cancel': 'ਰੱਦ ਕਰੋ',
      'save': 'ਸੇਵ ਕਰੋ',
      'edit': 'ਸੰਪਾਦਿਤ ਕਰੋ',
      'delete': 'ਮਿਟਾਓ',
      'add': 'ਜੋੜੋ',
      'back': 'ਵਾਪਸ',
      'next': 'ਅਗਲਾ',
      'loading': 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...',
      'offline': 'ਆਫਲਾਈਨ',
      'sync': 'ਡਾਟਾ ਸਿੰਕ ਕਰੋ',
      
      // Auth
      'email': 'ਈਮੇਲ',
      'password': 'ਪਾਸਵਰਡ',
      'name': 'ਨਾਮ',
      'phone': 'ਫੋਨ ਨੰਬਰ',
      'selectRole': 'ਭੂਮਿਕਾ ਚੁਣੋ',
      'patient': 'ਮਰੀਜ਼',
      'chw': 'ਕਮਿਊਨਿਟੀ ਹੈਲਥ ਵਰਕਰ',
      'doctor': 'ਡਾਕਟਰ',
      'pharmacy': 'ਫਾਰਮੇਸੀ',
      'admin': 'ਐਡਮਿਨ',
      'welcomeBack': 'ਵਾਪਸੀ ਤੇ ਸੁਆਗਤ ਹੈ!',
      'createAccount': 'ਆਪਣਾ ਖਾਤਾ ਬਣਾਓ',
      
      // Patient
      'consultDoctor': 'ਡਾਕਟਰ ਨਾਲ ਸਲਾਹ',
      'myPrescriptions': 'ਮੇਰੇ ਨੁਸਖੇ',
      'myRecords': 'ਮੇਰੇ ਰਿਕਾਰਡ',
      'symptoms': 'ਲੱਛਣ',
      'describeSymptoms': 'ਆਪਣੇ ਲੱਛਣਾਂ ਦਾ ਵਰਣਨ ਕਰੋ',
      'startConsultation': 'ਸਲਾਹ ਸ਼ੁਰੂ ਕਰੋ',
      'joinCall': 'ਵੀਡੀਓ ਕਾਲ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਵੋ',
      'downloadPrescription': 'ਨੁਸਖਾ ਡਾਊਨਲੋਡ ਕਰੋ',
      
      // CHW
      'registerPatient': 'ਮਰੀਜ਼ ਦਾ ਰਜਿਸਟਰੇਸ਼ਨ',
      'assistConsult': 'ਸਲਾਹ ਵਿੱਚ ਸਹਾਇਤਾ',
      'patientName': 'ਮਰੀਜ਼ ਦਾ ਨਾਮ',
      'patientAge': 'ਉਮਰ',
      'patientGender': 'ਲਿੰਗ',
      'patientAddress': 'ਪਤਾ',
      'male': 'ਮਰਦ',
      'female': 'ਔਰਤ',
      'other': 'ਹੋਰ',
      
      // Doctor
      'patientQueue': 'ਮਰੀਜ਼ਾਂ ਦੀ ਕਤਾਰ',
      'consultScreen': 'ਸਲਾਹ',
      'prescriptionHistory': 'ਨੁਸਖਿਆਂ ਦਾ ਇਤਿਹਾਸ',
      'patientNotes': 'ਮਰੀਜ਼ ਦੇ ਨੋਟਸ',
      'diagnosis': 'ਨਿਦਾਨ',
      'medication': 'ਦਵਾਈ',
      'dosage': 'ਖੁਰਾਕ',
      'instructions': 'ਹਿਦਾਇਤਾਂ',
      'createPrescription': 'ਨੁਸਖਾ ਬਣਾਓ',
      
      // Pharmacy
      'inventory': 'ਇਨਵੈਂਟਰੀ',
      'prescriptionRequests': 'ਨੁਸਖਿਆਂ ਦੀਆਂ ਬੇਨਤੀਆਂ',
      'history': 'ਇਤਿਹਾਸ',
      'medicineName': 'ਦਵਾਈ ਦਾ ਨਾਮ',
      'quantity': 'ਮਾਤਰਾ',
      'price': 'ਕੀਮਤ',
      'expiryDate': 'ਮਿਆਦ ਦੀ ਮਿਤੀ',
      'accept': 'ਸਵੀਕਾਰ ਕਰੋ',
      'reject': 'ਰੱਦ ਕਰੋ'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;