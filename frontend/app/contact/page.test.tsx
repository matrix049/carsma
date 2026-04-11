import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ContactPage from './page';
import { createContactMessage } from '@/lib/apiServices';

// Mock dependencies
jest.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

jest.mock('@/lib/apiServices', () => ({
  createContactMessage: jest.fn(),
}));

const mockCreateContactMessage = createContactMessage as jest.MockedFunction<typeof createContactMessage>;

describe('ContactPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the contact form', () => {
    render(<ContactPage />);
    expect(screen.getByPlaceholderText('e.g. Adam Benz')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('adam@benz.ma')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Describe your vision or inquiry details...')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<ContactPage />);
    const submitButton = screen.getByRole('button', { name: /sendMessage/i });
    
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Message is required')).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    render(<ContactPage />);
    const nameInput = screen.getByPlaceholderText('e.g. Adam Benz');
    const emailInput = screen.getByPlaceholderText('adam@benz.ma');
    const messageInput = screen.getByPlaceholderText('Describe your vision or inquiry details...');
    const submitButton = screen.getByRole('button', { name: /sendMessage/i });
    
    // Fill in name and message with valid data, but email with invalid format
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(messageInput, { target: { value: 'This is a valid message with more than 10 characters' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please provide a valid email address')).toBeInTheDocument();
    });
  });

  it('validates message minimum length', async () => {
    render(<ContactPage />);
    const messageInput = screen.getByPlaceholderText('Describe your vision or inquiry details...');
    const submitButton = screen.getByRole('button', { name: /sendMessage/i });
    
    fireEvent.change(messageInput, { target: { value: 'Short' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Message must be at least 10 characters')).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    mockCreateContactMessage.mockResolvedValue({
      success: true,
      message: 'Message sent successfully',
    });

    render(<ContactPage />);
    
    const nameInput = screen.getByPlaceholderText('e.g. Adam Benz');
    const emailInput = screen.getByPlaceholderText('adam@benz.ma');
    const messageInput = screen.getByPlaceholderText('Describe your vision or inquiry details...');
    const submitButton = screen.getByRole('button', { name: /sendMessage/i });
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(messageInput, { target: { value: 'This is a test message with more than 10 characters' } });
    
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockCreateContactMessage).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'This is a test message with more than 10 characters',
      });
    });
  });

  it('displays success message and clears form on successful submission', async () => {
    mockCreateContactMessage.mockResolvedValue({
      success: true,
      message: 'Message sent successfully',
    });

    render(<ContactPage />);
    
    const nameInput = screen.getByPlaceholderText('e.g. Adam Benz') as HTMLInputElement;
    const emailInput = screen.getByPlaceholderText('adam@benz.ma') as HTMLInputElement;
    const messageInput = screen.getByPlaceholderText('Describe your vision or inquiry details...') as HTMLTextAreaElement;
    const submitButton = screen.getByRole('button', { name: /sendMessage/i });
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(messageInput, { target: { value: 'This is a test message' } });
    
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Message sent successfully')).toBeInTheDocument();
      expect(nameInput.value).toBe('');
      expect(emailInput.value).toBe('');
      expect(messageInput.value).toBe('');
    });
  });

  it('displays error message and maintains form data on failure', async () => {
    mockCreateContactMessage.mockRejectedValue(new Error('Network error'));

    render(<ContactPage />);
    
    const nameInput = screen.getByPlaceholderText('e.g. Adam Benz') as HTMLInputElement;
    const emailInput = screen.getByPlaceholderText('adam@benz.ma') as HTMLInputElement;
    const messageInput = screen.getByPlaceholderText('Describe your vision or inquiry details...') as HTMLTextAreaElement;
    const submitButton = screen.getByRole('button', { name: /sendMessage/i });
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(messageInput, { target: { value: 'This is a test message' } });
    
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
      expect(nameInput.value).toBe('John Doe');
      expect(emailInput.value).toBe('john@example.com');
      expect(messageInput.value).toBe('This is a test message');
    });
  });

  it('shows loading state during submission', async () => {
    mockCreateContactMessage.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<ContactPage />);
    
    const nameInput = screen.getByPlaceholderText('e.g. Adam Benz');
    const emailInput = screen.getByPlaceholderText('adam@benz.ma');
    const messageInput = screen.getByPlaceholderText('Describe your vision or inquiry details...');
    const submitButton = screen.getByRole('button', { name: /sendMessage/i });
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(messageInput, { target: { value: 'This is a test message' } });
    
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Sending...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('clears validation errors when user starts typing', async () => {
    render(<ContactPage />);
    const nameInput = screen.getByPlaceholderText('e.g. Adam Benz');
    const submitButton = screen.getByRole('button', { name: /sendMessage/i });
    
    // Trigger validation error
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });
    
    // Start typing
    fireEvent.change(nameInput, { target: { value: 'J' } });
    
    await waitFor(() => {
      expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
    });
  });
});
