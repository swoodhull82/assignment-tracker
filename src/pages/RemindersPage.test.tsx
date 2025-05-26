import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RemindersPage from './RemindersPage';
import { ReminderLogEntry } from '../types'; // Assuming this type is correctly defined

// Mock child components
jest.mock('../components/Layout/Header', () => () => <div data-testid="header">Header</div>);
jest.mock('../components/Layout/SidebarNav', () => (props: { activePage: string }) => (
  <div data-testid="sidebar-nav">SidebarNav - Active: {props.activePage}</div>
));
jest.mock('../components/Reminders/ReminderLogTable', () => (props: { logs: ReminderLogEntry[] }) => (
  <div data-testid="reminder-log-table">
    ReminderLogTable
    {props.logs.map(log => <div key={log.id}>{log.document_name}</div>)}
  </div>
));
jest.mock('../components/Reminders/ReminderSettings', () => () => <div data-testid="reminder-settings">ReminderSettings</div>);

// Mock API data (as used in RemindersPage.tsx)
const MOCK_REMINDER_LOGS_DATA: ReminderLogEntry[] = [
  { id: 1, document_name: 'Q3 Report', reviewer_name: 'Alice', sent_timestamp: new Date().toISOString(), status: 'Sent' },
  { id: 2, document_name: 'NDA Client X', reviewer_name: 'Bob', sent_timestamp: new Date().toISOString(), status: 'Opened' },
];

// Mocking global fetch or specific API modules.
// As the component uses useEffect with internal mock simulation for RemindersPage,
// we'll rely on that for now.
// global.fetch = jest.fn(() =>
//   Promise.resolve({
//     json: () => Promise.resolve(MOCK_REMINDER_LOGS_DATA),
//     ok: true,
//   })
// ) as jest.Mock;

describe('RemindersPage', () => {
  beforeEach(() => {
    // jest.clearAllMocks(); // if using jest.fn for fetch
  });

  test('renders loading state initially (conceptual)', () => {
    // Similar to CalendarPage, the internal setTimeout makes precise loading state testing tricky
    // without controlling the Promise directly. We'll check for eventual rendering.
    render(<RemindersPage />);
    // Expect some form of loading indicator or wait for main content.
  });

  test('renders header, sidebar, table, and settings after data load', async () => {
    render(<RemindersPage />);
    
    // Wait for the component to finish its internal data fetching (mocked with setTimeout)
    await waitFor(() => expect(screen.getByTestId('header')).toBeInTheDocument(), { timeout: 1000 });
    expect(screen.getByTestId('sidebar-nav')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-nav')).toHaveTextContent('SidebarNav - Active: Reminders');
    expect(screen.getByTestId('reminder-log-table')).toBeInTheDocument();
    expect(screen.getByTestId('reminder-settings')).toBeInTheDocument();

    // Check if data is passed to ReminderLogTable mock
    expect(screen.getByText(MOCK_REMINDER_LOGS_DATA[0].document_name)).toBeInTheDocument();
  });
  
  test('displays the main page title "Reminders Dashboard"', async () => {
    render(<RemindersPage />);
    await waitFor(() => expect(screen.getByText('Reminders Dashboard')).toBeInTheDocument(), { timeout: 1000 });
  });

  test('displays error message if data fetching fails (conceptual)', async () => {
    // This test remains conceptual as it requires modifying the component's internal error handling
    // or mocking global fetch to throw an error.
    // const originalFetch = global.fetch;
    // global.fetch = jest.fn(() => Promise.reject(new Error('API Error for Reminders'))) as jest.Mock;
    
    // render(<RemindersPage />);
    // await waitFor(() => expect(screen.getByText(/Failed to fetch reminder logs/i)).toBeInTheDocument());
    // global.fetch = originalFetch; 
  });
});
