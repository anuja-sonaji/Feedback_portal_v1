# Employee Feedback Portal

A comprehensive web application built with Flask for managing employee information, feedback, billing details, and organizational hierarchy. This portal provides managers and employees with tools to track performance, manage billing, and visualize organizational structure.

## Features

### 🏢 **Dashboard & Analytics**
- **Real-time Charts**: Interactive visualizations showing employee distribution by:
  - Employment Type (Permanent/Contract)
  - Billable Status (Billable/Non-billable)
  - Team Distribution (UFS/RG)
  - Location Distribution
  - Skills Distribution
- **Key Metrics**: Quick overview cards displaying total employees, managers, and department statistics
- **Role-based Access**: Different dashboard views for managers and employees

### 👥 **Employee Management**
- **Complete Employee Profiles**: Manage comprehensive employee information including:
  - Personal details (Name, Email, Employee ID)
  - Professional information (Designation, Department, Location)
  - Team assignment (UFS/RG)
  - Employment details (Type, Billable Status, Join Date)
  - Skills tracking and experience years
  - Manager-employee relationships
- **CRUD Operations**: Add, edit, view, and delete employee records
- **Hierarchical Structure**: Manager-subordinate relationships with multi-level hierarchy support
- **Search & Filter**: Advanced filtering options for employee lists

### 📊 **Feedback Management System**
- **Performance Reviews**: Structured feedback system with:
  - Monthly and Quarterly feedback cycles
  - Performance ratings (1-5 scale)
  - Goals achievement tracking
  - Areas of improvement documentation
  - Strengths identification
  - Detailed comments and observations
- **Manager Tools**: Managers can provide feedback to their direct reports and subordinates
- **Historical Tracking**: Complete feedback history for performance trend analysis
- **Automated Periods**: System automatically manages feedback periods by year, month, and quarter

### 💰 **Billing & Financial Management**
- **Detailed Billing Records**: Track financial information including:
  - Billing rates per employee
  - Project and client assignments
  - Monthly billing hours
  - Total billing amounts
  - Currency management
  - Billing status tracking (Draft/Submitted/Approved/Paid)
- **Financial Reports**: Generate billing summaries and financial analytics
- **Multi-project Support**: Employees can be assigned to multiple projects with different rates

### 🏗️ **Organization Hierarchy**
- **Visual Organization Chart**: Interactive hierarchy visualization showing:
  - Manager-employee relationships
  - Department structure
  - Team distributions
  - Reporting lines
- **Multi-level Management**: Support for complex organizational structures
- **Role Identification**: Clear distinction between managers and employees

### 📤 **Data Import/Export**
- **Excel Import**: Bulk employee data import via Excel files
- **Template Download**: Pre-formatted Excel templates for data import
- **Data Validation**: Comprehensive validation during import process
- **Import Results**: Detailed feedback on import success/failures

### 🔐 **Authentication & Security**
- **Secure Login System**: Email and password-based authentication
- **Role-based Access Control**: Different permissions for managers and employees
- **Session Management**: Secure session handling with Flask-Login
- **Password Security**: Hashed password storage using Werkzeug security

### 📱 **User Interface & Experience**
- **Responsive Design**: Mobile-friendly interface that works on all devices
- **Modern UI**: Clean, professional design with Bootstrap 5
- **Interactive Charts**: Chart.js powered visualizations
- **Flash Messages**: User feedback for all operations
- **Intuitive Navigation**: Role-based sidebar navigation

## Technology Stack

- **Backend**: Python Flask
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap 5
- **Charts**: Chart.js for data visualization
- **Icons**: Font Awesome
- **Authentication**: Flask-Login
- **File Handling**: openpyxl for Excel operations
- **Data Processing**: Pandas for data manipulation

## Setup Instructions for Visual Studio Code (Windows & Mac)

### Prerequisites

