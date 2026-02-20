from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from models import db, User
from functools import wraps
from datetime import datetime, timedelta
import re

auth_bp = Blueprint('auth', __name__)

# Simple rate limiting storage (in production, use Redis or similar)
_rate_limit_storage = {}

def rate_limit(max_requests=5, window_seconds=60):
    """Simple rate limiting decorator"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            client_ip = request.remote_addr
            key = f"{f.__name__}:{client_ip}"
            now = datetime.now()
            
            if key in _rate_limit_storage:
                requests, last_reset = _rate_limit_storage[key]
                if (now - last_reset).total_seconds() > window_seconds:
                    requests = 0
                    last_reset = now
            else:
                requests = 0
                last_reset = now
            
            if requests >= max_requests:
                return jsonify({
                    'message': 'Too many requests. Please try again later.'
                }), 429
            
            _rate_limit_storage[key] = (requests + 1, last_reset)
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def sanitize_input(text):
    """Sanitize user input to prevent injection attacks"""
    if not text:
        return None
    # Remove potentially dangerous characters
    text = text.strip()
    # Remove null bytes
    text = text.replace('\x00', '')
    return text

@auth_bp.route('/signup', methods=['POST'])
@rate_limit(max_requests=5, window_seconds=60)
def signup():
    """Register a new user"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'message': 'No data provided'}), 400
        
        # Extract and sanitize inputs
        username = sanitize_input(data.get('username'))
        email = sanitize_input(data.get('email'))
        password = data.get('password')
        
        # Validate required fields
        if not username:
            return jsonify({'message': 'Username is required'}), 400
        if not email:
            return jsonify({'message': 'Email is required'}), 400
        if not password:
            return jsonify({'message': 'Password is required'}), 400
        
        # Validate email format
        if not User.validate_email(email):
            return jsonify({'message': 'Invalid email format'}), 400
        
        # Validate password complexity
        if not User.validate_password_complexity(password):
            return jsonify({
                'message': 'Password must be at least 8 characters and contain uppercase, lowercase, and a digit'
            }), 400
        
        # Check if username already exists
        if User.query.filter_by(username=username).first():
            return jsonify({'message': 'Username already exists'}), 400
        
        # Check if email already exists
        if User.query.filter_by(email=email).first():
            return jsonify({'message': 'Email already exists'}), 400
        
        # Create new user
        try:
            new_user = User(username=username, email=email, password=password)
            db.session.add(new_user)
            db.session.commit()
            
            return jsonify({
                'message': 'User created successfully',
                'user': new_user.to_dict()
            }), 201
        
        except ValueError as e:
            return jsonify({'message': str(e)}), 400
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': 'Error creating user. Please try again.'}), 500
    
    except Exception as e:
        return jsonify({'message': 'An error occurred. Please try again.'}), 500

@auth_bp.route('/login', methods=['POST'])
@rate_limit(max_requests=5, window_seconds=60)
def login():
    """Authenticate user and return JWT token"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'message': 'No data provided'}), 400
        
        # Extract inputs
        username_or_email = sanitize_input(data.get('usernameOrEmail') or data.get('username') or data.get('email'))
        password = data.get('password')
        
        # Validate required fields
        if not username_or_email:
            return jsonify({'message': 'Username or email is required'}), 400
        if not password:
            return jsonify({'message': 'Password is required'}), 400
        
        # Find user by username or email
        user = User.query.filter(
            (User.username == username_or_email) | (User.email == username_or_email)
        ).first()
        
        # Check if user exists and password is correct
        if not user or not user.check_password(password):
            return jsonify({'message': 'Invalid username/email or password'}), 401
        
        # Generate JWT token
        access_token = create_access_token(
            identity=user.id,
            expires_delta=timedelta(hours=1)
        )
        
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': user.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({'message': 'An error occurred. Please try again.'}), 500

@auth_bp.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'service': 'authentication'}), 200
