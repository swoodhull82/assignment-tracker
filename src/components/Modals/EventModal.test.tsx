import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import EventModal from './EventModal';
import { Document, ReviewType } from '../../types';

const MOCK_REVIEW_TYPE: ReviewType = { id: 1, name: 'Contract', color: '#47b4ea' };
const MOCK_DOCUMENTS: Document[] = [
  { id: 1, title: 'Document Alpha', due_date: '2024-07-15', review_type_id: 1, review_type: MOCK_REVIEW_TYPE },
  { id: 2, title: 'Document Beta', due_date: '2024-07-15', review_type_id: 1, review_type: MOCK_REVIEW_TYPE },
];

describe('EventModal Component', () => {
  const mockOnClose = jest.fn();
  const selectedDate = new Date(2024, 6, 15); // July 15, 2024

  const defaultProps = {
    date: selectedDate,
    documents: MOCK_DOCUMENTS,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly with given date and documents', () => {
    render(<EventModal {...defaultProps} />);

    // Check if the formatted date is present
    const expectedDateString = selectedDate.toLocaleDateString(undefined, {
      year: 'numeric', month: 'long', day: 'numeric',
    });
    expect(screen.getByText(`Documents for ${expectedDateString}`)).toBeInTheDocument();

    // Check if document titles are present
    expect(screen.getByText(MOCK_DOCUMENTS[0].title)).toBeInTheDocument();
    expect(screen.getByText(MOCK_DOCUMENTS[1].title)).toBeInTheDocument();

    // Check if review types are present (assuming they are part of the display)
    // The component formats it as "ReviewType: Title"
    expect(screen.getByText((content, element) => content.startsWith(MOCK_REVIEW_TYPE.name) && content.includes(MOCK_DOCUMENTS[0].title))).toBeInTheDocument();
  });

  test('calls onClose when the "Close" button is clicked', () => {
    render(<EventModal {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /Close/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('displays "No documents due on this day." when documents array is empty', () => {
    render(<EventModal {...defaultProps} documents={[]} />);
    expect(screen.getByText('No documents due on this day.')).toBeInTheDocument();
  });
});
