// src/components/Reminders/ReminderSettings.tsx
import React, { useState } from 'react';

const ReminderSettings: React.FC = () => {
  const [frequency, setFrequency] = useState<'one' | 'two' | 'three'>('two'); // Default to 'Weekly' (value 'two')
  const [message, setMessage] = useState<string | null>(null);

  const handleFrequencyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFrequency(event.target.value as 'one' | 'two' | 'three');
    setMessage(null); // Clear message on change
  };

  const handleSaveSettings = () => {
    // In a real app, this would likely call an API to save the settings.
    // For this subtask, we'll log to console and show a message.
    console.log('Reminder frequency saved:', frequency);
    
    let frequencyText = '';
    if (frequency === 'one') frequencyText = 'Daily';
    else if (frequency === 'two') frequencyText = 'Weekly';
    else if (frequency === 'three') frequencyText = 'Monthly';

    setMessage(`Reminder frequency set to ${frequencyText}. (Mock save)`);

    // Clear message after a few seconds
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <section className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Reminder Settings</h2>
      <div className="space-y-4 max-w-md">
        <div>
          <label htmlFor="reminderFrequency" className="block text-sm font-medium text-gray-700">
            Reminder Frequency
          </label>
          <select
            id="reminderFrequency"
            name="reminderFrequency"
            value={frequency}
            onChange={handleFrequencyChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="one">Daily</option>
            <option value="two">Weekly</option>
            <option value="three">Monthly</option>
          </select>
        </div>
        <div>
          <button
            type="button"
            onClick={handleSaveSettings}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save Settings
          </button>
        </div>
        {message && (
          <div className={`mt-3 text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </div>
        )}
      </div>
    </section>
  );
};

export default ReminderSettings;
