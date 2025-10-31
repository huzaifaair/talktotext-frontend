# Backend Integration Guide

This document provides detailed instructions for connecting the TalkToText Pro frontend to your Flask/Celery backend.

## Backend Requirements

### Technology Stack
- **Flask**: Web framework for API endpoints
- **Celery**: Background task processing
- **Redis**: Message broker for Celery
- **SQLAlchemy**: Database ORM (recommended)
- **JWT**: Authentication tokens
- **CORS**: Cross-origin resource sharing

### Required Dependencies

\`\`\`bash
pip install flask flask-cors flask-jwt-extended celery redis sqlalchemy
\`\`\`

## Environment Configuration

### Frontend (.env.local)
\`\`\`env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=TalkToText Pro
\`\`\`

### Backend (.env)
\`\`\`env
# Flask Configuration
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key

# Database
DATABASE_URL=sqlite:///talktotextpro.db

# Redis (for Celery)
REDIS_URL=redis://localhost:6379/0

# File Storage
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=500MB

# AI/LLM Configuration
OPENAI_API_KEY=your-openai-key
WHISPER_MODEL=whisper-1
\`\`\`

## API Endpoint Implementation

### 1. Authentication Endpoints

\`\`\`python
from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
jwt = JWTManager(app)

@app.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['name', 'email', 'password']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Check if user exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409
    
    # Create user
    user = User(
        name=data['name'],
        email=data['email'],
        phone=data.get('phone'),
        password_hash=generate_password_hash(data['password'])
    )
    db.session.add(user)
    db.session.commit()
    
    # Generate token
    token = create_access_token(identity=user.id)
    
    return jsonify({
        'token': token,
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'phone': user.phone
        }
    }), 201

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    
    user = User.query.filter_by(email=data['email']).first()
    
    if user and check_password_hash(user.password_hash, data['password']):
        token = create_access_token(identity=user.id)
        return jsonify({
            'token': token,
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'phone': user.phone
            }
        })
    
    return jsonify({'error': 'Invalid credentials'}), 401
\`\`\`

### 2. Upload Endpoint

\`\`\`python
from celery import Celery
import uuid
import os

celery = Celery('talktotextpro')

@app.route('/api/upload', methods=['POST'])
@jwt_required()
def upload_file():
    user_id = get_jwt_identity()
    
    # Get form data
    file = request.files.get('file')
    url = request.form.get('url')
    language = request.form.get('language', 'auto')
    background = request.form.get('background', 'true').lower() == 'true'
    extract_duration = int(request.form.get('extractDuration', 120))
    
    if not file and not url:
        return jsonify({'error': 'File or URL required'}), 400
    
    # Generate upload ID
    upload_id = str(uuid.uuid4())
    
    # Save file if provided
    file_path = None
    if file:
        filename = f"{upload_id}_{file.filename}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
    
    # Create upload record
    upload = Upload(
        id=upload_id,
        user_id=user_id,
        file_path=file_path,
        url=url,
        language=language,
        extract_duration=extract_duration,
        status='uploaded'
    )
    db.session.add(upload)
    db.session.commit()
    
    if background:
        # Queue background task
        process_upload.delay(upload_id)
        return jsonify({
            'upload_id': upload_id,
            'status': 'uploaded'
        })
    else:
        # Process immediately
        result = process_upload_sync(upload_id)
        return jsonify({
            'note_id': result['note_id'],
            'status': 'done'
        })

@celery.task
def process_upload(upload_id):
    """Background task for processing uploads"""
    upload = Upload.query.get(upload_id)
    
    try:
        # Update status
        upload.status = 'processing'
        upload.progress = {'stage': 'extracting', 'percent': 10}
        db.session.commit()
        
        # Extract audio (if video)
        audio_path = extract_audio(upload.file_path or upload.url)
        upload.progress = {'stage': 'transcribing', 'percent': 30}
        db.session.commit()
        
        # Transcribe with Whisper
        transcript = transcribe_audio(audio_path, upload.language)
        upload.progress = {'stage': 'analyzing', 'percent': 60}
        db.session.commit()
        
        # Generate summary and analysis
        analysis = analyze_transcript(transcript)
        upload.progress = {'stage': 'finalizing', 'percent': 90}
        db.session.commit()
        
        # Create note record
        note = Note(
            id=str(uuid.uuid4()),
            upload_id=upload_id,
            user_id=upload.user_id,
            title=analysis['title'],
            abstract_summary=analysis['summary'],
            key_points=analysis['key_points'],
            action_items=analysis['action_items'],
            sentiment=analysis['sentiment'],
            transcript=transcript,
            language=upload.language,
            duration=analysis['duration']
        )
        db.session.add(note)
        
        # Update upload status
        upload.status = 'done'
        upload.note_id = note.id
        upload.progress = {'stage': 'done', 'percent': 100}
        db.session.commit()
        
    except Exception as e:
        upload.status = 'failed'
        upload.error_message = str(e)
        db.session.commit()
        raise
\`\`\`

### 3. Status Endpoint

\`\`\`python
@app.route('/api/status/<upload_id>', methods=['GET'])
@jwt_required()
def get_status(upload_id):
    user_id = get_jwt_identity()
    
    upload = Upload.query.filter_by(id=upload_id, user_id=user_id).first()
    if not upload:
        return jsonify({'error': 'Upload not found'}), 404
    
    response = {
        'status': upload.status,
        'progress': upload.progress
    }
    
    if upload.note_id:
        response['note_id'] = upload.note_id
    
    if upload.error_message:
        response['error'] = upload.error_message
    
    return jsonify(response)
\`\`\`

### 4. Notes Endpoints

\`\`\`python
@app.route('/api/notes/<note_id>', methods=['GET'])
@jwt_required()
def get_note(note_id):
    user_id = get_jwt_identity()
    
    note = Note.query.filter_by(id=note_id, user_id=user_id).first()
    if not note:
        return jsonify({'error': 'Note not found'}), 404
    
    return jsonify({
        'id': note.id,
        'title': note.title,
        'created_at': note.created_at.isoformat(),
        'language': note.language,
        'duration': note.duration,
        'abstract_summary': note.abstract_summary,
        'key_points': note.key_points,
        'action_items': note.action_items,
        'sentiment': note.sentiment,
        'participants': note.participants,
        'meeting_type': note.meeting_type,
        'transcript': note.transcript
    })

@app.route('/api/notes', methods=['GET'])
@jwt_required()
def get_notes():
    user_id = get_jwt_identity()
    
    notes = Note.query.filter_by(user_id=user_id).order_by(Note.created_at.desc()).all()
    
    return jsonify([{
        'id': note.id,
        'title': note.title,
        'created_at': note.created_at.isoformat(),
        'language': note.language,
        'duration': note.duration,
        'abstract_summary': note.abstract_summary,
        'sentiment': note.sentiment
    } for note in notes])

@app.route('/api/history', methods=['GET'])
@jwt_required()
def get_history():
    # Same as get_notes but with additional filtering options
    return get_notes()
\`\`\`

### 5. Download Endpoints

\`\`\`python
from flask import send_file
import io
from reportlab.pdfgen import canvas
from docx import Document

@app.route('/api/download/pdf/<note_id>', methods=['GET'])
@jwt_required()
def download_pdf(note_id):
    user_id = get_jwt_identity()
    
    note = Note.query.filter_by(id=note_id, user_id=user_id).first()
    if not note:
        return jsonify({'error': 'Note not found'}), 404
    
    # Generate PDF
    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer)
    
    # Add content to PDF
    pdf.drawString(100, 750, f"Title: {note.title}")
    pdf.drawString(100, 720, f"Date: {note.created_at.strftime('%Y-%m-%d')}")
    
    # Add summary
    y_position = 680
    pdf.drawString(100, y_position, "Summary:")
    # Add text wrapping logic here
    
    pdf.save()
    buffer.seek(0)
    
    return send_file(
        buffer,
        as_attachment=True,
        download_name=f"{note.title}.pdf",
        mimetype='application/pdf'
    )

@app.route('/api/download/docx/<note_id>', methods=['GET'])
@jwt_required()
def download_docx(note_id):
    user_id = get_jwt_identity()
    
    note = Note.query.filter_by(id=note_id, user_id=user_id).first()
    if not note:
        return jsonify({'error': 'Note not found'}), 404
    
    # Generate DOCX
    doc = Document()
    doc.add_heading(note.title, 0)
    doc.add_paragraph(f"Date: {note.created_at.strftime('%Y-%m-%d')}")
    
    doc.add_heading('Summary', level=1)
    doc.add_paragraph(note.abstract_summary)
    
    doc.add_heading('Key Points', level=1)
    for point in note.key_points:
        doc.add_paragraph(point, style='List Bullet')
    
    # Save to buffer
    buffer = io.BytesIO()
    doc.save(buffer)
    buffer.seek(0)
    
    return send_file(
        buffer,
        as_attachment=True,
        download_name=f"{note.title}.docx",
        mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
\`\`\`

## Database Models

\`\`\`python
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20))
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Upload(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    file_path = db.Column(db.String(255))
    url = db.Column(db.String(500))
    language = db.Column(db.String(10), default='auto')
    extract_duration = db.Column(db.Integer, default=120)
    status = db.Column(db.String(20), default='uploaded')
    progress = db.Column(db.JSON)
    note_id = db.Column(db.String(36))
    error_message = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Note(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    upload_id = db.Column(db.String(36), db.ForeignKey('upload.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    abstract_summary = db.Column(db.Text)
    key_points = db.Column(db.JSON)
    action_items = db.Column(db.JSON)
    sentiment = db.Column(db.JSON)
    participants = db.Column(db.JSON)
    meeting_type = db.Column(db.String(50))
    transcript = db.Column(db.Text)
    language = db.Column(db.String(10))
    duration = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
\`\`\`

## Running the Backend

### 1. Install Dependencies
\`\`\`bash
pip install -r requirements.txt
\`\`\`

### 2. Initialize Database
\`\`\`bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
\`\`\`

### 3. Start Redis
\`\`\`bash
# Linux/Mac
redis-server

# Windows (with Redis installed)
redis-server.exe
\`\`\`

### 4. Start Celery Worker
\`\`\`bash
# Linux/Mac
celery -A app.celery worker --loglevel=info

# Windows
celery -A app.celery worker --pool=solo --loglevel=info
\`\`\`

### 5. Start Flask App
\`\`\`bash
flask run --host=0.0.0.0 --port=8000
\`\`\`

## CORS Configuration

\`\`\`python
from flask_cors import CORS

# Allow frontend origin
CORS(app, origins=[
    "http://localhost:3000",  # Development
    "https://your-domain.vercel.app"  # Production
])
\`\`\`

## Error Handling

\`\`\`python
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

@app.errorhandler(413)
def file_too_large(error):
    return jsonify({'error': 'File too large'}), 413
\`\`\`

## Testing the Integration

Use the provided Postman collection to test all endpoints:

1. **Authentication Flow**: Register → Login → Get Token
2. **Upload Flow**: Upload File → Poll Status → Get Note
3. **Download Flow**: Download PDF/DOCX
4. **Error Handling**: Test invalid tokens, missing files, etc.

## Production Deployment

### Environment Variables
\`\`\`env
FLASK_ENV=production
DATABASE_URL=postgresql://user:pass@host:port/db
REDIS_URL=redis://redis-host:6379/0
\`\`\`

### Security Considerations
- Use HTTPS in production
- Set secure JWT secret keys
- Implement rate limiting
- Add input validation and sanitization
- Use proper CORS configuration
- Implement file type validation
- Add virus scanning for uploads

This integration guide provides a complete foundation for connecting your frontend to a Flask/Celery backend with all required endpoints and functionality.
