# Healthcare Web Portal with Cardano Blockchain Integration

A comprehensive role-based healthcare management system built with React and integrated with Cardano blockchain for secure medical record storage.

## Features

### Role-Based Dashboards
- **Patient**: View prescription history, set medicine reminders, share location, emergency alerts
- **Doctor**: Create prescriptions, view patient history, blockchain-secured records
- **Pharmacy**: View prescriptions, manage inventory, process requests
- **CHW (Community Health Worker)**: Register patients, assist with consultations
- **Admin**: Monitor emergencies, view analytics, blockchain status

### Cardano Blockchain Integration
- **Secure Storage**: Prescription hashes stored on Cardano testnet
- **Tamper-Proof**: Immutable record verification
- **Privacy**: Full prescription data stored off-chain, only hashes on blockchain
- **Verification**: Direct links to Cardano blockchain explorer

### Accessibility Features
- **Voice Navigation**: Complete voice control system
- **Screen Reader Support**: Full ARIA compliance
- **High Contrast Mode**: Enhanced visibility options
- **Large Text Mode**: Improved readability
- **Multilingual**: English and Punjabi support

### Offline-First Architecture
- **IndexedDB Storage**: Local data persistence
- **Background Sync**: Automatic synchronization when online
- **Service Worker**: Offline functionality and notifications

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Plain CSS (no frameworks)
- **Blockchain**: Cardano (via Blockfrost API)
- **Storage**: IndexedDB + LocalForage
- **Internationalization**: i18next
- **PDF Generation**: jsPDF
- **Notifications**: Web Notifications API + Service Worker

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Blockchain Integration
1. Get a Blockfrost API key from [https://blockfrost.io/](https://blockfrost.io/)
2. Copy `.env.example` to `.env`
3. Add your API key:
```
VITE_BLOCKFROST_API_KEY=your_testnet_api_key_here
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

## Core Workflows

### Doctor Creates Prescription
1. Doctor fills prescription form
2. Prescription saved to local database
3. SHA-256 hash generated from prescription data
4. Hash submitted to Cardano blockchain
5. Transaction ID stored with prescription
6. Patient can verify on blockchain explorer

### Patient Views History
1. Patient accesses prescription history
2. Each prescription shows blockchain verification status
3. "Verify" button checks hash on blockchain
4. "Explorer" button opens Cardano transaction
5. PDF download available for all prescriptions

### Emergency Alert System
1. Patient holds emergency button for 2 seconds
2. Location data (GPS or village) collected
3. Alert sent with patient ID and location
4. Admin dashboard shows active emergencies
5. Voice announcement if accessibility enabled

## Blockchain Architecture

### Data Flow
```
Prescription Created → Hash Generated → Cardano Submission → Transaction ID Stored
                                    ↓
Patient Views → Verification Check → Blockchain Explorer Link
```

### Security Model
- **On-Chain**: Only SHA-256 hashes and metadata
- **Off-Chain**: Full prescription details in encrypted local storage
- **Verification**: Hash comparison ensures data integrity
- **Privacy**: No personal medical data on public blockchain

## Accessibility Compliance

### WCAG 2.1 AA Standards
- ✅ Keyboard navigation
- ✅ Screen reader compatibility
- ✅ Color contrast ratios
- ✅ Focus management
- ✅ ARIA labels and roles

### Voice Navigation Commands
- "Consult Doctor" - Start consultation
- "My Prescriptions" - View prescription history
- "Set Reminder" - Create medicine reminder
- "Emergency" - Trigger emergency alert

## API Integration Points

### Blockfrost API (Cardano)
- Transaction submission
- Hash verification
- Network status monitoring
- Explorer URL generation

### Mock Services (Development)
- Emergency alert system
- SMS/IVR notifications
- Analytics data
- User management

## Development Guidelines

### File Structure
```
src/
├── components/          # React components by role
├── contexts/           # React context providers
├── services/           # External service integrations
├── styles/            # Global CSS styles
└── i18n/              # Internationalization files
```

### Adding New Features
1. Create component in appropriate role folder
2. Add to context if state management needed
3. Update i18n files for multilingual support
4. Add accessibility attributes
5. Test with voice navigation

## Deployment

### Environment Variables
- `VITE_BLOCKFROST_API_KEY`: Cardano blockchain API key
- Production builds require valid Blockfrost project ID

### Build Process
```bash
npm run build
npm run preview  # Test production build
```

## Contributing

1. Follow accessibility guidelines
2. Add i18n keys for new text
3. Test with voice navigation
4. Ensure blockchain integration works
5. Update documentation

## License

MIT License - see LICENSE file for details