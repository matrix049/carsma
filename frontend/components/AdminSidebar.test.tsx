import React from 'react';
import { render, screen, within } from '@testing-library/react';
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
    
    const nav = within(screen.getByRole('navigation', { name: 'Admin' }));
    const navItems = ['Dashboard', 'Analytics', 'Products', 'Orders', 'Custom Orders', 'Contact Messages'];
    const links = nav.getAllByRole('link').map((a) => a.textContent);
    expect(links).toEqual(navItems);
  });

  it('has no ledger and shows the admin name', () => {
    render(<AdminSidebar onLogout={mockLogout} />);

    expect(screen.queryByText(/Ledger/i)).not.toBeInTheDocument();
    expect(screen.queryByText('Amine')).not.toBeInTheDocument();
    expect(screen.getAllByText('Admin').length).toBeGreaterThan(0);
  });

  it('gives phones a bottom bar with the daily pages', () => {
    render(<AdminSidebar onLogout={mockLogout} />);

    const tabs = within(screen.getByRole('navigation', { name: 'Admin shortcuts' }));
    expect(tabs.getByText('Orders').closest('a')).toHaveAttribute('href', '/admin/orders');
    expect(tabs.getByText('Requests').closest('a')).toHaveAttribute('href', '/admin/custom-orders');
    expect(tabs.getByText('Inbox').closest('a')).toHaveAttribute('href', '/admin/contact-messages');
    expect(tabs.getByRole('button', { name: 'More' })).toBeInTheDocument();
  });
});
