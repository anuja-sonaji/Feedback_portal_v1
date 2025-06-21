
#!/usr/bin/env python3
"""
Employee Feedback Portal - Main Application Entry Point

A comprehensive Flask web application for managing employee information,
feedback, billing details, and organizational hierarchy.

Usage:
    python main.py          # Run development server
    python3 main.py         # On some Mac/Linux systems
"""

import os
import sys
from app import app

def main():
    """Main application entry point with error handling"""
    try:
        print("🚀 Starting Employee Feedback Portal...")
        print(f"📁 Project directory: {os.getcwd()}")
        print(f"🐍 Python version: {sys.version}")
        print("🌐 Application will be available at: http://localhost:5000")
        print("📧 Default login: sooraj@company.com / password123")
        print("─" * 60)
        
        # Run the Flask application
        app.run(
            host='0.0.0.0',  # Accept connections from any IP
            port=5000,       # Standard Flask development port
            debug=True,      # Enable debug mode for development
            use_reloader=True,  # Auto-reload on code changes
            threaded=True    # Handle multiple requests
        )
        
    except KeyboardInterrupt:
        print("\n🛑 Application stopped by user")
        sys.exit(0)
        
    except Exception as e:
        print(f"❌ Error starting application: {e}")
        print("\n🔧 Troubleshooting tips:")
        print("1. Check if port 5000 is already in use")
        print("2. Verify all dependencies are installed")
        print("3. Check the .env file configuration")
        print("4. Ensure database is accessible")
        sys.exit(1)

if __name__ == '__main__':
    main()
