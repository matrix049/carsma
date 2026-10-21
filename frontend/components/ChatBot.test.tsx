import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatBot from './ChatBot';
import { sendChatMessage, sendChatHandoff } from '@/lib/apiServices';

jest.mock('framer-motion', () => {
  const React = jest.requireActual('react');
  const passthrough = (tag: string) =>
    // eslint-disable-next-line react/display-name
    React.forwardRef(({ children, initial, animate, exit, transition, ...rest }: any, ref: any) =>
      React.createElement(tag, { ...rest, ref }, children),
    );
  return {
    motion: { div: passthrough('div'), form: passthrough('form') },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

jest.mock('@/lib/apiServices', () => ({
  fetchProducts: jest.fn().mockResolvedValue([{ price: 179 }, { price: 199 }]),
  sendChatMessage: jest.fn(),
  sendChatHandoff: jest.fn(),
}));

const mockSend = sendChatMessage as jest.MockedFunction<typeof sendChatMessage>;
const mockHandoff = sendChatHandoff as jest.MockedFunction<typeof sendChatHandoff>;

beforeAll(() => {
  Element.prototype.scrollTo = jest.fn();
});

beforeEach(() => {
  jest.clearAllMocks();
  sessionStorage.clear();
});

function type(text: string) {
  fireEvent.change(screen.getByLabelText('Type your question…'), { target: { value: text } });
  fireEvent.click(screen.getByRole('button', { name: 'Send' }));
}

describe('ChatBot', () => {
  it('asks for a language first', () => {
    render(<ChatBot />);
    expect(screen.getByRole('button', { name: /English/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /الدارجة/ })).toBeInTheDocument();
    expect(screen.queryByLabelText('Type your question…')).not.toBeInTheDocument();
  });

  it('answers a quick-question chip instantly without the AI', async () => {
    render(<ChatBot />);
    fireEvent.click(screen.getByRole('button', { name: /English/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Colours' }));
    expect(screen.getByText(/Black and white are always possible/)).toBeInTheDocument();
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('walks through a custom request and sends it to the team', async () => {
    mockHandoff.mockResolvedValue({ success: true });
    render(<ChatBot />);
    fireEvent.click(screen.getByRole('button', { name: /English/ }));

    type('can you make my car? golf 7 r 2018');
    expect(screen.getByText('Which side?')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Side' }));
    fireEvent.click(screen.getByRole('button', { name: '3D' }));
    fireEvent.click(screen.getByRole('button', { name: 'Black' }));

    expect(screen.getByText(/Your request:/)).toBeInTheDocument();
    expect(screen.getByText(/partial advance payment/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Send to the team' }));
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Yassine' } });
    fireEvent.change(screen.getByLabelText('Phone'), { target: { value: '0612345678' } });
    fireEvent.submit(screen.getByLabelText('Name').closest('form')!);

    await waitFor(() => expect(screen.getByText(/Request received/)).toBeInTheDocument());
    expect(mockHandoff).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Yassine',
        phone: '0612345678',
        language: 'en',
        details: expect.arrayContaining(['Side: Side', 'Style: 3D', 'Colour: Black']),
      }),
    );
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('asks the AI for open questions and shows its reply', async () => {
    mockSend.mockResolvedValue({ reply: 'We have two BMW pieces.', offerHandoff: false, products: [] });
    render(<ChatBot />);
    fireEvent.click(screen.getByRole('button', { name: /English/ }));
    type('do you have something for a bmw fan?');
    await waitFor(() => expect(screen.getByText('We have two BMW pieces.')).toBeInTheDocument());
    expect(mockSend).toHaveBeenCalledWith(expect.arrayContaining([{ role: 'user', text: 'do you have something for a bmw fan?' }]), 'en');
  });

  it('falls back to a team hand-off when the AI is unavailable', async () => {
    mockSend.mockRejectedValue(new Error('503'));
    render(<ChatBot />);
    fireEvent.click(screen.getByRole('button', { name: /English/ }));
    type('I need something special for my office wall');
    await waitFor(() => expect(screen.getByText(/can’t answer right now/)).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Send to the team' })).toBeInTheDocument();
  });
});
