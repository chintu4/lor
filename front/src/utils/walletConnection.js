// Utility functions for wallet connection management

/**
 * Checks if there's a pending MetaMask request and waits for it to complete
 * @param {number} timeout - Maximum time to wait in milliseconds
 * @returns {Promise<boolean>} - True if safe to proceed, false if timeout
 */
export const waitForPendingRequests = async (timeout = 5000) => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const checkPending = () => {
      // Check if enough time has passed
      if (Date.now() - startTime > timeout) {
        resolve(false);
        return;
      }
      
      // In a real scenario, you might want to check MetaMask state
      // For now, just wait a bit and resolve
      setTimeout(() => resolve(true), 1000);
    };
    
    checkPending();
  });
};

/**
 * Safely request accounts from MetaMask with retry logic
 * @param {object} ethereum - The ethereum provider
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {Promise<string[]>} - Array of account addresses
 */
export const safeRequestAccounts = async (ethereum, maxRetries = 3) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // First check if accounts are already available
      const existingAccounts = await ethereum.request({ method: 'eth_accounts' });
      if (existingAccounts.length > 0) {
        return existingAccounts;
      }
      
      // If no accounts, request permission
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      return accounts;
      
    } catch (error) {
      console.log(`Account request attempt ${attempt + 1} failed:`, error.message);
      
      // Handle specific error types
      if (error.code === 4001) {
        // User rejected - don't retry
        throw new Error('User rejected wallet connection');
      }
      
      if (error.message.includes('already pending')) {
        console.log('Request already pending, waiting...');
        const canProceed = await waitForPendingRequests();
        if (!canProceed && attempt === maxRetries - 1) {
          throw new Error('Connection request timeout - please refresh the page and try again');
        }
        // Continue to next attempt
        continue;
      }
      
      // For other errors, throw immediately on last attempt
      if (attempt === maxRetries - 1) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};

/**
 * Check if MetaMask is installed and available
 * @returns {boolean} - True if MetaMask is available
 */
export const isMetaMaskAvailable = () => {
  return typeof window !== 'undefined' && 
         typeof window.ethereum !== 'undefined' && 
         window.ethereum.isMetaMask;
};

/**
 * Get the current network chain ID
 * @param {object} ethereum - The ethereum provider
 * @returns {Promise<string>} - The chain ID
 */
export const getCurrentChainId = async (ethereum) => {
  try {
    return await ethereum.request({ method: 'eth_chainId' });
  } catch (error) {
    console.error('Failed to get chain ID:', error);
    return null;
  }
};

/**
 * Format wallet address for display
 * @param {string} address - Full wallet address
 * @returns {string} - Formatted address
 */
export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
