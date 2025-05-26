// src/components/Calendar/Calendar.tsx
import React from 'react';
import CalendarDay from './CalendarDay';
import { Document, ReviewType, DocumentsByDate } from '../../types';

interface CalendarProps {
  currentDate: Date;
  documentsByDate: DocumentsByDate;
  reviewTypes: ReviewType[]; // For passing down to CalendarDay if needed for direct color lookup
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDayClick: (date: Date, documentsOnDay: Document[]) => void;
}

const Calendar: React.FC<CalendarProps> = ({
  currentDate,
  documentsByDate,
  reviewTypes,
  onPrevMonth,
  onNextMonth,
  onDayClick,
}) => {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) - 6 (Sat)

  const calendarDays = [];

  // Add empty cells for days before the start of the month
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(<div key={`empty-prev-${i}`} className="border p-2 h-24"></div>);
  }

  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateObj = new Date(year, month, day);
    const dateKey = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
    const documentsOnThisDay = documentsByDate[dateKey] || [];
    
    calendarDays.push(
      <CalendarDay
        key={dateKey}
        date={dateObj}
        documents={documentsOnThisDay}
        reviewTypes={reviewTypes} // Pass reviewTypes for color mapping
        onClick={() => onDayClick(dateObj, documentsOnThisDay)}
      />
    );
  }

  // Add empty cells for days after the end of the month to fill the grid
  const totalCells = startDayOfWeek + daysInMonth;
  const remainingCells = (7 - (totalCells % 7)) % 7;
  for (let i = 0; i < remainingCells; i++) {
    calendarDays.push(<div key={`empty-next-${i}`} className="border p-2 h-24"></div>);
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      {/* Calendar Header: Month/Year and Navigation */}
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={onPrevMonth} 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          &lt; Prev
        </button>
        <h2 className="text-2xl font-semibold">
          {monthNames[month]} {year}
        </h2>
        <button 
          onClick={onNextMonth} 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Next &gt;
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {/* Days of the week */}
        {daysOfWeek.map(dayName => (
          <div key={dayName} className="font-semibold p-2">
            {dayName}
          </div>
        ))}
        
        {/* Calendar Day Cells */}
        {calendarDays}
      </div>
    </div>
  );
};

export default Calendar;
