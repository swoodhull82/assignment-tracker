// src/remindersApp.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import RemindersPage from './pages/RemindersPage';
import '../index.css'; // Assuming index.css in the root has Tailwind CSS setup

const remindersRootElement = document.getElementById('reminders-root');
if (!remindersRootElement) {
  throw new Error('Failed to find the reminders-root element in public/reminders.html. Make sure public/reminders.html contains <div id="reminders-root"></div>');
}

const root = ReactDOM.createRoot(remindersRootElement);

root.render(
  <React.StrictMode>
    <RemindersPage />
  </React.StrictMode>
);
