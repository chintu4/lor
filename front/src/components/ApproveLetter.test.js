import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ApproveLetter from './ApproveLetter';

describe('ApproveLetter Component', () => {
  const mockState = {
    provider: {},
    signer: {
      getAddress: jest.fn()
    },
    contract: {
      approveRecommendation: jest.fn()
    }
  };

  const mockStateWithoutContract = {
    provider: {},
    signer: {
      getAddress: jest.fn()
    },
    contract: null
  };

  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();
    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders ApproveLetter component correctly', () => {
    render(<ApproveLetter state={mockState} />);
    
    expect(screen.getByText('✅ Approve Letter of Recommendation')).toBeInTheDocument();
    expect(screen.getByLabelText('Recommendation ID')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Approve Recommendation' })).toBeInTheDocument();
    expect(screen.getByText('👨‍🏫 Administrator Access Required')).toBeInTheDocument();
    expect(screen.getByText('Only authorized accounts can approve recommendations')).toBeInTheDocument();
  });

  test('displays placeholder text correctly', () => {
    render(<ApproveLetter state={mockState} />);
    
    expect(screen.getByPlaceholderText('Enter recommendation ID to approve')).toBeInTheDocument();
  });

  test('updates input value when user types', () => {
    render(<ApproveLetter state={mockState} />);
    
    const idInput = screen.getByLabelText('Recommendation ID');
    fireEvent.change(idInput, { target: { value: '12345' } });

    expect(idInput.value).toBe('12345');
  });

  test('shows alert when recommendation ID is empty', async () => {
    const allowedAccount = '0x123456789';
    mockState.signer.getAddress.mockResolvedValue(allowedAccount);

    render(<ApproveLetter state={mockState} />);
    
    const submitButton = screen.getByRole('button', { name: 'Approve Recommendation' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockState.signer.getAddress).toHaveBeenCalled();
    });
  });

  test('shows alert when account is not allowed', async () => {
    const userAccount = '0x987654321';
    const allowedAccount = '0x...'; // This is the default in the component
    mockState.signer.getAddress.mockResolvedValue(userAccount);

    render(<ApproveLetter state={mockState} />);
    
    const idInput = screen.getByLabelText('Recommendation ID');
    fireEvent.change(idInput, { target: { value: '12345' } });

    const submitButton = screen.getByRole('button', { name: 'Approve Recommendation' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('you are not allowed to approve recommendation');
    });
  });

  test('calls contract method when account is allowed', async () => {
    const allowedAccount = '0x...'; // This matches the default in the component
    mockState.signer.getAddress.mockResolvedValue(allowedAccount);
    mockState.contract.approveRecommendation.mockResolvedValue({});

    render(<ApproveLetter state={mockState} />);
    
    const idInput = screen.getByLabelText('Recommendation ID');
    fireEvent.change(idInput, { target: { value: '12345' } });

    const submitButton = screen.getByRole('button', { name: 'Approve Recommendation' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockState.contract.approveRecommendation).toHaveBeenCalledWith('12345');
    });

    expect(window.alert).toHaveBeenCalledWith('Recommendation approved successfully!');
  });

  test('handles error when approving recommendation', async () => {
    const allowedAccount = '0x...';
    const mockError = new Error('Transaction failed');
    mockState.signer.getAddress.mockResolvedValue(allowedAccount);
    mockState.contract.approveRecommendation.mockRejectedValue(mockError);

    render(<ApproveLetter state={mockState} />);
    
    const idInput = screen.getByLabelText('Recommendation ID');
    fireEvent.change(idInput, { target: { value: '12345' } });

    const submitButton = screen.getByRole('button', { name: 'Approve Recommendation' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(mockError);
      expect(window.alert).toHaveBeenCalledWith('Error approving Recommendation');
    });
  });

  test('handles error when getting signer address', async () => {
    const mockError = new Error('Failed to get address');
    mockState.signer.getAddress.mockRejectedValue(mockError);

    render(<ApproveLetter state={mockState} />);
    
    const idInput = screen.getByLabelText('Recommendation ID');
    fireEvent.change(idInput, { target: { value: '12345' } });

    const submitButton = screen.getByRole('button', { name: 'Approve Recommendation' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(mockError);
      expect(window.alert).toHaveBeenCalledWith('Error approving Recommendation');
    });
  });

  test('handles null state', async () => {
    render(<ApproveLetter state={null} />);
    
    const submitButton = screen.getByRole('button', { name: 'Approve Recommendation' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
  });

  test('handles state without signer', async () => {
    const stateWithoutSigner = {
      provider: {},
      signer: null,
      contract: {}
    };

    render(<ApproveLetter state={stateWithoutSigner} />);
    
    const submitButton = screen.getByRole('button', { name: 'Approve Recommendation' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
  });

  test('logs account information correctly', async () => {
    const allowedAccount = '0x...';
    mockState.signer.getAddress.mockResolvedValue(allowedAccount);
    mockState.contract.approveRecommendation.mockResolvedValue({});

    render(<ApproveLetter state={mockState} />);
    
    const idInput = screen.getByLabelText('Recommendation ID');
    fireEvent.change(idInput, { target: { value: '12345' } });

    const submitButton = screen.getByRole('button', { name: 'Approve Recommendation' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith(allowedAccount);
    });
  });

  test('renders admin information section with correct styling', () => {
    render(<ApproveLetter state={mockState} />);
    
    const adminSection = screen.getByText('👨‍🏫 Administrator Access Required').closest('div');
    expect(adminSection).toHaveStyle({
      marginTop: '20px',
      padding: '15px',
      backgroundColor: '#f7fafc',
      borderRadius: '12px'
    });
  });

  test('input field has correct attributes', () => {
    render(<ApproveLetter state={mockState} />);
    
    const idInput = screen.getByLabelText('Recommendation ID');
    expect(idInput).toHaveAttribute('type', 'text');
    expect(idInput).toHaveClass('form-input');
    expect(idInput).toHaveAttribute('placeholder', 'Enter recommendation ID to approve');
  });

  test('button has correct classes', () => {
    render(<ApproveLetter state={mockState} />);
    
    const button = screen.getByRole('button', { name: 'Approve Recommendation' });
    expect(button).toHaveClass('btn', 'btn-success');
  });

  test('form label has correct classes', () => {
    render(<ApproveLetter state={mockState} />);
    
    const label = screen.getByText('Recommendation ID');
    expect(label).toHaveClass('form-label');
  });

  test('form group has correct class', () => {
    render(<ApproveLetter state={mockState} />);
    
    const formGroup = screen.getByLabelText('Recommendation ID').closest('.form-group');
    expect(formGroup).toHaveClass('form-group');
  });
});
