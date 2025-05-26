import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReminderSettings from './ReminderSettings';

describe('ReminderSettings Component', () => {
  beforeEach(() => {
    jest.useFakeTimers(); // Use fake timers for setTimeout
  });

  afterEach(() => {
    jest.clearAllTimers(); // Clear all timers
    jest.useRealTimers(); // Restore real timers
  });

  test('renders correctly with default frequency', () => {
    render(<ReminderSettings />);

    expect(screen.getByLabelText('Reminder Frequency')).toBeInTheDocument();
    // Default value is 'two' which corresponds to 'Weekly'
    expect(screen.getByRole('combobox', { name: /Reminder Frequency/i })).toHaveValue('two');
    expect(screen.getByText('Weekly')).toBeInTheDocument(); // Check if 'Weekly' option text is rendered

    expect(screen.getByRole('button', { name: /Save Settings/i })).toBeInTheDocument();
  });

  test('changes frequency when dropdown value is changed', () => {
    render(<ReminderSettings />);
    const selectElement = screen.getByRole('combobox', { name: /Reminder Frequency/i });

    fireEvent.change(selectElement, { target: { value: 'one' } });
    expect(selectElement).toHaveValue('one'); // Corresponds to 'Daily'

    fireEvent.change(selectElement, { target: { value: 'three' } });
    expect(selectElement).toHaveValue('three'); // Corresponds to 'Monthly'
  });

  test('"Save Settings" button click logs to console and shows message', async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    render(<ReminderSettings />);
    
    const selectElement = screen.getByRole('combobox', { name: /Reminder Frequency/i });
    fireEvent.change(selectElement, { target: { value: 'three' } }); // Change to Monthly

    const saveButton = screen.getByRole('button', { name: /Save Settings/i });
    fireEvent.click(saveButton);

    expect(consoleSpy).toHaveBeenCalledWith('Reminder frequency saved:', 'three');
    
    // Check for success message
    await waitFor(() => {
      expect(screen.getByText('Reminder frequency set to Monthly. (Mock save)')).toBeInTheDocument();
    });

    // Advance timers to check if the message disappears
    jest.advanceTimersByTime(3000);
    await waitFor(() => {
      expect(screen.queryByText('Reminder frequency set to Monthly. (Mock save)')).not.toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  test('message clears when frequency is changed after saving', async () => {
    render(<ReminderSettings />);
    const selectElement = screen.getByRole('combobox', { name: /Reminder Frequency/i });
    const saveButton = screen.getByRole('button', { name: /Save Settings/i });

    // Initial save to show message
    fireEvent.click(saveButton);
    await waitFor(() => {
      expect(screen.getByText('Reminder frequency set to Weekly. (Mock save)')).toBeInTheDocument();
    });

    // Change frequency
    fireEvent.change(selectElement, { target: { value: 'one' } });
    expect(screen.queryByText('Reminder frequency set to Weekly. (Mock save)')).not.toBeInTheDocument();
  });
});
