from flask import Blueprint, request, jsonify
from .models import db, ReminderLog, Document, User # Assuming Document and User models exist
from datetime import datetime

api_bp = Blueprint('api', __name__)

@api_bp.route('/reminders', methods=['POST'])
def create_reminder_log():
    data = request.get_json()
    if not data or not data.get('document_id') or not data.get('user_id'):
        return jsonify({'error': 'Missing document_id or user_id'}), 400

    # Optional: Check if document_id and user_id exist in their respective tables
    # This depends on whether you want to enforce this at the API level
    # or rely on database foreign key constraints.
    document = Document.query.get(data['document_id'])
    if not document:
        return jsonify({'error': f"Document with id {data['document_id']} not found"}), 404
    
    user = User.query.get(data['user_id'])
    if not user:
        return jsonify({'error': f"User with id {data['user_id']} not found"}), 404

    new_log = ReminderLog(
        document_id=data['document_id'],
        user_id=data['user_id'],
        sent_timestamp=datetime.utcnow(), # Default is handled by model, but can be explicit
        status='Sent' # Default is handled by model, but can be explicit
    )
    db.session.add(new_log)
    db.session.commit()

    return jsonify(new_log.to_dict()), 201

@api_bp.route('/reminders', methods=['GET'])
def get_reminder_logs():
    document_id = request.args.get('document_id', type=int)
    user_id = request.args.get('user_id', type=int)

    query = ReminderLog.query

    if document_id:
        query = query.filter_by(document_id=document_id)
    
    if user_id:
        query = query.filter_by(user_id=user_id)
    
    logs = query.all()
    return jsonify([log.to_dict() for log in logs]), 200

@api_bp.route('/reminders/<int:reminder_id>', methods=['PUT'])
def update_reminder_log_status(reminder_id):
    log = ReminderLog.query.get_or_404(reminder_id)
    
    data = request.get_json()
    if not data or not data.get('status'):
        return jsonify({'error': 'Missing status in request body'}), 400
        
    new_status = data['status']
    # Optional: Validate the new_status against a list of allowed statuses
    # allowed_statuses = ['Sent', 'Opened', 'Clicked', 'Error', 'Disabled']
    # if new_status not in allowed_statuses:
    #     return jsonify({'error': f'Invalid status: {new_status}'}), 400

    log.status = new_status
    db.session.commit()

    return jsonify(log.to_dict()), 200
