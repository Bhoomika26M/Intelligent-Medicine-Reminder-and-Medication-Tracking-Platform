from flask_cors import CORS
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import datetime, date
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
from datetime import datetime
import os

load_dotenv()

app = Flask(__name__)
from flask_mail import Mail, Message

app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'afsaaiman33@gmail.com'  
app.config['MAIL_PASSWORD'] = 'fmtpnsokusskfhul'     

mail = Mail(app)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///medicine_reminder.db'
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-secret-key-change-later')

db = SQLAlchemy(app)
jwt = JWTManager(app)
CORS(app)

# ---------------- USER MODEL ----------------
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "created_at": self.created_at.isoformat()
        }
    # ---------------- MEDICINE MODEL ----------------
class Medicine(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    dosage = db.Column(db.String(50), nullable=False)
    frequency = db.Column(db.String(50), nullable=False)
    time_of_day = db.Column(db.String(100), nullable=False)
    start_date = db.Column(db.DateTime, default=datetime.utcnow)
    end_date = db.Column(db.DateTime, nullable=True)
    notes = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "dosage": self.dosage,
            "frequency": self.frequency,
            "time_of_day": self.time_of_day,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "notes": self.notes,
            "created_at": self.created_at.isoformat()
        }
# --- MEDICATION HISTORY MODEL ---
class MedicationHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    medicine_id = db.Column(db.Integer, db.ForeignKey('medicine.id'), nullable=False)
    scheduled_time = db.Column(db.DateTime, nullable=False)
    actual_time_taken = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.String(20), default='missed')
    
    # Relationships
    user = db.relationship('User', backref='medication_histories')
    medicine = db.relationship('Medicine', backref='medication_histories')
# ---------------- ROUTES ----------------
@app.route('/')
def home():
    return jsonify({"message": "Medicine Reminder API is running!"})

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()

    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required"}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"error": "Email already registered"}), 409

    hashed_password = generate_password_hash(password)
    new_user = User(name=name, email=email, password_hash=hashed_password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully", "user": new_user.to_dict()}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid email or password"}), 401

    access_token = create_access_token(identity=str(user.id))
    return jsonify({"message": "Login successful", "token": access_token, "user": user.to_dict()}), 200

@app.route('/api/profile', methods=['GET'])
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({"user": user.to_dict()}), 200

@app.route('/send-reminder/<int:medicine_id>', methods=['POST'])
@jwt_required()
def send_reminder(medicine_id):
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    medicine = Medicine.query.filter_by(id=medicine_id, user_id=int(user_id)).first()
    
    if not medicine:
        return jsonify({'error': 'Medicine not found'}), 404
    
    try:
        msg = Message(
            subject=f'💊 Medicine Reminder: {medicine.name}',
            sender='your-email@gmail.com',
            recipients=[user.email],
            body=f"""
            Hello {user.name},
            
            This is a reminder to take your medicine:
            
            💊 Medicine: {medicine.name}
            📊 Dosage: {medicine.dosage}
            ⏰ Frequency: {medicine.frequency}
            🕐 Time: {medicine.time_of_day}
            📝 Notes: {medicine.notes or 'No notes'}
            
            Stay healthy! 🌟
            """
        )
        mail.send(msg)
        
        return jsonify({'message': f'Reminder sent to {user.email}'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
# ---------------- ADD MEDICINE ----------------
@app.route('/medicines', methods=['POST'])
@jwt_required()
def add_medicine():
    data = request.get_json()
    user_id = get_jwt_identity()

    name = data.get('name')
    dosage = data.get('dosage')
    frequency = data.get('frequency')
    time_of_day = data.get('time_of_day')
    notes = data.get('notes')
    start_date = data.get('start_date')
    end_date = data.get('end_date')

    if not name or not dosage or not frequency or not time_of_day:
        return jsonify({"error": "Missing required fields"}), 400

    # Convert dates if provided
    from datetime import datetime
    start_date_obj = None
    end_date_obj = None
    
    if start_date:
        start_date_obj = datetime.strptime(start_date, '%Y-%m-%d')
    if end_date:
        end_date_obj = datetime.strptime(end_date, '%Y-%m-%d')

    new_medicine = Medicine(
        user_id=int(user_id),
        name=name,
        dosage=dosage,
        frequency=frequency,
        time_of_day=time_of_day,
        notes=notes,
        start_date=start_date_obj or datetime.utcnow(),
        end_date=end_date_obj
    )

    db.session.add(new_medicine)
    db.session.commit()

    return jsonify({"message": "Medicine added successfully", "medicine": new_medicine.to_dict()}), 201
# ---------------- GET ALL MEDICINES ----------------
@app.route('/medicines', methods=['GET'])
@jwt_required()
def get_medicines():
    user_id = get_jwt_identity()
    medicines = Medicine.query.filter_by(user_id=int(user_id)).all()
    return jsonify({"medicines": [m.to_dict() for m in medicines]}), 200

# --- UPDATE MEDICINE ---
@app.route('/medicine/<int:medicine_id>', methods=['PUT'])
@jwt_required()
def update_medicine(medicine_id):
    user_id = get_jwt_identity()
    medicine = Medicine.query.filter_by(id=medicine_id, user_id=int(user_id)).first()
    
    if not medicine:
        return jsonify({'message': 'Medicine not found!'}), 404
    
    data = request.get_json()
    
    if 'name' in data:
        medicine.name = data['name']
    if 'dosage' in data:
        medicine.dosage = data['dosage']
    if 'frequency' in data:
        medicine.frequency = data['frequency']
    if 'time_of_day' in data:
        medicine.time_of_day = data['time_of_day']
    if 'notes' in data:
        medicine.notes = data['notes']
    if 'end_date' in data:
        medicine.end_date = data['end_date']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Medicine updated successfully!',
        'medicine': medicine.to_dict()
    }), 200
