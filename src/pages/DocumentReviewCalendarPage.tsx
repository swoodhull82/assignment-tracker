// src/pages/DocumentReviewCalendarPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Layout/Header';
import Calendar from '../components/Calendar/Calendar';
import EventModal from '../components/Modals/EventModal';
import { Document, ReviewType, DocumentsByDate } from '../types';

// Mock API data (replace with actual API calls)
const MOCK_REVIEW_TYPES: ReviewType[] = [
  { id: 1, name: 'Contract', color: '#47b4ea' }, // Blue
  { id: 2, name: 'Policy', color: '#4ade80' },   // Green
  { id: 3, name: 'Report', color: '#facc15' },   // Yellow
  { id: 4, name: 'Legal', color: '#f87171' },    // Red
];

const MOCK_DOCUMENTS: Document[] = [
  { id: 1, title: 'Q3 Financial Report', due_date: '2024-07-10', review_type_id: 3 },
  { id: 2, title: 'NDA with Client X', due_date: '2024-07-15', review_type_id: 1 },
  { id: 3, title: 'Updated Privacy Policy', due_date: '2024-07-15', review_type_id: 2 },
  { id: 4, title: 'Service Agreement Y', due_date: '2024-07-22', review_type_id: 1 },
  { id: 5, title: 'Internal Audit Report', due_date: '2024-08-05', review_type_id: 3 },
  { id: 6, title: 'Patent Application Z', due_date: '2024-07-10', review_type_id: 4 },
];

// Helper to enrich documents with review type details
const enrichDocuments = (docs: Document[], types: ReviewType[]): Document[] => {
  const typeMap = new Map(types.map(t => [t.id, t]));
  return docs.map(doc => ({
    ...doc,
    review_type: typeMap.get(doc.review_type_id),
  }));
};


const DocumentReviewCalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date()); // For calendar navigation
  const [documents, setDocuments] = useState<Document[]>([]);
  const [reviewTypes, setReviewTypes] = useState<ReviewType[]>([]);
  const [documentsByDate, setDocumentsByDate] = useState<DocumentsByDate>({});
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateDocuments, setSelectedDateDocuments] = useState<Document[]>([]);

  // Mock API fetching logic
  useEffect(() => {
    const fetchCalendarData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // In a real app, fetch from /api/documents and /api/review_types
        const fetchedReviewTypes = MOCK_REVIEW_TYPES;
        const fetchedDocuments = enrichDocuments(MOCK_DOCUMENTS, fetchedReviewTypes);
        
        setReviewTypes(fetchedReviewTypes);
        setDocuments(fetchedDocuments);

        const groupedByDate: DocumentsByDate = {};
        fetchedDocuments.forEach(doc => {
          const dateKey = doc.due_date; // Assuming due_date is YYYY-MM-DD
          if (!groupedByDate[dateKey]) {
            groupedByDate[dateKey] = [];
          }
          groupedByDate[dateKey].push(doc);
        });
        setDocumentsByDate(groupedByDate);

      } catch (err) {
        setError('Failed to fetch calendar data.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalendarData();
  }, []);

  const handlePrevMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const handleDayClick = useCallback((date: Date, docsOnDay: Document[]) => {
    setSelectedDate(date);
    setSelectedDateDocuments(docsOnDay);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedDate(null);
    setSelectedDateDocuments([]);
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><p>Loading calendar...</p></div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen"><p className="text-red-500">{error}</p></div>;
  }

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-grow p-6 bg-gray-100">
        <div className="container mx-auto">
          <Calendar
            currentDate={currentDate}
            documentsByDate={documentsByDate}
            reviewTypes={reviewTypes} // Pass reviewTypes for color mapping if needed in Calendar/CalendarDay
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onDayClick={handleDayClick}
          />
        </div>
      </main>
      {isModalOpen && selectedDate && (
        <EventModal
          date={selectedDate}
          documents={selectedDateDocuments}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default DocumentReviewCalendarPage;
