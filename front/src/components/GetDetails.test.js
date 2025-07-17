import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GetDetails from './GetDetails';

describe('GetDetails Component', () => {
  const mockState = {
    provider: {},
    signer: {},
    contract: {
      getStudentDetails: jest.fn()
    }
  };

  const mockStateWithoutContract = {
    provider: {},
    signer: {},
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

  test('renders GetDetails component correctly', () => {
    render(<GetDetails state={mockState} />);
    
    expect(screen.getByText('🔍 Get Recommendation Details')).toBeInTheDocument();
    expect(screen.getByLabelText('Recommendation ID')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Get Details' })).toBeInTheDocument();
  });

  test('displays placeholder text correctly', () => {
    render(<GetDetails state={mockState} />);
    
    expect(screen.getByPlaceholderText('Enter recommendation ID to view details')).toBeInTheDocument();
  });

  test('updates input value when user types', () => {
    render(<GetDetails state={mockState} />);
    
    const idInput = screen.getByLabelText('Recommendation ID');
    fireEvent.change(idInput, { target: { value: '12345' } });

    expect(idInput.value).toBe('12345');
  });

  test('calls contract method with correct parameter', async () => {
    const mockDetails = ['John Doe', 'MIT', 'Computer Science', true];
    mockState.contract.getStudentDetails.mockResolvedValue(mockDetails);

    render(<GetDetails state={mockState} />);
    
    const idInput = screen.getByLabelText('Recommendation ID');
    fireEvent.change(idInput, { target: { value: '12345' } });

    const submitButton = screen.getByRole('button', { name: 'Get Details' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockState.contract.getStudentDetails).toHaveBeenCalledWith('12345');
    });
  });

  test('displays details after successful fetch - approved recommendation', async () => {
    const mockDetails = ['John Doe', 'MIT', 'Computer Science', true];
    mockState.contract.getStudentDetails.mockResolvedValue(mockDetails);

    render(<GetDetails state={mockState} />);
    
    const idInput = screen.getByLabelText('Recommendation ID');
    fireEvent.change(idInput, { target: { value: '12345' } });

    const submitButton = screen.getByRole('button', { name: 'Get Details' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('📋 Recommendation Details')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('MIT')).toBeInTheDocument();
      expect(screen.getByText('Computer Science')).toBeInTheDocument();
      expect(screen.getByText('✅ Approved')).toBeInTheDocument();
    });
  });

  test('displays details after successful fetch - pending recommendation', async () => {
    const mockDetails = ['Jane Smith', 'Stanford', 'Data Science', false];
    mockState.contract.getStudentDetails.mockResolvedValue(mockDetails);

    render(<GetDetails state={mockState} />);
    
    const idInput = screen.getByLabelText('Recommendation ID');
    fireEvent.change(idInput, { target: { value: '67890' } });

    const submitButton = screen.getByRole('button', { name: 'Get Details' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('📋 Recommendation Details')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Stanford')).toBeInTheDocument();
      expect(screen.getByText('Data Science')).toBeInTheDocument();
      expect(screen.getByText('⏳ Pending Approval')).toBeInTheDocument();
    });
  });

  test('handles contract error gracefully', async () => {
    const mockError = new Error('Contract call failed');
    mockState.contract.getStudentDetails.mockRejectedValue(mockError);

    render(<GetDetails state={mockState} />);
    
    const idInput = screen.getByLabelText('Recommendation ID');
    fireEvent.change(idInput, { target: { value: '12345' } });

    const submitButton = screen.getByRole('button', { name: 'Get Details' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith(mockError);
    });

    // Details should not be displayed
    expect(screen.queryByText('📋 Recommendation Details')).not.toBeInTheDocument();
  });

  test('handles null state gracefully', async () => {
    render(<GetDetails state={null} />);
    // Should show the not connected message and not render the form
    expect(screen.getByText(/Contract not initialized/i)).toBeInTheDocument();
  });

  test('handles state without contract gracefully', async () => {
    render(<GetDetails state={mockStateWithoutContract} />);
    // Should show the not connected message and not render the form
    expect(screen.getByText(/Contract not initialized/i)).toBeInTheDocument();
  });

  test('does not display details initially', () => {
    render(<GetDetails state={mockState} />);
    
    expect(screen.queryByText('📋 Recommendation Details')).not.toBeInTheDocument();
    expect(screen.queryByText('👤 Student Name:')).not.toBeInTheDocument();
  });

  test('clears and displays new details when different ID is fetched', async () => {
    const mockDetails1 = ['John Doe', 'MIT', 'Computer Science', true];
    const mockDetails2 = ['Jane Smith', 'Stanford', 'Data Science', false];
    
    mockState.contract.getStudentDetails
      .mockResolvedValueOnce(mockDetails1)
      .mockResolvedValueOnce(mockDetails2);

    render(<GetDetails state={mockState} />);
    
    // First fetch
    const idInput = screen.getByLabelText('Recommendation ID');
    fireEvent.change(idInput, { target: { value: '12345' } });

    let submitButton = screen.getByRole('button', { name: 'Get Details' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('✅ Approved')).toBeInTheDocument();
    });

    // Second fetch
    fireEvent.change(idInput, { target: { value: '67890' } });
    submitButton = screen.getByRole('button', { name: 'Get Details' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('⏳ Pending Approval')).toBeInTheDocument();
    });

    // Should not show first details anymore
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  test('displays correct labels for all fields', async () => {
    const mockDetails = ['John Doe', 'MIT', 'Computer Science', true];
    mockState.contract.getStudentDetails.mockResolvedValue(mockDetails);

    render(<GetDetails state={mockState} />);
    
    const idInput = screen.getByLabelText('Recommendation ID');
    fireEvent.change(idInput, { target: { value: '12345' } });

    const submitButton = screen.getByRole('button', { name: 'Get Details' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('👤 Student Name:')).toBeInTheDocument();
      expect(screen.getByText('🏫 University:')).toBeInTheDocument();
      expect(screen.getByText('📚 Program:')).toBeInTheDocument();
      expect(screen.getByText('📋 Status:')).toBeInTheDocument();
    });
  });

  test('result card has correct styling classes', async () => {
    const mockDetails = ['John Doe', 'MIT', 'Computer Science', true];
    mockState.contract.getStudentDetails.mockResolvedValue(mockDetails);

    render(<GetDetails state={mockState} />);
    
    const idInput = screen.getByLabelText('Recommendation ID');
    fireEvent.change(idInput, { target: { value: '12345' } });

    const submitButton = screen.getByRole('button', { name: 'Get Details' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const resultCard = screen.getByText('📋 Recommendation Details').closest('div');
      expect(resultCard).toHaveClass('result-card');
    });
  });

  test('status has correct CSS class for approved', async () => {
    const mockDetails = ['John Doe', 'MIT', 'Computer Science', true];
    mockState.contract.getStudentDetails.mockResolvedValue(mockDetails);

    render(<GetDetails state={mockState} />);
    
    const idInput = screen.getByLabelText('Recommendation ID');
    fireEvent.change(idInput, { target: { value: '12345' } });

    const submitButton = screen.getByRole('button', { name: 'Get Details' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const statusElement = screen.getByText('✅ Approved');
      expect(statusElement).toHaveClass('status-approved');
    });
  });

  test('status has correct CSS class for pending', async () => {
    const mockDetails = ['Jane Smith', 'Stanford', 'Data Science', false];
    mockState.contract.getStudentDetails.mockResolvedValue(mockDetails);

    render(<GetDetails state={mockState} />);
    
    const idInput = screen.getByLabelText('Recommendation ID');
    fireEvent.change(idInput, { target: { value: '67890' } });

    const submitButton = screen.getByRole('button', { name: 'Get Details' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const statusElement = screen.getByText('⏳ Pending Approval');
      expect(statusElement).toHaveClass('status-pending');
    });
  });

  test('input field has correct attributes', () => {
    render(<GetDetails state={mockState} />);
    
    const idInput = screen.getByLabelText('Recommendation ID');
    expect(idInput).toHaveAttribute('type', 'text');
    expect(idInput).toHaveClass('form-input');
    expect(idInput).toHaveAttribute('placeholder', 'Enter recommendation ID to view details');
  });

  test('button has correct classes', () => {
    render(<GetDetails state={mockState} />);
    
    const button = screen.getByRole('button', { name: 'Get Details' });
    expect(button).toHaveClass('btn', 'btn-info');
  });

  test('handles empty result from contract', async () => {
    mockState.contract.getStudentDetails.mockResolvedValue(null);

    render(<GetDetails state={mockState} />);
    
    const idInput = screen.getByLabelText('Recommendation ID');
    fireEvent.change(idInput, { target: { value: '12345' } });

    const submitButton = screen.getByRole('button', { name: 'Get Details' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockState.contract.getStudentDetails).toHaveBeenCalledWith('12345');
    });

    // Should not display details for null result
    expect(screen.queryByText('📋 Recommendation Details')).not.toBeInTheDocument();
  });

  test('can handle very long strings in details', async () => {
    const mockDetails = [
      'John Doe with a very long name that might wrap to multiple lines',
      'Massachusetts Institute of Technology and Other Very Long University Names',
      'Computer Science and Engineering with specialization in Artificial Intelligence',
      true
    ];
    mockState.contract.getStudentDetails.mockResolvedValue(mockDetails);

    render(<GetDetails state={mockState} />);
    
    const idInput = screen.getByLabelText('Recommendation ID');
    fireEvent.change(idInput, { target: { value: '12345' } });

    const submitButton = screen.getByRole('button', { name: 'Get Details' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('John Doe with a very long name that might wrap to multiple lines')).toBeInTheDocument();
      expect(screen.getByText('Massachusetts Institute of Technology and Other Very Long University Names')).toBeInTheDocument();
      expect(screen.getByText('Computer Science and Engineering with specialization in Artificial Intelligence')).toBeInTheDocument();
    });
  });

  test('calls contract method and displays details', async () => {
    mockState.contract.getStudentDetails.mockResolvedValue([
      'Alice',
      'Test University',
      'Computer Science',
      true
    ]);

    render(<GetDetails state={mockState} />);
    const input = screen.getByLabelText('Recommendation ID');
    fireEvent.change(input, { target: { value: '123' } });

    fireEvent.click(screen.getByRole('button', { name: /get details/i }));

    await waitFor(() => {
      expect(mockState.contract.getStudentDetails).toHaveBeenCalledWith('123');
      expect(screen.getByText(/Alice/)).toBeInTheDocument();
      expect(screen.getByText(/Test University/)).toBeInTheDocument();
      expect(screen.getByText(/Computer Science/)).toBeInTheDocument();
      expect(screen.getByText(/Approved/)).toBeInTheDocument();
    });
  });

  test('handles contract error gracefully', async () => {
    mockState.contract.getStudentDetails.mockRejectedValue(new Error('Contract error'));
    render(<GetDetails state={mockState} />);
    const input = screen.getByLabelText('Recommendation ID');
    fireEvent.change(input, { target: { value: '123' } });

    fireEvent.click(screen.getByRole('button', { name: /get details/i }));

    await waitFor(() => {
      expect(mockState.contract.getStudentDetails).toHaveBeenCalledWith('123');
      // Only the result card should not be present, not the static heading
      expect(screen.queryByText('📋 Recommendation Details')).not.toBeInTheDocument();
    });
  });
});
