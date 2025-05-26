import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReminderLogTable from './ReminderLogTable';
import { ReminderLogEntry } from '../../types';

const MOCK_LOGS: ReminderLogEntry[] = [
  { id: 1, document_name: 'Doc Alpha', reviewer_name: 'User A', sent_timestamp: new Date(2024, 0, 1, 10, 0).toISOString(), status: 'Sent' },
  { id: 2, document_name: 'Doc Beta', reviewer_name: 'User B', sent_timestamp: new Date(2024, 0, 2, 11, 0).toISOString(), status: 'Opened' },
];

describe('ReminderLogTable Component', () => {
  test('renders table with logs correctly', () => {
    render(<ReminderLogTable logs={MOCK_LOGS} />);

    // Check for table headers
    expect(screen.getByText('Document')).toBeInTheDocument();
    expect(screen.getByText('Reviewer')).toBeInTheDocument();
    expect(screen.getByText('Reminder Sent')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();

    // Check for log data
    expect(screen.getByText('Doc Alpha')).toBeInTheDocument();
    expect(screen.getByText('User A')).toBeInTheDocument();
    expect(screen.getByText('Sent')).toBeInTheDocument(); // Status badge text

    expect(screen.getByText('Doc Beta')).toBeInTheDocument();
    expect(screen.getByText('User B')).toBeInTheDocument();
    expect(screen.getByText('Opened')).toBeInTheDocument(); // Status badge text

    // Check formatted timestamps (example for one)
    const expectedTimestamp1 = new Date(MOCK_LOGS[0].sent_timestamp).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
    expect(screen.getByText(expectedTimestamp1)).toBeInTheDocument();
  });

  test('renders "No reminder logs found." when logs array is empty', () => {
    render(<ReminderLogTable logs={[]} />);
    expect(screen.getByText('No reminder logs found.')).toBeInTheDocument();
  });

  test('"View Details" button click can be triggered', () => {
    // Mock window.alert as the button uses it
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<ReminderLogTable logs={MOCK_LOGS} />);
    
    // Get all "View Details" buttons and click the first one
    const viewDetailsButtons = screen.getAllByRole('button', { name: /View Details/i });
    expect(viewDetailsButtons.length).toBe(MOCK_LOGS.length);
    fireEvent.click(viewDetailsButtons[0]);

    expect(alertMock).toHaveBeenCalledTimes(1);
    expect(alertMock).toHaveBeenCalledWith(`Viewing details for log ID: ${MOCK_LOGS[0].id}`);
    
    alertMock.mockRestore(); // Clean up the mock
  });

  test('status badges have correct classes', () => {
    const logsWithAllStatuses: ReminderLogEntry[] = [
      { id: 1, document_name: 'D1', reviewer_name: 'R1', sent_timestamp: new Date().toISOString(), status: 'Sent' },
      { id: 2, document_name: 'D2', reviewer_name: 'R2', sent_timestamp: new Date().toISOString(), status: 'Opened' },
      { id: 3, document_name: 'D3', reviewer_name: 'R3', sent_timestamp: new Date().toISOString(), status: 'Clicked' },
      { id: 4, document_name: 'D4', reviewer_name: 'R4', sent_timestamp: new Date().toISOString(), status: 'Error' },
      { id: 5, document_name: 'D5', reviewer_name: 'R5', sent_timestamp: new Date().toISOString(), status: 'Pending' },
    ];
    render(<ReminderLogTable logs={logsWithAllStatuses} />);

    expect(screen.getByText('Sent').className).toContain('bg-green-100 text-green-800');
    expect(screen.getByText('Opened').className).toContain('bg-yellow-100 text-yellow-800');
    expect(screen.getByText('Clicked').className).toContain('bg-blue-100 text-blue-800');
    expect(screen.getByText('Error').className).toContain('bg-red-100 text-red-800');
    expect(screen.getByText('Pending').className).toContain('bg-gray-100 text-gray-800');
  });
});
