// src/components/Modals/EventModal.tsx
import React from 'react';
import { Document } from '../../types';

interface EventModalProps {
  date: Date;
  documents: Document[];
  onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ date, documents, onClose }) => {
  const formattedDate = date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    // Modal backdrop
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
      {/* Modal content */}
      <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Documents for {formattedDate}
          </h3>
          <div className="mt-4 px-7 py-3 max-h-60 overflow-y-auto">
            {documents.length > 0 ? (
              <ul className="list-none text-left space-y-2">
                {documents.map(doc => (
                  <li key={doc.id} className="p-2 rounded-md" style={{backgroundColor: doc.review_type?.color ? `${doc.review_type.color}33` : '#e5e7eb' }}> {/* Lighten the review type color for background */}
                    <strong style={{color: doc.review_type?.color || '#1f2937' }}>
                      {doc.review_type?.name || 'General'}:
                    </strong>
                    <span className="ml-2 text-gray-700">{doc.title}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No documents due on this day.</p>
            )}
          </div>
          <div className="items-center px-4 py-3 mt-4">
            <button
              id="closeModalButton"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
