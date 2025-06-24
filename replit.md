# Employee Feedback Portal

## Overview

The Employee Feedback Portal is a comprehensive web application built with Flask that manages employee information, feedback, billing details, and organizational hierarchy. The system provides managers and employees with tools to track performance, manage teams, and maintain organizational structures with role-based access control.

## System Architecture

### Backend Architecture
- **Framework**: Python Flask with SQLAlchemy ORM
- **Authentication**: Flask-Login with role-based access control
- **Database**: PostgreSQL (production) with SQLite fallback (development)
- **Session Management**: Server-side sessions with configurable secrets
- **File Processing**: pandas and openpyxl for Excel import/export functionality

### Frontend Architecture
- **UI Framework**: Bootstrap 5 for responsive design
- **Charts**: Chart.js for interactive data visualizations
- **Icons**: Font Awesome 6.4.0
- **Typography**: Inter font family for professional appearance
- **Styling**: Custom CSS with CSS variables and glass-effect design patterns

### Data Storage Solutions
- **Primary Database**: PostgreSQL with connection pooling and pre-ping health checks
- **ORM**: SQLAlchemy with declarative base model
- **File Uploads**: Local file system storage with configurable upload directory
- **Session Storage**: Flask sessions with secure secret key management

## Key Components

### Authentication and Authorization
- **User Model**: Employee table serves dual purpose as user authentication
- **Role-Based Access**: Manager vs. Employee access levels
- **Login System**: Email-based authentication with password hashing
- **Session Security**: Configurable session secrets with ProxyFix middleware

### Employee Management
- **Complete Profiles**: Comprehensive employee data including personal, professional, and billing information
- **Hierarchical Relationships**: Manager-subordinate relationships with multi-level support
- **Import/Export**: Excel file processing for bulk employee operations
- **CRUD Operations**: Full create, read, update, delete capabilities

### Feedback System
- **Performance Reviews**: Structured feedback with ratings, goals, and comments
- **Temporal Organization**: Monthly and quarterly feedback cycles
- **Manager Tools**: Feedback provision for direct reports and subordinates
- **Historical Tracking**: Complete feedback history for trend analysis

### Analytics Dashboard
- **Real-time Charts**: Interactive visualizations using Chart.js
- **Key Metrics**: Employee distribution by type, status, team, and location
- **Role-based Views**: Different dashboard perspectives for managers vs. employees
- **Export Capabilities**: Data export functionality for reporting

## Data Flow

1. **Authentication Flow**: User login → Session creation → Role-based redirection
2. **Employee Management Flow**: Manager access → CRUD operations → Database updates → Real-time dashboard updates
3. **Feedback Flow**: Manager selection → Employee feedback entry → Historical storage → Analytics aggregation
4. **Import Flow**: Excel upload → Data validation → Batch processing → Relationship establishment
5. **Dashboard Flow**: User access → Data aggregation → Chart rendering → Interactive filtering

## External Dependencies

### Python Packages
- **Core**: Flask 3.1.1, SQLAlchemy 2.0.41, Flask-Login 0.6.3
- **Database**: psycopg2-binary 2.9.10 for PostgreSQL connectivity
- **File Processing**: pandas 2.3.0, openpyxl 3.1.5 for Excel operations
- **Validation**: email-validator 2.2.0 for email format validation
- **Server**: Gunicorn 23.0.0 for production WSGI serving

### Frontend Dependencies
- **UI Framework**: Bootstrap 5.3.0 from CDN
- **Icons**: Font Awesome 6.4.0 from CDN
- **Charts**: Chart.js with date adapter from CDN
- **Fonts**: Google Fonts Inter family

### Development Tools
- **Environment**: Python 3.11+ with uv package manager
- **Database**: PostgreSQL with development SQLite fallback
- **File Formats**: Excel (.xlsx, .xls) and CSV support

## Deployment Strategy

### Production Configuration
- **WSGI Server**: Gunicorn with bind configuration for 0.0.0.0:5000
- **Database**: PostgreSQL with connection pooling and health checks
- **Environment Variables**: Secure configuration through environment variables
- **File Uploads**: Configurable upload directory with size limits (16MB)

### Development Setup
- **Local Server**: Flask development server with debug mode
- **Hot Reload**: Automatic reloading on code changes
- **Database**: SQLite for local development convenience
- **Logging**: Debug level logging for development troubleshooting

### Scalability Considerations
- **Autoscale Deployment**: Configured for autoscale deployment target
- **Connection Pooling**: Database connection recycling every 300 seconds
- **Static Assets**: CDN delivery for frontend dependencies
- **Session Management**: Server-side sessions for horizontal scaling

## Recent Changes

- June 24, 2025: Completed migration from Replit Agent to standard Replit environment
- June 24, 2025: Set up PostgreSQL database with proper connection and authentication
- June 24, 2025: Resolved login authentication issue by implementing proper data initialization
- June 24, 2025: Created automated employee import system from Excel with manager hierarchy
- June 24, 2025: Established role-based access control (managers only can access system)
- June 24, 2025: Set up standard password system (manager123 for managers, welcome123 for employees)

## Changelog

- June 21, 2025: Initial setup
- June 21, 2025: Professional UI overhaul and hierarchy implementation

## User Preferences

Preferred communication style: Simple, everyday language.