# --- DELETE MEDICINE ---
@app.route('/medicine/<int:medicine_id>', methods=['DELETE'])
@jwt_required()
def delete_medicine(medicine_id):
    user_id = get_jwt_identity()
    medicine = Medicine.query.filter_by(id=medicine_id, user_id=int(user_id)).first()
    
    if not medicine:
        return jsonify({'message': 'Medicine not found!'}), 404
    
    db.session.delete(medicine)
    db.session.commit()
    
    return jsonify({'message': 'Medicine deleted successfully!'}), 200
# --- GET TODAY'S SCHEDULE ---
@app.route('/medicine/today', methods=['GET'])
@jwt_required()
def get_today_schedule():
    user_id = get_jwt_identity()
    today = date.today()
    
    medicines = Medicine.query.filter_by(user_id=int(user_id)).all()
    
    today_medicines = []
    for med in medicines:
        # Check start date
        if med.start_date:
            med_start = med.start_date.date() if hasattr(med.start_date, 'date') else med.start_date
            if med_start > today:
                continue
        
        # Check end date
        if med.end_date:
            med_end = med.end_date.date() if hasattr(med.end_date, 'date') else med.end_date
            if med_end < today:
                continue
        
        today_medicines.append({
            'id': med.id,
            'name': med.name,
            'dosage': med.dosage,
            'frequency': med.frequency,
            'time_of_day': med.time_of_day,
            'notes': med.notes
        })
    
    return jsonify({
        'date': today.isoformat(),
        'medicines': today_medicines,
        'count': len(today_medicines)
    }), 200
# --- MARK MEDICINE AS TAKEN ---
@app.route('/medicine/take/<int:medicine_id>', methods=['POST'])
@jwt_required()
def mark_as_taken(medicine_id):
    user_id = get_jwt_identity()
    medicine = Medicine.query.filter_by(id=medicine_id, user_id=int(user_id)).first()
    
    if not medicine:
        return jsonify({'message': 'Medicine not found!'}), 404
    
    # Create history entry
    history = MedicationHistory(
        user_id=int(user_id),
        medicine_id=medicine.id,
        scheduled_time=datetime.now(),
        actual_time_taken=datetime.now(),
        status='taken'
    )
    
    db.session.add(history)
    db.session.commit()
    
    return jsonify({
        'message': f'Medicine "{medicine.name}" marked as taken!',
        'medicine_id': medicine.id,
        'taken_at': datetime.now().isoformat()
    }), 200
# --- GET MEDICATION HISTORY ---
@app.route('/medicine/history', methods=['GET'])
@jwt_required()
def get_medication_history():
    user_id = get_jwt_identity()
    
    # Get all history for this user
    history = MedicationHistory.query.filter_by(user_id=int(user_id)).all()
    
    result = []
    for h in history:
        result.append({
            'id': h.id,
            'medicine_id': h.medicine_id,
            'medicine_name': h.medicine.name if h.medicine else 'Unknown',
            'scheduled_time': h.scheduled_time.isoformat(),
            'actual_time_taken': h.actual_time_taken.isoformat() if h.actual_time_taken else None,
            'status': h.status
        })
    
    return jsonify({
        'history': result,
        'count': len(result)
    }), 200
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)