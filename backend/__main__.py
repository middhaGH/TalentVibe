import os
from dotenv import load_dotenv
from waitress import serve

# Load environment variables from .env file.
# This is done first to ensure the API key is available for all subsequent imports.
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
dotenv_path = os.path.join(project_root, '.env')
load_dotenv(dotenv_path=dotenv_path)

# Now that the environment is loaded, import the app.
from backend.app import app, db, socketio

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    
    # Use SocketIO for development (supports WebSockets)
    # For production, you might want to use waitress with a separate WebSocket server
    socketio.run(app, host='0.0.0.0', port=5000, debug=True) 