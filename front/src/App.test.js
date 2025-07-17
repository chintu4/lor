import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock the ethers library
jest.mock('ethers', () => ({
  ethers: {
    BrowserProvider: jest.fn(),
    Contract: jest.fn()
  }
}));

// Mock the child components
jest.mock('./components/RequestLetter.js', () => {
  return function RequestLetter({ state }) {
    return (
      <div data-testid="request-letter">
        RequestLetter Component - Contract: {state?.contract ? 'Connected' : 'Not Connected'}
      </div>
    );
  };
});

jest.mock('./components/ApproveLetter.js', () => {
  return function ApproveLetter({ state }) {
    return (
      <div data-testid="approve-letter">
        ApproveLetter Component - Contract: {state?.contract ? 'Connected' : 'Not Connected'}
      </div>
    );
  };
});

jest.mock('./components/GetDetails.js', () => {
  return function GetDetails({ state }) {
    return (
      <div data-testid="get-details">
        GetDetails Component - Contract: {state?.contract ? 'Connected' : 'Not Connected'}
      </div>
    );
  };
});

// Mock the ABI import
jest.mock('./contracts/LOR.json', () => ({
  abi: [
    {
      "inputs": [],
      "name": "test",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
}));

describe('App Component', () => {
  const mockEthereum = {
    request: jest.fn(),
    on: jest.fn(),
    removeListener: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
    
    // Reset ethereum mock
    Object.defineProperty(window, 'ethereum', {
      value: mockEthereum,
      writable: true
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders App component with correct structure', () => {
    render(<App />);
    
    expect(screen.getByText('Letter of Recommendation System')).toBeInTheDocument();
    expect(screen.getByText('Blockchain-powered academic recommendation management')).toBeInTheDocument();
    expect(screen.getByTestId('request-letter')).toBeInTheDocument();
    expect(screen.getByTestId('approve-letter')).toBeInTheDocument();
    expect(screen.getByTestId('get-details')).toBeInTheDocument();
  });

  test('has correct CSS classes on main elements', () => {
    render(<App />);
    
    const appContainer = screen.getByText('Letter of Recommendation System').closest('.app-container');
    expect(appContainer).toBeInTheDocument();
    
    const appHeader = screen.getByText('Letter of Recommendation System').closest('.app-header');
    expect(appHeader).toBeInTheDocument();
    
    const componentsGrid = screen.getByTestId('request-letter').closest('.components-grid');
    expect(componentsGrid).toBeInTheDocument();
  });

  test('renders component cards with correct classes', () => {
    render(<App />);
    
    const requestCard = screen.getByTestId('request-letter').closest('.component-card');
    const approveCard = screen.getByTestId('approve-letter').closest('.component-card');
    const detailsCard = screen.getByTestId('get-details').closest('.component-card');
    
    expect(requestCard).toHaveClass('component-card');
    expect(approveCard).toHaveClass('component-card');
    expect(detailsCard).toHaveClass('component-card');
  });

  test('shows alert when MetaMask is not installed', async () => {
    // Remove ethereum from window
    delete window.ethereum;
    
    render(<App />);
    
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Please install Metamask');
    });
  });

  test('handles wallet connection error', async () => {
    const mockError = new Error('User rejected request');
    mockEthereum.request.mockRejectedValue(mockError);
    
    render(<App />);
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Wallet connection error:', mockError);
      expect(window.alert).toHaveBeenCalledWith('Failed to connect wallet: User rejected request');
    });
  });

  test('handles successful wallet connection with valid contract', async () => {
    const { ethers } = require('ethers');
    const mockAccount = '0x123456789abcdef';
    const mockProvider = {
      getCode: jest.fn().mockResolvedValue('0x608060405234801561001057600080fd5b50') // Non-empty bytecode
    };
    const mockSigner = {
      getAddress: jest.fn().mockResolvedValue(mockAccount)
    };
    const mockContract = {};

    mockEthereum.request
      .mockResolvedValueOnce('0x7a69') // Chain ID
      .mockResolvedValueOnce([mockAccount]); // Account request

    ethers.BrowserProvider.mockReturnValue(mockProvider);
    mockProvider.getSigner = jest.fn().mockResolvedValue(mockSigner);
    ethers.Contract.mockReturnValue(mockContract);

    render(<App />);

    await waitFor(() => {
      expect(mockEthereum.request).toHaveBeenCalledWith({ method: 'eth_chainId' });
      expect(mockEthereum.request).toHaveBeenCalledWith({ method: 'eth_requestAccounts' });
      expect(ethers.BrowserProvider).toHaveBeenCalledWith(window.ethereum);
      expect(mockProvider.getSigner).toHaveBeenCalled();
    });
  });

  test('handles contract not found at address', async () => {
    const { ethers } = require('ethers');
    const mockAccount = '0x123456789abcdef';
    const mockProvider = {
      getCode: jest.fn().mockResolvedValue('0x') // Empty bytecode means no contract
    };
    const mockSigner = {};

    mockEthereum.request
      .mockResolvedValueOnce('0x7a69')
      .mockResolvedValueOnce([mockAccount]);

    ethers.BrowserProvider.mockReturnValue(mockProvider);
    mockProvider.getSigner = jest.fn().mockResolvedValue(mockSigner);

    render(<App />);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Contract connection error:', expect.any(Error));
      expect(window.alert).toHaveBeenCalledWith('Failed to connect to contract. Please check the contract address and network.');
    });
  });

  test('logs chain ID correctly', async () => {
    const { ethers } = require('ethers');
    const mockAccount = '0x123456789abcdef';
    const chainId = '0x7a69'; // Localhost chain ID
    const mockProvider = {
      getCode: jest.fn().mockResolvedValue('0x608060405234801561001057600080fd5b50')
    };
    const mockSigner = {};

    mockEthereum.request
      .mockResolvedValueOnce(chainId)
      .mockResolvedValueOnce([mockAccount]);

    ethers.BrowserProvider.mockReturnValue(mockProvider);
    mockProvider.getSigner = jest.fn().mockResolvedValue(mockSigner);

    render(<App />);

    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith('Current chain ID:', chainId);
      expect(console.log).toHaveBeenCalledWith('Connected account:', mockAccount);
    });
  });

  test('passes state correctly to child components', async () => {
    const { ethers } = require('ethers');
    const mockAccount = '0x123456789abcdef';
    const mockProvider = {
      getCode: jest.fn().mockResolvedValue('0x608060405234801561001057600080fd5b50')
    };
    const mockSigner = {};
    const mockContract = {};

    mockEthereum.request
      .mockResolvedValueOnce('0x7a69')
      .mockResolvedValueOnce([mockAccount]);

    ethers.BrowserProvider.mockReturnValue(mockProvider);
    mockProvider.getSigner = jest.fn().mockResolvedValue(mockSigner);
    ethers.Contract.mockReturnValue(mockContract);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Contract: Connected/)).toBeInTheDocument();
    });
  });

  test('initializes with null contract state', () => {
    // Don't provide ethereum object to test initial state
    delete window.ethereum;
    
    render(<App />);
    
    expect(screen.getByText(/Contract: Not Connected/)).toBeInTheDocument();
  });

  test('handles provider creation error', async () => {
    const { ethers } = require('ethers');
    const mockAccount = '0x123456789abcdef';
    const providerError = new Error('Provider creation failed');

    mockEthereum.request
      .mockResolvedValueOnce('0x7a69')
      .mockResolvedValueOnce([mockAccount]);

    ethers.BrowserProvider.mockImplementation(() => {
      throw providerError;
    });

    render(<App />);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Wallet connection error:', providerError);
      expect(window.alert).toHaveBeenCalledWith('Failed to connect wallet: Provider creation failed');
    });
  });

  test('validates contract address is not empty', async () => {
    // This test checks that the hardcoded address in the component is not empty
    const { ethers } = require('ethers');
    const mockAccount = '0x123456789abcdef';
    const mockProvider = {
      getCode: jest.fn().mockResolvedValue('0x608060405234801561001057600080fd5b50')
    };

    mockEthereum.request
      .mockResolvedValueOnce('0x7a69')
      .mockResolvedValueOnce([mockAccount]);

    ethers.BrowserProvider.mockReturnValue(mockProvider);

    render(<App />);

    await waitFor(() => {
      // The contract should be created with the hardcoded address
      expect(ethers.Contract).toHaveBeenCalledWith(
        '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
        expect.any(Array),
        expect.any(Object)
      );
    });
  });
});
