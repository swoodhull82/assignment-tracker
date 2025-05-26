// src/components/Calendar/CalendarDay.tsx
import React from 'react';
import { Document, ReviewType } from '../../types';

interface CalendarDayProps {
  date: Date;
  documents: Document[];
  reviewTypes: ReviewType[]; // Needed if review_type object isn't pre-attached to document
  onClick: () => void;
}

const CalendarDay: React.FC<CalendarDayProps> = ({ date, documents, reviewTypes, onClick }) => {
  const dayNumber = date.getDate();
  const isToday = new Date().toDateString() === date.toDateString();

  // Helper to get review type color - assumes documents have review_type object attached
  // If not, you'd look up in reviewTypes by review_type_id
  const getReviewTypeColor = (doc: Document): string => {
    return doc.review_type?.color || '#6b7280'; // Default to gray if no color
  };

  return (
    <div
      className={`border p-2 h-28 flex flex-col relative cursor-pointer hover:bg-gray-50 ${isToday ? 'bg-blue-50' : ''}`}
      onClick={onClick}
    >
      <span className={`self-end ${isToday ? 'font-bold text-blue-600' : ''}`}>
        {dayNumber}
      </span>
      <div className="flex-grow overflow-y-auto text-xs space-y-1 mt-1">
        {documents.map(doc => (
          <div
            key={doc.id}
            style={{ backgroundColor: getReviewTypeColor(doc) }}
            className="p-1 text-white rounded-md truncate"
            title={doc.title} // Show full title on hover
          >
            {doc.review_type?.name ? `${doc.review_type.name}: ` : ''}{doc.title}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarDay;
