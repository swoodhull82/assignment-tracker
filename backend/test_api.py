import unittest
import json
from datetime import datetime, timedelta

# Assuming app.py, models.py, config.py are in the same directory or accessible
# Adjust imports based on your actual project structure
from app import create_app # Your Flask app factory
from models import db, User, Document, ReminderLog 

class ReminderAPITestCase(unittest.TestCase):

    def setUp(self):
        """Set up test variables."""
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        # self.app.config['SQLALCHEMY_ECHO'] = True # Optional: for debugging SQL
        self.client = self.app.test_client()

        with self.app.app_context():
            db.create_all()
            # Add initial data (users, documents)
            user1 = User(id=1, username='testuser1')
            user2 = User(id=2, username='testuser2')
            doc1 = Document(id=1, title='Test Document 1')
            doc2 = Document(id=2, title='Test Document 2')
            
            db.session.add_all([user1, user2, doc1, doc2])
            db.session.commit()

    def tearDown(self):
        """Executed after each test."""
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def test_01_create_reminder_log_success(self):
        """Test successful creation of a reminder log."""
        payload = {'document_id': 1, 'user_id': 1}
        response = self.client.post('/api/reminders', json=payload)
        data = response.get_json()

        self.assertEqual(response.status_code, 201)
        self.assertIn('id', data)
        self.assertEqual(data['document_id'], 1)
        self.assertEqual(data['user_id'], 1)
        self.assertEqual(data['status'], 'Sent')
        self.assertTrue(ReminderLog.query.filter_by(id=data['id']).first() is not None)

    def test_02_create_reminder_log_missing_document_id(self):
        """Test creation with missing document_id."""
        payload = {'user_id': 1}
        response = self.client.post('/api/reminders', json=payload)
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertIn('error', data)
        self.assertEqual(data['error'], 'Missing document_id or user_id')

    def test_03_create_reminder_log_missing_user_id(self):
        """Test creation with missing user_id."""
        payload = {'document_id': 1}
        response = self.client.post('/api/reminders', json=payload)
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertIn('error', data)
        self.assertEqual(data['error'], 'Missing document_id or user_id')

    def test_04_create_reminder_log_non_existent_document(self):
        """Test creation with a non-existent document_id."""
        payload = {'document_id': 999, 'user_id': 1}
        response = self.client.post('/api/reminders', json=payload)
        self.assertEqual(response.status_code, 404) # Based on routes.py implementation
        data = response.get_json()
        self.assertIn('error', data)
        self.assertEqual(data['error'], 'Document with id 999 not found')

    def test_05_create_reminder_log_non_existent_user(self):
        """Test creation with a non-existent user_id."""
        payload = {'document_id': 1, 'user_id': 999}
        response = self.client.post('/api/reminders', json=payload)
        self.assertEqual(response.status_code, 404) # Based on routes.py implementation
        data = response.get_json()
        self.assertIn('error', data)
        self.assertEqual(data['error'], 'User with id 999 not found')

    def test_06_get_all_reminder_logs(self):
        """Test fetching all reminder logs."""
        # Create a couple of logs first
        self.client.post('/api/reminders', json={'document_id': 1, 'user_id': 1})
        self.client.post('/api/reminders', json={'document_id': 2, 'user_id': 2})
        
        response = self.client.get('/api/reminders')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 2)

    def test_07_get_reminder_logs_filter_by_document_id(self):
        """Test filtering reminder logs by document_id."""
        self.client.post('/api/reminders', json={'document_id': 1, 'user_id': 1})
        self.client.post('/api/reminders', json={'document_id': 2, 'user_id': 1}) # Same user, diff doc
        
        response = self.client.get('/api/reminders?document_id=1')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['document_id'], 1)

    def test_08_get_reminder_logs_filter_by_user_id(self):
        """Test filtering reminder logs by user_id."""
        self.client.post('/api/reminders', json={'document_id': 1, 'user_id': 1})
        self.client.post('/api/reminders', json={'document_id': 1, 'user_id': 2}) # Same doc, diff user

        response = self.client.get('/api/reminders?user_id=2')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['user_id'], 2)

    def test_09_update_reminder_log_status_success(self):
        """Test successful update of a reminder's status."""
        # Create a log first
        create_response = self.client.post('/api/reminders', json={'document_id': 1, 'user_id': 1})
        log_id = create_response.get_json()['id']

        payload = {'status': 'Opened'}
        response = self.client.put(f'/api/reminders/{log_id}', json=payload)
        data = response.get_json()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['id'], log_id)
        self.assertEqual(data['status'], 'Opened')
        
        # Verify in DB
        updated_log = ReminderLog.query.get(log_id)
        self.assertEqual(updated_log.status, 'Opened')

    def test_10_update_reminder_log_non_existent(self):
        """Test updating a non-existent reminder log."""
        payload = {'status': 'Opened'}
        response = self.client.put('/api/reminders/999', json=payload)
        self.assertEqual(response.status_code, 404) # Flask-SQLAlchemy get_or_404 behavior

    def test_11_update_reminder_log_missing_status(self):
        """Test updating a reminder log with missing status in payload."""
        create_response = self.client.post('/api/reminders', json={'document_id': 1, 'user_id': 1})
        log_id = create_response.get_json()['id']

        payload = {} # Missing status
        response = self.client.put(f'/api/reminders/{log_id}', json=payload)
        data = response.get_json()
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', data)
        self.assertEqual(data['error'], 'Missing status in request body')

if __name__ == '__main__':
    unittest.main()
