# utils.py
import pandas as pd
import json
from datetime import datetime
import re

ALLOWED_EXTENSIONS = {'xlsx', 'xls', 'csv'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def process_excel_file(file, manager_id):
    """Process uploaded Excel file and create employee records"""
    from app import db
    from models import Employee

    result = {
        'success': False,
        'count': 0,
        'skipped': 0,
        'errors': [],
        'error': None
    }

    try:
        # Read Excel file with multiple sheet support
        try:
            df = pd.read_excel(file, sheet_name=0)  # Read first sheet
        except Exception as e:
            result['error'] = f"Failed to read Excel file: {str(e)}"
            return result

        if df.empty:
            result['error'] = "Excel file is empty"
            return result

        # Normalize column names (remove extra spaces, handle case variations)
        df.columns = df.columns.str.strip()

        # Expected columns matching the database schema - handles various Excel formats
        expected_columns = {
            'Employment_Type': 'employment_type',
            'Employment Type': 'employment_type',
            'Billable_Status': 'billable_status',
            'Billable Status': 'billable_status', 
            'Employee_Status': 'employee_status',
            'Employee Status': 'employee_status',
            'System_ID': 'system_id',
            'System ID': 'system_id',
            'Bensl_ID': 'bensl_id',
            'Bensl ID': 'bensl_id',
            'BENSL_ID': 'bensl_id',
            'Full_Name': 'full_name',
            'Full Name': 'full_name',
            'Name': 'full_name',
            'Employee Name': 'full_name',
            'Role ': 'role',  # Note the space in Excel column
            'Role': 'role',   # Handle both cases
            'Designation': 'designation',
            'Team': 'team',
            'Skill': 'skill',
            'Skills': 'skill',
            'Manager': 'manager_name',
            'Manager Name': 'manager_name',
            'Manager_Name': 'manager_name',
            'Location': 'location',
            'Grade': 'grade',
            'Gender': 'gender',
            'Company': 'company',
            'Email': 'emailid',
            'Email ID': 'emailid',
            'EmailID': 'emailid',
            'Billing Rate': 'billing_rate',
            'Billing_Rate': 'billing_rate',
            'BillingRate': 'billing_rate',
            'Rate Card': 'rate_card',
            'Rate_Card': 'rate_card',
            'Critical': 'critical',
            'Remarks': 'remarks',
            'DOJ_Allianz': 'doj_allianz',
            'DOJ Allianz': 'doj_allianz',
            'Date of Joining': 'doj_allianz',
            'DOL_Allianz': 'dol_allianz',
            'DOL Allianz': 'dol_allianz',
            'Date of Leaving': 'dol_allianz',
            'DOJ_Project': 'doj_project',
            'DOJ Project': 'doj_project',
            'Project Start Date': 'doj_project',
            'DOL_Project': 'dol_project',
            'DOL Project': 'dol_project',
            'Project End Date': 'dol_project'
        }

        # Validate that we have at least one recognizable column
        found_columns = []
        column_mapping = {}

        for excel_col, db_field in expected_columns.items():
            if excel_col in df.columns:
                found_columns.append(excel_col)
                column_mapping[excel_col] = db_field

        if not found_columns:
            result['error'] = f"No recognized columns found. Expected columns: {', '.join(expected_columns.keys())}"
            return result

        # Store employee data for processing
        temp_employees = []
        processed_bensl_ids = set()

        # Process each row in the Excel file
        for index, row in df.iterrows():
            try:
                # Skip completely empty rows
                if row.isna().all():
                    continue
                
                # Skip rows without Full_Name (essential field)
                if pd.isna(row.get('Full_Name')):
                    result['errors'].append(f"Row {index + 2}: Missing Full_Name, skipping")
                    continue
                    
                # Check for duplicate Bensl_ID
                bensl_id = str(row.get('Bensl_ID', '')).strip() if pd.notna(row.get('Bensl_ID')) else None
                if bensl_id and bensl_id in processed_bensl_ids:
                    result['errors'].append(f"Row {index + 2}: Duplicate Bensl_ID {bensl_id}, skipping")
                    continue
                if bensl_id:
                    processed_bensl_ids.add(bensl_id)

                # Create employee data dictionary
                employee_data = {}

                # Map Excel columns to database fields
                for excel_col, db_field in column_mapping.items():
                    value = row.get(excel_col)
                    if pd.notna(value):
                        if excel_col in ['BillingRate', 'Billing_Rate']:
                            # Handle billing rate - if it's not numeric, store as None
                            try:
                                employee_data[db_field] = float(value)
                            except (ValueError, TypeError):
                                employee_data[db_field] = None
                        elif excel_col in ['DOJ_Allianz', 'DOL_Allianz', 'DOJ_Project', 'DOL_Project']:
                            # Handle date fields
                            try:
                                if isinstance(value, str):
                                    # Try multiple date formats
                                    for date_format in ['%Y-%m-%d', '%d/%m/%Y', '%m/%d/%Y', '%d-%m-%Y']:
                                        try:
                                            employee_data[db_field] = datetime.strptime(value, date_format).date()
                                            break
                                        except ValueError:
                                            continue
                                    else:
                                        employee_data[db_field] = None
                                else:
                                    employee_data[db_field] = value.date() if hasattr(value, 'date') else None
                            except (ValueError, TypeError):
                                employee_data[db_field] = None
                        else:
                            # Handle text fields
                            employee_data[db_field] = str(value).strip() if value else None
                    else:
                        employee_data[db_field] = None

                # Check if we have enough data to create an employee
                if not employee_data.get('full_name'):
                    result['errors'].append(f"Row {index + 2}: Missing Full Name")
                    continue

                # Check if employee already exists (by bensl_id)
                existing_employee = None
                if employee_data.get('bensl_id'):
                    existing_employee = Employee.query.filter_by(bensl_id=employee_data['bensl_id']).first()

                if existing_employee:
                    result['skipped'] += 1
                    result['errors'].append(f"Row {index + 2}: Employee with Bensl_ID {employee_data.get('bensl_id')} already exists")
                    continue

                temp_employees.append(employee_data)

            except Exception as e:
                result['errors'].append(f"Row {index + 2}: Error processing row - {str(e)}")
                continue

        # Second pass: Create employees in database
        for emp_data in temp_employees:
            try:
                employee = Employee()

                # Map all the fields from employee_data to Employee model
                for field, value in emp_data.items():
                    if hasattr(employee, field) and value is not None:
                        setattr(employee, field, value)

                # Generate email if not provided
                if not employee.emailid and employee.full_name:
                    employee.emailid = employee.full_name.lower().replace(' ', '.') + '@allianz.com'

                # Set default values for required fields if not provided
                if not employee.employment_type:
                    employee.employment_type = 'Permanent'
                if not employee.billable_status:
                    employee.billable_status = 'Billable'
                if not employee.employee_status:
                    employee.employee_status = 'ACTIVE'

                # Set manager relationship - imported employees are always assigned to the importing manager
                employee.manager_id = manager_id
                manager = Employee.query.get(manager_id)
                if manager:
                    employee.manager_name = manager.full_name
                else:
                    # Fallback - this shouldn't happen but ensures data integrity
                    employee.manager_name = 'Unknown Manager'

                # Set default password
                employee.set_password('password123')

                db.session.add(employee)
                result['count'] += 1

            except Exception as e:
                result['errors'].append(f"Failed to create employee: {str(e)}")
                continue

        # Commit all employees first
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            result['error'] = f"Failed to save employees: {str(e)}"
            return result

        # Third pass: Establish manager relationships
        all_employees = Employee.query.all()
        employee_lookup = {emp.bensl_id: emp for emp in all_employees if emp.bensl_id}
        
        for employee in all_employees:
            if employee.manager_bensl_id and employee.manager_bensl_id in employee_lookup:
                manager = employee_lookup[employee.manager_bensl_id]
                employee.manager_id = manager.id
                manager.is_manager = True
        
        # Final commit for relationships
        try:
            db.session.commit()
        except Exception as e:
            result['errors'].append(f"Warning: Failed to establish some manager relationships: {str(e)}")

        result['success'] = True
        return result

    except Exception as e:
        db.session.rollback()
        result['error'] = f"Unexpected error: {str(e)}"
        return result

def establish_manager_relationships():
    """Establish manager-employee relationships using manager_bensl_id"""
    from app import db
    from models import Employee
    
    try:
        # Get all employees with manager_bensl_id
        employees = Employee.query.filter(Employee.manager_bensl_id.isnot(None)).all()
        
        for employee in employees:
            if employee.manager_bensl_id:
                # Find the manager by their Bensl_ID
                manager = Employee.query.filter_by(bensl_id=employee.manager_bensl_id).first()
                if manager:
                    employee.manager_id = manager.id
                    manager.is_manager = True
        
        db.session.commit()
        print("Manager relationships established successfully")
        
    except Exception as e:
        db.session.rollback()
        print(f"Error establishing manager relationships: {str(e)}")

def get_dashboard_analytics(employees):
    """Generate analytics data for dashboard charts"""
    if not employees:
        return {
            'skills': {},
            'employment_type': {},
            'billable_status': {},
            'location': {},
            'team': {},
            'total_employees': 0
        }

    analytics = {
        'skills': {},
        'employment_type': {},
        'billable_status': {},
        'location': {},
        'team': {},
        'total_employees': len(employees)
    }

    for employee in employees:
        # Employment type analytics
        emp_type = employee.employment_type or 'Unknown'
        analytics['employment_type'][emp_type] = analytics['employment_type'].get(emp_type, 0) + 1

        # Billable status analytics
        billable = employee.billable_status or 'Unknown'
        analytics['billable_status'][billable] = analytics['billable_status'].get(billable, 0) + 1

        # Location analytics
        location = employee.location or 'Unknown'
        analytics['location'][location] = analytics['location'].get(location, 0) + 1

        # Team analytics
        team = employee.team or 'Unknown'
        analytics['team'][team] = analytics['team'].get(team, 0) + 1

        # Skills analytics (assuming skills are comma-separated)
        if employee.skill:
            skills_list = [skill.strip() for skill in employee.skill.split(',')]
            for skill in skills_list:
                if skill:
                    analytics['skills'][skill] = analytics['skills'].get(skill, 0) + 1

    return analytics

def create_sample_data():
    """Create line managers based on Excel file data"""
    try:
        # Import here to avoid circular imports
        from app import db
        from models import Employee
        if Employee.query.first():
            return

        # Create line managers only (based on Excel file)
        line_managers = [
            {
                'full_name': 'Anuja Sonaji',
                'emailid': 'anuja.sonaji@allianz.com',
                'system_id': 'ANJ001',
                'designation': 'Senior Manager',
                'team': 'Development',
                'is_manager': True
            },
            {
                'full_name': 'Asha Vijayan',
                'emailid': 'asha.vijayan@allianz.com',
                'system_id': 'ASH001',
                'designation': 'Team Lead',
                'team': 'Quality Assurance',
                'is_manager': True
            },
            {
                'full_name': 'Deepak Krishnan',
                'emailid': 'deepak.krishnan2@allianz.com',
                'system_id': 'DEE001',
                'designation': 'Project Manager',
                'team': 'Project Management',
                'is_manager': True
            },
            {
                'full_name': 'Sooraj Valliot',
                'emailid': 'sooraj.valliot@allianz.com',
                'system_id': 'SOO001',
                'designation': 'Technical Lead',
                'team': 'Architecture',
                'is_manager': True
            },
            {
                'full_name': 'Richa Sinha',
                'emailid': 'richa.sinha@allianz.com',
                'system_id': 'RIC001',
                'designation': 'Manager',
                'team': 'RG',
                'is_manager': True
            }
        ]

        for manager_data in line_managers:
            manager = Employee(
                system_id=manager_data['system_id'],
                bensl_id=manager_data['system_id'],
                full_name=manager_data['full_name'],
                emailid=manager_data['emailid'],
                designation=manager_data['designation'],
                role='Manager',
                team=manager_data['team'],
                location='Bangalore',
                employment_type='Permanent',
                employee_status='ACTIVE',
                billable_status='Non-billable',
                is_manager=True,
                manager_id=None,
                company='Allianz Technology'
            )
            # Set default password for managers
            manager.set_password('Manager@123')
            db.session.add(manager)
        
        db.session.commit()
        print("Line managers created successfully")

    except Exception as e:
        db.session.rollback()
        print(f"Error creating sample data: {str(e)}")

def build_hierarchy_from_excel(file_path):
    """Build hierarchy relationships after importing employee data"""
    try:
        # Read the Excel file
        df = pd.read_excel(file_path)

        # Process each row to establish manager relationships
        for index, row in df.iterrows():
            try:
                # Find the employee
                employee_id = row.get('System_ID') or row.get('Bensl_ID')
                manager_name = row.get('Manager_Name') or row.get('Manager Name')

                if pd.isna(employee_id) or pd.isna(manager_name):
                    continue

                # Find the employee in database
                employee = Employee.query.filter(
                    (Employee.system_id == str(employee_id)) | 
                    (Employee.bensl_id == str(employee_id))
                ).first()

                if not employee:
                    continue

                # Find the manager
                manager = Employee.query.filter(
                    Employee.full_name.ilike(f'%{manager_name}%')
                ).first()

                if manager and manager.id != employee.id:
                    employee.manager_id = manager.id
                    employee.manager_name = manager.full_name

                    # Set manager flag if not already set
                    if not manager.is_manager:
                        manager.is_manager = True

            except Exception as e:
                print(f"Error processing row {index}: {str(e)}")
                continue

        db.session.commit()
        return {'success': True, 'message': 'Hierarchy relationships updated successfully'}

    except Exception as e:
        db.session.rollback()
        return {'success': False, 'error': f'Error building hierarchy: {str(e)}'}