1. **Python 3.11 or higher**
   - **Windows**: Download from [python.org](https://www.python.org/downloads/windows/) and install
   - **Mac**: Install via Homebrew: `brew install python@3.11` or download from [python.org](https://www.python.org/downloads/mac-osx/)
   
   Verify installation:
   ```bash
   python --version
   # or on some systems:
   python3 --version
   ```

2. **Visual Studio Code**
   - Download from [code.visualstudio.com](https://code.visualstudio.com/)
   - Install the **Python** extension by Microsoft

3. **Git** (optional, for version control)
   - **Windows**: Download from [git-scm.com](https://git-scm.com/download/win)
   - **Mac**: Install via Homebrew: `brew install git` or download from [git-scm.com](https://git-scm.com/download/mac)

### Step 1: Download the Project

Choose one of these methods:

**Method A: Clone with Git (if you have Git installed)**
```bash
git clone <repository-url>
cd employee-feedback-portal
```

**Method B: Download ZIP**
1. Download the project as a ZIP file
2. Extract to a folder (e.g., `C:\Projects\employee-feedback-portal` on Windows or `~/Projects/employee-feedback-portal` on Mac)
3. Open terminal/command prompt and navigate to the folder:
   ```bash
   # Windows
   cd C:\Projects\employee-feedback-portal
   
   # Mac
   cd ~/Projects/employee-feedback-portal
   ```

### Step 2: Open in Visual Studio Code

1. **Option A**: Open VS Code, then File → Open Folder → Select the project folder
2. **Option B**: From terminal in the project folder:
   ```bash
   code .
   ```

### Step 3: Set Up Python Environment

**Important**: Do NOT create a virtual environment. This application runs directly with system Python.

1. **Open VS Code Terminal**:
   - Press `Ctrl+`` (backtick) or go to Terminal → New Terminal

2. **Install Dependencies**:
   
   **If pyproject.toml exists** (recommended):
   ```bash
   # Windows
   pip install -e .
   
   # Mac
   pip3 install -e .
   ```
   
   **If using requirements file**:
   ```bash
   # Windows
   pip install flask flask-sqlalchemy flask-login psycopg2-binary gunicorn pandas openpyxl email-validator werkzeug sqlalchemy
   
   # Mac
   pip3 install flask flask-sqlalchemy flask-login psycopg2-binary gunicorn pandas openpyxl email-validator werkzeug sqlalchemy
   ```

### Step 4: Set Up Environment Variables

1. **Copy the example environment file**:
   ```bash
   # Windows
   copy .env.example .env
   
   # Mac
   cp .env.example .env
   ```

2. **Edit the `.env` file** using VS Code:
   ```env
   # For quick setup, use SQLite (no database installation needed)
   DATABASE_URL=sqlite:///employee_feedback.db
   
   # Session Security (change this for production)
   SESSION_SECRET=dev-secret-key-change-in-production
   
   # Development Settings
   FLASK_ENV=development
   FLASK_DEBUG=True
   ```

### Step 5: Database Setup (Multiple Options)

**🚀 QUICKSTART - Option A: SQLite (Easiest for development)**
- No additional installation required
- Database file will be created automatically
- Perfect for testing and development

**🏢 Option B: PostgreSQL (For production-like setup)**

**Windows**:
1. Download PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Install with default settings (remember the password you set)
3. Open pgAdmin or use psql command line:
   ```sql
   CREATE DATABASE employee_feedback;
   ```
4. Update `.env` file:
   ```env
   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/employee_feedback
   ```

**Mac**:
1. Install PostgreSQL:
   ```bash
   brew install postgresql
   brew services start postgresql
   ```
2. Create database:
   ```bash
   createdb employee_feedback
   ```
3. Update `.env` file:
   ```env
   DATABASE_URL=postgresql://$(whoami)@localhost:5432/employee_feedback
   ```

### Step 6: Initialize and Run the Application

1. **Initialize the Database** (automatic on first run):
   ```bash
   # Windows
   python main.py
   
   # Mac
   python3 main.py
   ```
   
   The application will:
   - Create database tables automatically
   - Generate sample user data
   - Start the web server

2. **Alternative: Use VS Code's Run Configuration**:
   - Press `F5` to start debugging
   - Or use `Ctrl+F5` to run without debugging
   - VS Code will use the launch configuration provided

### Step 7: Access the Application

1. **Open your web browser** and go to:
   ```
   http://localhost:5000
   ```

2. **Login with default credentials**:
   - **Top Manager**: `sooraj@company.com` / `password123`
   - **Line Manager**: `anuja@company.com` / `password123`
   - **Line Manager**: `asha@company.com` / `password123`

### Step 8: Verify Everything Works

1. **Check the terminal** for any error messages
2. **Test login** with the provided credentials
3. **Navigate through** the dashboard, employees, feedback sections
4. **Check database file**: You should see `employee_feedback.db` in your project folder (if using SQLite)

### Default Login Credentials

**Top Manager (Full Access)**:
- Email: `sooraj@company.com`
- Password: `password123`

**Line Managers**:
- Email: `anuja@company.com` / Password: `password123`
- Email: `asha@company.com` / Password: `password123`
- Email: `vinod@company.com` / Password: `password123`

## Visual Studio Code Configuration

### Recommended Extensions

1. **Python** - Microsoft
2. **Python Debugger** - Microsoft
3. **Flask** - wholroyd
4. **SQLite Viewer** - qwtel
5. **Auto Rename Tag** - Jun Han
6. **Bracket Pair Colorizer** - CoenraadS

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

### Workspace Settings

Create `.vscode/settings.json`:

```json
{
    "python.defaultInterpreterPath": "./venv/bin/python",
    "python.terminal.activateEnvironment": true,
    "files.associations": {
        "*.html": "html"
    },
    "emmet.includeLanguages": {
        "jinja2": "html"
    }
}
```

## Project Structure

```
employee-feedback-portal/
├── app.py                 # Flask application factory
├── main.py               # Application entry point
├── models.py             # Database models
├── routes.py             # URL routes and view functions
├── utils.py              # Utility functions
├── create_users.py       # Sample data creation
├── requirements.txt      # Python dependencies
├── .env                  # Environment variables
├── static/
│   ├── css/
│   │   └── style.css     # Custom styles
│   └── js/
│       └── charts.js     # Chart configurations
├── templates/
│   ├── base.html         # Base template
│   ├── login.html        # Login page
│   ├── dashboard.html    # Dashboard
│   ├── employees.html    # Employee list
│   ├── employee_form.html # Employee add/edit form
│   ├── feedback.html     # Feedback list
│   ├── feedback_form.html # Feedback form
│   ├── billing.html      # Billing records
│   ├── hierarchy.html    # Organization chart
│   ├── import_excel.html # Excel import
│   ├── 404.html          # Error pages
│   └── 500.html
└── uploads/              # File upload directory
```

## Development Workflow

### 1. Database Migrations

When making model changes:

```python
# In Python console or script
from app import app, db
with app.app_context():
    db.create_all()
```

### 2. Adding New Features

1. **Models**: Update `models.py` for new database fields
2. **Routes**: Add new endpoints in `routes.py`
3. **Templates**: Create/modify HTML templates
4. **Static Files**: Add CSS/JS as needed

### 3. Debugging

- Use VS Code debugger with the provided launch configuration
- Check Flask debug logs in the terminal
- Use browser developer tools for frontend debugging
- Database queries can be debugged with logging:

```python
import logging
logging.basicConfig()
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)
```

## Deployment

### Production Setup

1. **Environment Variables**:
   ```env
   FLASK_ENV=production
   DATABASE_URL=postgresql://prod_user:prod_pass@prod_host:5432/prod_db
   SESSION_SECRET=super-secure-secret-key
   ```

2. **Gunicorn Configuration**:
   ```bash
   gunicorn --bind 0.0.0.0:5000 --workers 4 main:app
   ```

3. **Database Backup**:
   ```bash
   pg_dump employee_feedback > backup.sql
   ```

## Troubleshooting

### Common Issues

1. **Python Command Not Found**:
   - **Windows**: Use `python` instead of `python3`, or add Python to PATH
   - **Mac**: Use `python3` if `python` doesn't work, or install Python properly

2. **Database Connection Errors**:
   - **SQLite**: Ensure you have write permissions in the project folder
   - **PostgreSQL**: Check DATABASE_URL in `.env`, ensure PostgreSQL service is running

3. **Import/Module Errors**:
   ```bash
   # Reinstall dependencies
   # Windows:
   pip install --upgrade flask flask-sqlalchemy flask-login psycopg2-binary pandas openpyxl
   
   # Mac:
   pip3 install --upgrade flask flask-sqlalchemy flask-login psycopg2-binary pandas openpyxl
   ```

4. **Port Already in Use (5000)**:
   
   **Windows**:
   ```cmd
   # Find process using port 5000
   netstat -ano | findstr :5000
   # Kill the process (replace PID with actual process ID)
   taskkill /PID <PID> /F
   ```
   
   **Mac**:
   ```bash
   # Find and kill process using port 5000
   lsof -ti:5000 | xargs kill -9
   ```

5. **Permission Errors**:
   - **Windows**: Run VS Code as Administrator if needed
   - **Mac**: Use `sudo` only if absolutely necessary, check folder permissions

6. **VS Code Python Interpreter Issues**:
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
   - Type "Python: Select Interpreter"
   - Choose the correct Python installation

### Platform-Specific Notes

**Windows**:
- Use Command Prompt or PowerShell in VS Code terminal
- Ensure Python is added to system PATH during installation
- Some antivirus software may interfere with Flask development server

**Mac**:
- Use Terminal in VS Code
- If using Homebrew Python, the command might be `python3`
- Ensure Xcode command line tools are installed: `xcode-select --install`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test thoroughly
4. Submit a pull request with detailed description

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the Flask documentation
3. Create an issue in the repository
4. Contact the development team

---

**Happy Coding!** 🚀