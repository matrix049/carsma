import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatBot from './ChatBot';
import { sendChatMessage, sendChatOrder } from '@/lib/apiServices';

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
  sendChatOrder: jest.fn(),
}));

const mockSend = sendChatMessage as jest.MockedFunction<typeof sendChatMessage>;
const mockOrder = sendChatOrder as jest.MockedFunction<typeof sendChatOrder>;

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

  it('walks through a custom request and confirms the order with just name and phone', async () => {
    mockOrder.mockResolvedValue({ success: true });
    render(<ChatBot />);
    fireEvent.click(screen.getByRole('button', { name: /English/ }));

    type('can you make my car? golf 7 r 2018');
    expect(screen.getByText('Which side?')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Side' }));

    // 2D and 3D are both presented positively — no "cheaper" / "costs more".
    expect(screen.getByText(/closest to the real car/)).toBeInTheDocument();
    expect(screen.queryByText(/cheaper|costs more/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '3D · detailed' }));
    fireEvent.click(screen.getByRole('button', { name: 'Black' }));

    expect(screen.getByText(/Your order:/)).toBeInTheDocument();
    expect(screen.getByText(/Do you want to confirm this order\?/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Yes, confirm ✅' }));
    // Only name and phone to fill — the recap is already written.
    const form = screen.getByLabelText('Name').closest('form')!;
    expect(form.querySelectorAll('input')).toHaveLength(2);
    expect(form).toHaveTextContent('Style: 3D · detailed');

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Yassine' } });
    fireEvent.change(screen.getByLabelText('Phone'), { target: { value: '0612345678' } });
    fireEvent.submit(form);

    await waitFor(() => expect(screen.getByText(/Order confirmed/)).toBeInTheDocument());
    // The confirmed recap can't be sent a second time.
    expect(screen.queryByRole('button', { name: 'Yes, confirm ✅' })).not.toBeInTheDocument();
    expect(mockOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Yassine',
        phone: '0612345678',
        language: 'en',
        item: 'golf 7 r 2018',
        summary: expect.arrayContaining(['Side: Side', 'Style: 3D · detailed', 'Colour: Black']),
      }),
    );
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('opens the order form when the customer answers "yes" to the AI asking to confirm', async () => {
    mockSend.mockResolvedValue({
      reply: 'BMW M4 Competition, 179 MAD. Do you want to confirm your order?',
      offerHandoff: false,
      askConfirm: true,
      orderSummary: ['BMW M4 Competition', '120 × 35 cm', '179 MAD'],
      products: [],
    });
    render(<ChatBot />);
    fireEvent.click(screen.getByRole('button', { name: /English/ }));
    type('I want the bmw m4 one');
    await waitFor(() => expect(screen.getByText(/confirm your order/)).toBeInTheDocument());

    type('yes');
    const form = screen.getByLabelText('Name').closest('form')!;
    expect(form).toHaveTextContent('BMW M4 Competition');
    expect(form).toHaveTextContent('179 MAD');
    expect(mockSend).toHaveBeenCalledTimes(1);
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
