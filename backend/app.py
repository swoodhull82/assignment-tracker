from flask import Flask
from .models import db  # Assuming models.py is in the same directory
from .config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)

    # A simple route to test if the app is running
    @app.route('/health')
    def health():
        return 'OK', 200

    # It's good practice to create tables within the app context
    # if they don't exist, especially for SQLite in development.
    # For production, migrations (e.g., Flask-Migrate) are better.
    with app.app_context():
        db.create_all() # This will create tables based on models in models.py

    # Register blueprints for API routes here (to be created in routes.py)
    from .routes import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')


    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
