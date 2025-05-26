// src/types/index.ts

export interface ReviewType {
  id: string | number; // Can be number or string depending on API
  name: string;        // e.g., "Contract", "Policy", "Report"
  color: string;       // Hex color code, e.g., "#47b4ea"
}

export interface Document {
  id: string | number;
  title: string;
  due_date: string;       // ISO date string, e.g., "2024-06-15"
  review_type_id: string | number; // Foreign key to ReviewType
  // Optional: include the review_type object directly if API supports it
  review_type?: ReviewType; 
}

// For structuring documents by date for easier calendar rendering
export interface DocumentsByDate {
  [date: string]: Document[]; // Key is ISO date string
}

// For the Reminders page
export interface ReminderLogEntry {
  id: string | number;
  document_name: string;    // Assuming API provides this directly
  reviewer_name: string;    // Assuming API provides this directly
  sent_timestamp: string;   // ISO date-time string
  status: 'Sent' | 'Opened' | 'Clicked' | 'Error' | 'Pending'; // Example statuses
  // If API returns document_id and user_id, they would be here:
  // document_id: string | number;
  // user_id: string | number;
}
