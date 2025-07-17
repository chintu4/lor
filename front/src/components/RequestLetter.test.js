import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RequestLetter from './RequestLetter';

// Mock ethers
jest.mock('ethers', () => ({
  ethers: {
    Contract: jest.fn()
  }
}));

describe('RequestLetter Component', () => {
  const mockState = {
    provider: {},
    signer: {},
    contract: {
      requestRecommendation: jest.fn()
    }
  };

  const mockStateWithoutContract = {
    provider: {},
    signer: {},
    contract: null
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.alert
    window.alert = jest.fn();
    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders RequestLetter component correctly', () => {
    render(<RequestLetter state={mockState} />);
    
    expect(screen.getByText('📝 Request Letter of Recommendation')).toBeInTheDocument();
    expect(screen.getByLabelText('Student Name')).toBeInTheDocument();
    expect(screen.getByLabelText('University')).toBeInTheDocument();
    expect(screen.getByLabelText('Program')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Request Recommendation' })).toBeInTheDocument();
  });

  test('displays placeholder texts correctly', () => {
    render(<RequestLetter state={mockState} />);
    
    expect(screen.getByPlaceholderText('Enter your full name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter university name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter program/course name')).toBeInTheDocument();
  });

  test('updates input values when user types', () => {
    render(<RequestLetter state={mockState} />);
    
    const nameInput = screen.getByLabelText('Student Name');
    const universityInput = screen.getByLabelText('University');
    const programInput = screen.getByLabelText('Program');

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(universityInput, { target: { value: 'MIT' } });
    fireEvent.change(programInput, { target: { value: 'Computer Science' } });

    expect(nameInput.value).toBe('John Doe');
    expect(universityInput.value).toBe('MIT');
    expect(programInput.value).toBe('Computer Science');
  });

  test('shows alert when form fields are empty', () => {
    render(<RequestLetter state={mockState} />);
    
    const submitButton = screen.getByRole('button', { name: 'Request Recommendation' });
    fireEvent.click(submitButton);

    expect(window.alert).toHaveBeenCalledWith('Please fill in all fields');
  });

  test('shows alert when only some fields are filled', () => {
    render(<RequestLetter state={mockState} />);
    
    const nameInput = screen.getByLabelText('Student Name');
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });

    const submitButton = screen.getByRole('button', { name: 'Request Recommendation' });
    fireEvent.click(submitButton);

    expect(window.alert).toHaveBeenCalledWith('Please fill in all fields');
  });

  test('shows alert when contract is not initialized', () => {
    render(<RequestLetter state={mockStateWithoutContract} />);
    
    // Fill in all fields
    const nameInput = screen.getByLabelText('Student Name');
    const universityInput = screen.getByLabelText('University');
    const programInput = screen.getByLabelText('Program');

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(universityInput, { target: { value: 'MIT' } });
    fireEvent.change(programInput, { target: { value: 'Computer Science' } });

    const submitButton = screen.getByRole('button', { name: 'Request Recommendation' });
    fireEvent.click(submitButton);

    expect(window.alert).toHaveBeenCalledWith('Contract not initialized. Please make sure your wallet is connected and the contract address is set.');
  });

  test('shows alert when state is null', () => {
    render(<RequestLetter state={null} />);
    
    // Fill in all fields
    const nameInput = screen.getByLabelText('Student Name');
    const universityInput = screen.getByLabelText('University');
    const programInput = screen.getByLabelText('Program');

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(universityInput, { target: { value: 'MIT' } });
    fireEvent.change(programInput, { target: { value: 'Computer Science' } });

    const submitButton = screen.getByRole('button', { name: 'Request Recommendation' });
    fireEvent.click(submitButton);

    expect(window.alert).toHaveBeenCalledWith('Contract not initialized. Please make sure your wallet is connected and the contract address is set.');
  });

  test('calls contract method with correct parameters on successful submission', async () => {
    const mockTransaction = {
      hash: '0x123456',
      wait: jest.fn().mockResolvedValue({
        logs: []
      })
    };
    
    mockState.contract.requestRecommendation.mockResolvedValue(mockTransaction);

    render(<RequestLetter state={mockState} />);
    
    // Fill in all fields
    const nameInput = screen.getByLabelText('Student Name');
    const universityInput = screen.getByLabelText('University');
    const programInput = screen.getByLabelText('Program');

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(universityInput, { target: { value: 'MIT' } });
    fireEvent.change(programInput, { target: { value: 'Computer Science' } });

    const submitButton = screen.getByRole('button', { name: 'Request Recommendation' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockState.contract.requestRecommendation).toHaveBeenCalledWith('John Doe', 'MIT', 'Computer Science');
    });
  });

  test('displays recommendation ID after successful submission', async () => {
    const mockTransaction = {
      hash: '0x123456789',
      wait: jest.fn().mockResolvedValue({
        logs: [{
          args: ['12345']
        }]
      })
    };
    
    mockState.contract.requestRecommendation.mockResolvedValue(mockTransaction);

    render(<RequestLetter state={mockState} />);
    
    // Fill in all fields
    const nameInput = screen.getByLabelText('Student Name');
    const universityInput = screen.getByLabelText('University');
    const programInput = screen.getByLabelText('Program');

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(universityInput, { target: { value: 'MIT' } });
    fireEvent.change(programInput, { target: { value: 'Computer Science' } });

    const submitButton = screen.getByRole('button', { name: 'Request Recommendation' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('🎉 Recommendation ID: 12345')).toBeInTheDocument();
    });

    expect(window.alert).toHaveBeenCalledWith('Recommendation requested successfully!');
  });

  test('handles transaction rejection by user', async () => {
    const mockError = { code: 4001 };
    mockState.contract.requestRecommendation.mockRejectedValue(mockError);

    render(<RequestLetter state={mockState} />);
    
    // Fill in all fields
    const nameInput = screen.getByLabelText('Student Name');
    const universityInput = screen.getByLabelText('University');
    const programInput = screen.getByLabelText('Program');

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(universityInput, { target: { value: 'MIT' } });
    fireEvent.change(programInput, { target: { value: 'Computer Science' } });

    const submitButton = screen.getByRole('button', { name: 'Request Recommendation' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Transaction rejected by user');
    });
  });

  test('handles JSON-RPC error', async () => {
    const mockError = { code: -32603 };
    mockState.contract.requestRecommendation.mockRejectedValue(mockError);

    render(<RequestLetter state={mockState} />);
    
    // Fill in all fields
    const nameInput = screen.getByLabelText('Student Name');
    const universityInput = screen.getByLabelText('University');
    const programInput = screen.getByLabelText('Program');

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(universityInput, { target: { value: 'MIT' } });
    fireEvent.change(programInput, { target: { value: 'Computer Science' } });

    const submitButton = screen.getByRole('button', { name: 'Request Recommendation' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Internal JSON-RPC error. Check your contract address and network.');
    });
  });

  test('handles insufficient funds error', async () => {
    const mockError = { message: 'insufficient funds for gas fees' };
    mockState.contract.requestRecommendation.mockRejectedValue(mockError);

    render(<RequestLetter state={mockState} />);
    
    // Fill in all fields
    const nameInput = screen.getByLabelText('Student Name');
    const universityInput = screen.getByLabelText('University');
    const programInput = screen.getByLabelText('Program');

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(universityInput, { target: { value: 'MIT' } });
    fireEvent.change(programInput, { target: { value: 'Computer Science' } });

    const submitButton = screen.getByRole('button', { name: 'Request Recommendation' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Insufficient funds for gas fees');
    });
  });

  test('handles execution reverted error', async () => {
    const mockError = { 
      message: 'execution reverted: Custom error message',
      reason: 'Custom error message'
    };
    mockState.contract.requestRecommendation.mockRejectedValue(mockError);

    render(<RequestLetter state={mockState} />);
    
    // Fill in all fields
    const nameInput = screen.getByLabelText('Student Name');
    const universityInput = screen.getByLabelText('University');
    const programInput = screen.getByLabelText('Program');

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(universityInput, { target: { value: 'MIT' } });
    fireEvent.change(programInput, { target: { value: 'Computer Science' } });

    const submitButton = screen.getByRole('button', { name: 'Request Recommendation' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Transaction failed: Custom error message');
    });
  });

  test('handles generic error', async () => {
    const mockError = { message: 'Generic error occurred' };
    mockState.contract.requestRecommendation.mockRejectedValue(mockError);

    render(<RequestLetter state={mockState} />);
    
    // Fill in all fields
    const nameInput = screen.getByLabelText('Student Name');
    const universityInput = screen.getByLabelText('University');
    const programInput = screen.getByLabelText('Program');

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(universityInput, { target: { value: 'MIT' } });
    fireEvent.change(programInput, { target: { value: 'Computer Science' } });

    const submitButton = screen.getByRole('button', { name: 'Request Recommendation' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Error Requesting recommendation: Generic error occurred');
    });
  });

  test('uses transaction hash as fallback ID when no logs are present', async () => {
    const mockTransaction = {
      hash: '0xfallbackhash',
      wait: jest.fn().mockResolvedValue({
        logs: []
      })
    };
    
    mockState.contract.requestRecommendation.mockResolvedValue(mockTransaction);

    render(<RequestLetter state={mockState} />);
    
    // Fill in all fields
    const nameInput = screen.getByLabelText('Student Name');
    const universityInput = screen.getByLabelText('University');
    const programInput = screen.getByLabelText('Program');

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(universityInput, { target: { value: 'MIT' } });
    fireEvent.change(programInput, { target: { value: 'Computer Science' } });

    const submitButton = screen.getByRole('button', { name: 'Request Recommendation' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('🎉 Recommendation ID: 0xfallbackhash')).toBeInTheDocument();
    });
  });

  test('does not display recommendation ID initially', () => {
    render(<RequestLetter state={mockState} />);
    
    expect(screen.queryByText(/Recommendation ID:/)).not.toBeInTheDocument();
  });

  test('logs correct information to console during submission', async () => {
    const mockTransaction = {
      hash: '0x123456',
      wait: jest.fn().mockResolvedValue({
        logs: []
      })
    };
    
    mockState.contract.requestRecommendation.mockResolvedValue(mockTransaction);

    render(<RequestLetter state={mockState} />);
    
    // Fill in all fields
    const nameInput = screen.getByLabelText('Student Name');
    const universityInput = screen.getByLabelText('University');
    const programInput = screen.getByLabelText('Program');

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(universityInput, { target: { value: 'MIT' } });
    fireEvent.change(programInput, { target: { value: 'Computer Science' } });

    const submitButton = screen.getByRole('button', { name: 'Request Recommendation' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith('Requesting recommendation with:', { 
        name: 'John Doe', 
        university: 'MIT', 
        program: 'Computer Science' 
      });
      expect(console.log).toHaveBeenCalledWith('Contract:', mockState.contract);
      expect(console.log).toHaveBeenCalledWith('Transaction sent:', mockTransaction);
    });
  });
});
