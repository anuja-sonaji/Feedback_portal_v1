# Employee Feedback Portal

## Project Overview
A comprehensive Flask web application for managing employee information, feedback, billing details, and organizational hierarchy. Successfully migrated from Replit Agent to standard Replit environment.

## Architecture
- **Backend**: Flask with SQLAlchemy ORM
- **Database**: PostgreSQL (Replit managed)
- **Authentication**: Flask-Login with role-based access
- **File Handling**: Excel import/export with pandas and openpyxl
- **Deployment**: Gunicorn WSGI server

## Key Features
- Employee management and hierarchy visualization
- Excel file import/export functionality
- Feedback collection system
- Manager authentication and access control
- Billing and rate management

## Recent Changes
- **2025-01-25**: Comprehensive documentation update
  - Created detailed README.md with full feature documentation
  - Added installation guide for Visual Studio Code development
  - Included database schema documentation and setup instructions
  - Added troubleshooting guide and VS Code configuration
  - Created requirements.txt and environment configuration files
- **2025-01-25**: Migrated from Replit Agent to Replit environment
  - Created PostgreSQL database with environment variables
  - Installed all Python dependencies via package manager
  - Initialized database tables
  - Verified application functionality
  - Updated billing page with custom columns: Full_Name, Employment_Type, Manager_Name, Manager_ID, BillingRate, Rate_Card, SWP_2025
  - Configured billing data to pull from imported Excel sheet
  - Set Rate_Card to default "L4" and SWP_2025 to "2025" for all employees
  - Fixed billing view to show only reportees' data, excluding manager's own billing details
  - Added edit functionality for managers to update billing rates, rate cards, and SWP values
  - Redesigned organization hierarchy with modern card-based layout and connecting lines
  - Enhanced hierarchy with employee avatars, detailed information cards, and manager statistics
  - Implemented smooth animations and responsive design for better user experience
  - Updated billing page with custom columns as requested:
    * Full_Name, Employment_Type, Manager_Name, Manager_ID from Excel data
    * BillingRate from Excel data
    * Rate_Card defaulted to "L4" for all employees
    * Swp_2025 defaulted to "2025" for all employees

## Database Schema
- **employees**: Main employee data with hierarchical relationships
- **feedback**: Employee feedback collection
- **manager_logins**: Authentication data for managers

## Environment Variables
- DATABASE_URL: PostgreSQL connection string (auto-configured)
- SESSION_SECRET: Flask session security key
- Additional PostgreSQL variables: PGPORT, PGUSER, PGPASSWORD, PGDATABASE, PGHOST

## User Preferences
*None specified yet*

## Development Notes
- Application runs on port 5000 with Gunicorn
- Debug mode enabled for development
- File uploads limited to 16MB
- Uses ProxyFix middleware for proper request handling