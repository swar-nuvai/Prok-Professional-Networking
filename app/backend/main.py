from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import database and models
from models import db, User

# Import API blueprints
from api import auth_bp

# Create Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
# Allow common dev frontend ports for CORS (3000, 5173)
CORS(
    app,
    resources={r"/api/*": {"origins": ["http://localhost:3000", "http://localhost:5173"]}},
)
jwt = JWTManager(app)

# Initialize database
db.init_app(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix="/api")


def setup_database():
    """Setup database tables"""
    with app.app_context():
        db.create_all()
        print("✅ Database tables created successfully!")


# Create a function to initialize the app
def create_app():
    """Application factory function"""
    return app


if __name__ == "__main__":
    # Setup database tables
    setup_database()

    # Run the app
    app.run(debug=True, port=5001)