// src/pages/RemindersPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Layout/Header'; // Re-using Header from Calendar task
import SidebarNav from '../components/Layout/SidebarNav';
import ReminderLogTable from '../components/Reminders/ReminderLogTable';
import ReminderSettings from '../components/Reminders/ReminderSettings';
import { ReminderLogEntry } from '../types';

// Mock API data (replace with actual API calls)
const MOCK_REMINDER_LOGS: ReminderLogEntry[] = [
  {
    id: 1,
    document_name: 'Q3 Financial Report',
    reviewer_name: 'Alice Wonderland',
    sent_timestamp: new Date(2024, 6, 15, 10, 0, 0).toISOString(), // July 15, 2024, 10:00 AM
    status: 'Sent',
  },
  {
    id: 2,
    document_name: 'NDA with Client X',
    reviewer_name: 'Bob The Builder',
    sent_timestamp: new Date(2024, 6, 14, 9, 30, 0).toISOString(), // July 14, 2024, 09:30 AM
    status: 'Opened',
  },
  {
    id: 3,
    document_name: 'Updated Privacy Policy',
    reviewer_name: 'Carol Danvers',
    sent_timestamp: new Date(2024, 6, 13, 14, 15, 0).toISOString(), // July 13, 2024, 02:15 PM
    status: 'Clicked',
  },
  {
    id: 4,
    document_name: 'Service Agreement Y',
    reviewer_name: 'David Copperfield',
    sent_timestamp: new Date(2024, 6, 12, 8, 0, 0).toISOString(), // July 12, 2024, 08:00 AM
    status: 'Error',
  },
];

const RemindersPage: React.FC = () => {
  const [reminderLogs, setReminderLogs] = useState<ReminderLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock API fetching logic
  useEffect(() => {
    const fetchReminderLogs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // In a real app, fetch from GET /api/reminders
        // const response = await fetch('/api/reminders');
        // if (!response.ok) {
        //   throw new Error(`HTTP error! status: ${response.status}`);
        // }
        // const data: ReminderLogEntry[] = await response.json();
        // For now, using mock data
        const data = MOCK_REMINDER_LOGS;
        
        setReminderLogs(data);

      } catch (err) {
        if (err instanceof Error) {
          setError(`Failed to fetch reminder logs: ${err.message}`);
        } else {
          setError('An unknown error occurred while fetching reminder logs.');
        }
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReminderLogs();
  }, []);
  
  // The Header from Reminders.txt is slightly different from the Calendar one.
  // For this task, I'll reuse the Calendar Header. If specific adjustments
  // are needed, Header.tsx could be modified or a new one created.
  // For now, the existing Header.tsx (with "Review Tracker" title) will be used.
  // The <h1 class="text-2xl font-semibold text-gray-700">Reminders</h1> from Reminders.txt
  // will be part of this page's main content area header.

  return (
    <div className="flex h-screen bg-gray-100">
      <SidebarNav activePage="Reminders" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* This Header is the top bar, not the "Reminders" title text from Reminders.txt <header> */}
        <Header /> 

        {/* Page Content specific to Reminders, including its own header text */}
        <main className="flex-grow p-6 space-y-8 overflow-y-auto">
          {/* Header text for the Reminders page content area */}
          <header className="mb-6"> {/* Added a header element for the title */}
            <h1 className="text-3xl font-semibold text-gray-800">Reminders Dashboard</h1>
          </header>

          {isLoading && <p className="text-center text-gray-500">Loading reminder logs...</p>}
          {error && <p className="text-center text-red-500 p-4 bg-red-100 rounded-md">{error}</p>}
          
          {!isLoading && !error && (
            <>
              <ReminderLogTable logs={reminderLogs} />
              <ReminderSettings />
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default RemindersPage;
