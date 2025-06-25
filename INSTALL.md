# Installation Guide - Employee Feedback Portal

## 🎯 Quick Start Options

### Option 1: Replit (Recommended for Development)
1. Open the project in Replit
2. Dependencies and database are automatically configured
3. Click "Run" to start the application
4. Access at the provided URL

### Option 2: Visual Studio Code (Local Development)

#### Prerequisites Check
Before starting, ensure you have:
- [ ] Python 3.11+ installed (`python --version`)
- [ ] PostgreSQL 14+ installed and running
- [ ] Git installed
- [ ] Visual Studio Code with Python extension

#### Step 1: Project Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd employee-feedback-portal

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

#### Step 2: Install Dependencies
```bash
pip install -r requirements.txt
```

#### Step 3: Database Configuration

##### PostgreSQL Installation (if not installed)

**Windows:**
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run installer and note the password for 'postgres' user
3. Add PostgreSQL bin folder to PATH

**macOS:**
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

##### Database Setup
```bash
# Connect to PostgreSQL
# Windows: Open pgAdmin or use psql
# macOS/Linux: 
sudo -u postgres psql

# Create database and user
CREATE DATABASE employee_feedback_db;
CREATE USER emp_user WITH PASSWORD 'secure_password123';
GRANT ALL PRIVILEGES ON DATABASE employee_feedback_db TO emp_user;
\q
```

#### Step 4: Environment Configuration
```bash
# Copy example environment file
cp .env.example .env

# Edit .env file with your database details
# Update DATABASE_URL with your credentials:
DATABASE_URL=postgresql://emp_user:secure_password123@localhost:5432/employee_feedback_db
```

#### Step 5: Initialize Application
```bash
# Initialize database tables
python -c "from app import app, db; 
with app.app_context(): 
    db.create_all(); 
    print('✅ Database tables created successfully')"
```

#### Step 6: Run Application
```bash
# Development server
python main.py

# Or with Gunicorn (production-like)
gunicorn --bind 127.0.0.1:5000 --reload main:app
```

#### Step 7: Access Application
Open your browser and navigate to: `http://localhost:5000`

## 🔧 VS Code Configuration

### Recommended Extensions
Install these VS Code extensions for better development experience:
- Python (Microsoft)
- Python Docstring Generator
- SQLTools
- SQLTools PostgreSQL/Cockroach Driver
- GitLens
- Prettier - Code formatter

### VS Code Settings
Create `.vscode/settings.json`:
```json
{
    "python.defaultInterpreterPath": "./venv/bin/python",
    "python.linting.enabled": true,
    "python.linting.pylintEnabled": false,
    "python.linting.flake8Enabled": true,
    "python.formatting.provider": "black",
    "editor.formatOnSave": true,
    "files.exclude": {
        "**/__pycache__": true,
        "**/*.pyc": true
    }
}
```

### Launch Configuration
Create `.vscode/launch.json`:
```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Python: Flask",
            "type": "python",
            "request": "launch",
            "program": "${workspaceFolder}/main.py",
            "env": {
                "FLASK_ENV": "development",
                "FLASK_DEBUG": "1"
            },
            "args": [],
            "jinja": true,
            "justMyCode": true
        }
    ]
}
```

## 🐳 Docker Setup (Optional)

Create `Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "main:app"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/employee_feedback_db
      - SESSION_SECRET=your-secret-key
    depends_on:
      - db
    
  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=employee_feedback_db
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

Run with Docker:
```bash
docker-compose up --build
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection Error
```
sqlalchemy.exc.OperationalError: connection to server failed
```
**Solution:**
- Verify PostgreSQL is running: `pg_ctl status`
- Check credentials in DATABASE_URL
- Ensure database exists: `psql -l`

#### 2. Module Import Error
```
ModuleNotFoundError: No module named 'flask'
```
**Solution:**
- Activate virtual environment
- Install dependencies: `pip install -r requirements.txt`

#### 3. Permission Denied (Database)
```
FATAL: permission denied for database
```
**Solution:**
```sql
GRANT ALL PRIVILEGES ON DATABASE employee_feedback_db TO emp_user;
GRANT ALL ON SCHEMA public TO emp_user;
```

#### 4. Port Already in Use
```
OSError: [Errno 48] Address already in use
```
**Solution:**
```bash
# Find process using port 5000
lsof -i :5000
# Kill the process
kill -9 <PID>
```

### VS Code Specific Issues

#### 1. Python Interpreter Not Found
- Press `Ctrl+Shift+P` → "Python: Select Interpreter"
- Choose `./venv/bin/python` (or `./venv/Scripts/python.exe` on Windows)

#### 2. Debugger Not Working
- Ensure launch.json is configured correctly
- Check that Flask app is in debug mode
- Verify breakpoints are set on executable lines

## 📋 Post-Installation Checklist

- [ ] Application starts without errors
- [ ] Database connection successful
- [ ] Can access login page at `/`
- [ ] Can import Excel files
- [ ] Dashboard displays correctly
- [ ] Hierarchy visualization works
- [ ] Billing page loads and functions
- [ ] Search and filters work

## 🔄 Development Workflow

1. **Make Changes**: Edit Python/HTML/CSS files
2. **Test Locally**: Run application and test features
3. **Database Migrations**: Use SQLAlchemy migrations if schema changes
4. **Version Control**: Commit changes with descriptive messages
5. **Deploy**: Push to production environment

## 🆘 Getting Help

If you encounter issues:
1. Check this installation guide
2. Review error logs in console
3. Verify all prerequisites are met
4. Check database connectivity
5. Ensure all environment variables are set correctly

For additional support, refer to the main README.md file.