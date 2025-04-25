// Service to interact with the blockchain backend server
const BLOCKCHAIN_API_URL = import.meta.env.VITE_BLOCKCHAIN_API_URL || 'http://localhost:4000';
const BLOCKCHAIN_API_KEY = import.meta.env.VITE_BLOCKCHAIN_API_KEY;

interface BlockchainDonation {
  donorId: string;
  recipientId: string;
  amount: string;
  currency: string;
  donationType: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

interface BlockchainDonationResult {
  donationId: number;
  txHash: string;
}

/**
 * Sanitize metadata to ensure it can be safely stringified and stored on the blockchain
 * This function removes non-ASCII characters and ensures all values are properly encoded
 */
const sanitizeMetadata = (metadata: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  
  // Process each key-value pair in the metadata
  for (const [key, value] of Object.entries(metadata)) {
    if (typeof value === 'string') {
      // Remove non-ASCII characters and normalize strings
      sanitized[key] = value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII
        .trim();
    } else if (value === null || value === undefined) {
      // Skip null or undefined values
      sanitized[key] = '';
    } else if (typeof value === 'object') {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeMetadata(value);
    } else {
      // Keep numbers, booleans as is
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

/**
 * Record a donation on the blockchain
 */
export const recordDonationOnBlockchain = async (
  donorId: string,
  recipientId: string,
  amount: number,
  currency: string,
  donationType: 'campaign' | 'organization',
  metadata: Record<string, any> = {}
): Promise<BlockchainDonationResult> => {
  try {
    // Sanitize the metadata to prevent encoding issues
    const sanitizedMetadata = sanitizeMetadata(metadata);
    
    console.log('Original metadata:', JSON.stringify(metadata));
    console.log('Sanitized metadata:', JSON.stringify(sanitizedMetadata));
    
    const response = await fetch(`${BLOCKCHAIN_API_URL}/donations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': BLOCKCHAIN_API_KEY || '',
      },
      body: JSON.stringify({
        donorId,
        recipientId,
        amount,
        currency,
        donationType,
        metadata: sanitizedMetadata,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error recording donation on blockchain');
    }

    return await response.json();
  } catch (error) {
    console.error('Error recording donation on blockchain:', error);
    throw error;
  }
};

/**
 * Get donation details from the blockchain
 */
export const getDonationFromBlockchain = async (donationId: number): Promise<BlockchainDonation> => {
  try {
    const response = await fetch(`${BLOCKCHAIN_API_URL}/donations/${donationId}`, {
      headers: {
        'X-API-Key': BLOCKCHAIN_API_KEY || '',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error getting donation from blockchain');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting donation from blockchain:', error);
    throw error;
  }
};

/**
 * Get latest donations from the blockchain
 */
export const getLatestDonationsFromBlockchain = async (count: number = 10): Promise<BlockchainDonation[]> => {
  try {
    const response = await fetch(`${BLOCKCHAIN_API_URL}/donations?count=${count}`, {
      headers: {
        'X-API-Key': BLOCKCHAIN_API_KEY || '',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error getting donations from blockchain');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting donations from blockchain:', error);
    throw error;
  }
};

/**
 * Get donation explorer URL for a transaction hash
 */
export const getTransactionExplorerUrl = (txHash: string): string => {
  // If txHash is 'pending', return empty string or placeholder URL
  if (txHash === 'pending') {
    return '#'; // Placeholder URL for pending transactions
  }
  
  // Use network-specific Thirdweb explorer URL format for Holesky testnet
  // Format: https://thirdweb.com/{network}/{contract_address}/{tx_hash}
  const contractAddress = '0x4545484E00e9Ed33c7a46D556F70c77DC1651724'; // From your .env file
  const network = 'holesky';
  
  // Try the direct Etherscan link for Holesky testnet
  return `https://holesky.etherscan.io/tx/${txHash}`;
  
  // If the above doesn't work, try these alternative formats:
  // return `https://thirdweb.com/${network}/tx/${txHash}`;
  // return `https://thirdweb.com/${network}/${contractAddress}/event/${txHash}`;
  // return `https://thirdweb.com/explorer/tx/${txHash}?activeNetwork=${network}`;
};

export default {
  recordDonationOnBlockchain,
  getDonationFromBlockchain,
  getLatestDonationsFromBlockchain,
  getTransactionExplorerUrl,
}; 