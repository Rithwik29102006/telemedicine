import CryptoJS from 'crypto-js';

// Cardano service for blockchain integration
class CardanoService {
  private isTestnet = true;
  private isBrowser = typeof window !== 'undefined';

  constructor() {
    // Never initialize BlockFrostAPI in browser environment
    // This prevents Node.js-specific dependencies from being loaded
    if (this.isBrowser) {
      console.warn('Running in browser environment, using mock blockchain service');
    }
  }

  // Generate SHA-256 hash of prescription data using browser-safe crypto-js
  generatePrescriptionHash(prescription: any): string {
    const prescriptionString = JSON.stringify({
      patientId: prescription.patientId,
      doctorId: prescription.doctorId,
      date: prescription.date,
      diagnosis: prescription.diagnosis,
      medications: prescription.medications,
      timestamp: prescription.createdAt
    });
    
    return CryptoJS.SHA256(prescriptionString).toString();
  }

  // Submit hash to Cardano blockchain (mock implementation for browser)
  async submitHashToBlockchain(hash: string, metadata: any): Promise<string> {
    try {
      // Always use mock implementation in browser
      return this.mockBlockchainTransaction(hash, metadata);
      
    } catch (error) {
      console.error('Failed to submit to blockchain:', error);
      throw new Error('Blockchain submission failed');
    }
  }

  // Mock blockchain transaction for development
  private async mockBlockchainTransaction(hash: string, metadata: any): Promise<string> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate mock transaction ID
    const mockTxId = 'tx_' + Math.random().toString(36).substr(2, 16) + Math.random().toString(36).substr(2, 16);
    
    console.log('Mock Cardano Transaction:', {
      txId: mockTxId,
      hash,
      metadata,
      network: this.isTestnet ? 'testnet' : 'mainnet'
    });
    
    return mockTxId;
  }

  // Get blockchain explorer URL for transaction
  getExplorerUrl(txId: string): string {
    const baseUrl = this.isTestnet 
      ? 'https://testnet.cardanoscan.io/transaction'
      : 'https://cardanoscan.io/transaction';
    
    return `${baseUrl}/${txId}`;
  }

  // Verify prescription hash on blockchain (mock)
  async verifyPrescriptionHash(txId: string, expectedHash: string): Promise<boolean> {
    try {
      // Mock verification - in development, always return true for valid-looking txIds
      await new Promise(resolve => setTimeout(resolve, 1000));
      return txId.startsWith('tx_') && txId.length > 10;
      
    } catch (error) {
      console.error('Verification failed:', error);
      return false;
    }
  }

  // Get network status
  async getNetworkStatus(): Promise<{ isOnline: boolean; network: string }> {
    try {
      // Check if we're in browser environment and navigator is available
      const isOnline = this.isBrowser && typeof navigator !== 'undefined' ? navigator.onLine : false;
      
      return { 
        isOnline, 
        network: this.isTestnet ? 'testnet' : 'mainnet' 
      };
      
    } catch (error) {
      return { isOnline: false, network: 'error' };
    }
  }
}

export const cardanoService = new CardanoService();
export default CardanoService;