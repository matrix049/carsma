import React from 'react';
import { render, screen } from '@testing-library/react';
import AdminSidebar from './AdminSidebar';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/admin/dashboard',
}));

describe('AdminSidebar', () => {
  const mockLogout = jest.fn();

  it('renders Contact Messages navigation link', () => {
    render(<AdminSidebar onLogout={mockLogout} />);
    
    const contactMessagesLink = screen.getByText(/Contact Messages/i);
    expect(contactMessagesLink).toBeInTheDocument();
    expect(contactMessagesLink.closest('a')).toHaveAttribute('href', '/admin/contact-messages');
  });

  it('renders all navigation items in correct order', () => {
    render(<AdminSidebar onLogout={mockLogout} />);
    
    const navItems = ['Dashboard', 'Orders', 'Custom Orders', 'Contact Messages'];
    navItems.forEach(item => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });
});
