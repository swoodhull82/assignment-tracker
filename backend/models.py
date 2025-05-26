from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    # Add other user fields as necessary, e.g., username, email
    username = db.Column(db.String(80), unique=True, nullable=False)

    def __repr__(self):
        return f'<User {self.username}>'

class Document(db.Model):
    __tablename__ = 'documents'
    id = db.Column(db.Integer, primary_key=True)
    # Add other document fields as necessary, e.g., title, content
    title = db.Column(db.String(120), nullable=False)

    def __repr__(self):
        return f'<Document {self.title}>'

class ReminderLog(db.Model):
    __tablename__ = 'reminder_logs'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    document_id = db.Column(db.Integer, db.ForeignKey('documents.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    sent_timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(50), default='Sent')  # e.g., 'Sent', 'Opened', 'Error'

    # Relationships (optional, but good for ORM usage)
    document = db.relationship('Document', backref=db.backref('reminder_logs', lazy=True))
    user = db.relationship('User', backref=db.backref('reminder_logs', lazy=True))

    def __repr__(self):
        return f'<ReminderLog id={self.id} doc_id={self.document_id} user_id={self.user_id} status={self.status}>'

    def to_dict(self):
        return {
            'id': self.id,
            'document_id': self.document_id,
            'user_id': self.user_id,
            'sent_timestamp': self.sent_timestamp.isoformat() if self.sent_timestamp else None,
            'status': self.status
        }
