import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Calendar from './Calendar';
import { Document, ReviewType, DocumentsByDate } from '../../types';

// Mock CalendarDay to simplify Calendar testing
jest.mock('./CalendarDay', () => (props: any) => (
  <div data-testid="calendar-day" onClick={props.onClick}>
    {props.date.getDate()}
    {props.documents.map((doc: Document) => <span key={doc.id}>{doc.title}</span>)}
  </div>
));

const MOCK_REVIEW_TYPES: ReviewType[] = [
  { id: 1, name: 'Contract', color: '#47b4ea' },
];

const MOCK_DOCUMENTS_BY_DATE: DocumentsByDate = {
  '2024-07-15': [{ id: 1, title: 'Doc 1', due_date: '2024-07-15', review_type_id: 1, review_type: MOCK_REVIEW_TYPES[0] }],
  '2024-07-20': [{ id: 2, title: 'Doc 2', due_date: '2024-07-20', review_type_id: 1, review_type: MOCK_REVIEW_TYPES[0] }],
};

describe('Calendar Component', () => {
  const mockOnPrevMonth = jest.fn();
  const mockOnNextMonth = jest.fn();
  const mockOnDayClick = jest.fn();
  
  const defaultProps = {
    currentDate: new Date(2024, 6, 15), // July 2024
    documentsByDate: MOCK_DOCUMENTS_BY_DATE,
    reviewTypes: MOCK_REVIEW_TYPES,
    onPrevMonth: mockOnPrevMonth,
    onNextMonth: mockOnNextMonth,
    onDayClick: mockOnDayClick,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the correct month and year', () => {
    render(<Calendar {...defaultProps} />);
    expect(screen.getByText('July 2024')).toBeInTheDocument();
  });

  test('renders days of the week headers', () => {
    render(<Calendar {...defaultProps} />);
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    daysOfWeek.forEach(day => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  test('calls onPrevMonth when "Prev" button is clicked', () => {
    render(<Calendar {...defaultProps} />);
    fireEvent.click(screen.getByText('< Prev'));
    expect(mockOnPrevMonth).toHaveBeenCalledTimes(1);
  });

  test('calls onNextMonth when "Next" button is clicked', () => {
    render(<Calendar {...defaultProps} />);
    fireEvent.click(screen.getByText('Next >'));
    expect(mockOnNextMonth).toHaveBeenCalledTimes(1);
  });

  test('renders correct number of day cells for July 2024', () => {
    render(<Calendar {...defaultProps} />);
    // July 2024: Starts on Monday (1st), 31 days.
    // Start day (1st) is index 1. So 1 empty cell before.
    // 31 days in month. Total cells = 1 (empty) + 31 (days) = 32.
    // To fill 5 weeks (35 cells): 35 - 32 = 3 empty cells after.
    // Total CalendarDay mocks rendered = 31.
    // Total divs (including empty) = 1 (empty prev) + 31 (days) + 3 (empty next) = 35
    const dayCells = screen.getAllByTestId('calendar-day');
    expect(dayCells.length).toBe(31); // Number of actual days in July
  });

  test('calls onDayClick with correct date and documents when a day is clicked', () => {
    render(<Calendar {...defaultProps} />);
    // Find a specific day (e.g., 15th) and click it
    // The CalendarDay mock renders the date as text content.
    const day15Cell = screen.getByText('15'); // This assumes CalendarDay renders the date number
    fireEvent.click(day15Cell);
    
    expect(mockOnDayClick).toHaveBeenCalledTimes(1);
    // First argument to onDayClick should be the Date object for July 15, 2024
    expect(mockOnDayClick.mock.calls[0][0]).toEqual(new Date(2024, 6, 15));
    // Second argument should be the documents for that day
    expect(mockOnDayClick.mock.calls[0][1]).toEqual(MOCK_DOCUMENTS_BY_DATE['2024-07-15']);
  });

  test('renders documents within day cells', () => {
    render(<Calendar {...defaultProps} />);
    // Check if document titles are rendered by the mocked CalendarDay
    expect(screen.getByText('Doc 1')).toBeInTheDocument(); // From date 2024-07-15
    expect(screen.getByText('Doc 2')).toBeInTheDocument(); // From date 2024-07-20
  });
});
