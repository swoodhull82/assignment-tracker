// src/calendarApp.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import DocumentReviewCalendarPage from './pages/DocumentReviewCalendarPage';
import '../index.css'; // Assuming index.css in the root has Tailwind CSS setup

const calendarRootElement = document.getElementById('calendar-root');
if (!calendarRootElement) {
  throw new Error('Failed to find the calendar-root element in calendar.html. Make sure public/calendar.html contains <div id="calendar-root"></div>');
}

const root = ReactDOM.createRoot(calendarRootElement);

root.render(
  <React.StrictMode>
    <DocumentReviewCalendarPage />
  </React.StrictMode>
);
