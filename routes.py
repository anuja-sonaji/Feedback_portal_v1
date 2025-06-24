import os
import json
import pandas as pd
from datetime import datetime, date
from flask import render_template, redirect, url_for, flash, request, jsonify, send_file
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.utils import secure_filename
from app import app, db
from models import Employee, Feedback, BillingDetail
from utils import process_excel_file, get_dashboard_analytics, allowed_file
# from email_service import send_bulk_manager_notifications

@app.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    
    # Check if system needs setup
    manager_count = Employee.query.filter_by(is_manager=True).count()
    if manager_count == 0:
        return redirect(url_for('setup'))
    
    return redirect(url_for('login'))

@app.route('/setup', methods=['GET', 'POST'])
def setup():
    # Allow setup access but show warning if already complete
    manager_count = Employee.query.filter_by(is_manager=True).count()
    setup_complete = manager_count > 0
    
    status = []
    errors = []
    managers = []
    
    if request.method == 'POST':
        excel_file = request.files.get('excel_file')
        
        if excel_file and allowed_file(excel_file.filename):
            try:
                # Clear existing data
                Employee.query.delete()
                db.session.commit()
                status.append("Cleared existing employee data")
                
                # Read Excel file
                df = pd.read_excel(excel_file)
                status.append(f"Processing {len(df)} employee records from Excel")
                
                # Import employees
                employees_created = 0
                for index, row in df.iterrows():
                    if pd.notna(row.get('Full_Name')):
                        employee = Employee()
                        
                        # Core data
                        employee.full_name = str(row.get('Full_Name')).strip()
                        
                        # Handle Bensl_ID with uniqueness check
                        base_bensl_id = str(row.get('Bensl_ID', f'EMP{index+1:03d}')).strip()
                        bensl_id = base_bensl_id
                        counter = 1
                        while Employee.query.filter_by(bensl_id=bensl_id).first():
                            bensl_id = f"{base_bensl_id}_{counter}"
                            counter += 1
                        employee.bensl_id = bensl_id
                        
                        employee.system_id = str(row.get('System_ID', employee.bensl_id)).strip()
                        
                        # Email handling
                        email = row.get('Emailid')
                        if pd.notna(email) and email.strip():
                            employee.emailid = str(email).strip().lower()
                        else:
                            name_parts = employee.full_name.lower().replace(' ', '.')
                            employee.emailid = f"{name_parts}@company.com"
                        
                        # Job details
                        employee.designation = str(row.get('Designation', 'Employee')).strip()
                        employee.team = str(row.get('Team', 'General')).strip()
                        employee.location = str(row.get('Location', 'Office')).strip()
                        employee.employment_type = str(row.get('Employment_Type', 'Permanent')).strip()
                        employee.billable_status = str(row.get('Billable_Status', 'Billable')).strip()
                        employee.employee_status = str(row.get('Employee_Status', 'Active')).strip()
                        
                        # Manager relationship data
                        manager_id = row.get('Manager ID')
                        if pd.notna(manager_id):
                            employee.manager_bensl_id = str(manager_id).strip()
                        
                        # Set basic password without hashing to avoid timeout
                        employee.password_hash = 'simple_hash_welcome123'
                        
                        db.session.add(employee)
                        employees_created += 1
                        
                        # Commit in batches to avoid timeout
                        if employees_created % 10 == 0:
                            db.session.commit()
                
                db.session.commit()
                status.append(f"Created {employees_created} employee records")
                
                # Establish manager relationships
                managers_identified = 0
                
                # Create a mapping of bensl_id to employee for faster lookup
                employee_map = {emp.bensl_id: emp for emp in Employee.query.all()}
                
                for employee in Employee.query.all():
                    if employee.manager_bensl_id and employee.manager_bensl_id in employee_map:
                        manager = employee_map[employee.manager_bensl_id]
                        employee.manager_id = manager.id
                        if not manager.is_manager:
                            manager.is_manager = True
                            # Set manager password properly after all processing
                            managers_identified += 1
                
                # Set manager passwords with simple hash
                for mgr in Employee.query.filter_by(is_manager=True).all():
                    mgr.password_hash = 'simple_hash_manager123'
                
                db.session.commit()
                status.append(f"Identified {managers_identified} managers")
                
                # Prepare manager credentials for display
                manager_list = Employee.query.filter_by(is_manager=True).all()
                for mgr in manager_list:
                    report_count = Employee.query.filter_by(manager_id=mgr.id).count()
                    managers.append({
                        'name': mgr.full_name,
                        'email': mgr.emailid,
                        'team': mgr.team,
                        'reports': report_count,
                        'password': 'manager123'
                    })
                
                status.append("Setup completed successfully!")
                status.append(f"Manager credentials generated for {len(managers)} managers")
                
            except Exception as e:
                errors.append(f"Import failed: {str(e)}")
        else:
            errors.append("Please select a valid Excel file (.xlsx or .xls)")
    
    return render_template('setup.html', status=status, errors=errors, managers=managers, setup_complete=setup_complete)

@app.route('/login', methods=['GET', 'POST'])
def login():
    # Check if system needs setup first
    manager_count = Employee.query.filter_by(is_manager=True).count()
    if manager_count == 0:
        return redirect(url_for('setup'))
    
    if request.method == 'POST':
        emailid = request.form.get('email', '').strip()
        password = request.form.get('password', '')

        employee = Employee.query.filter_by(emailid=emailid).first()

        # Restrict access only to line managers
        if employee and employee.check_password(password) and employee.is_manager:
            login_user(employee)
            next_page = request.args.get('next')
            flash(f'Welcome back, {employee.full_name}!', 'success')
            return redirect(next_page) if next_page else redirect(url_for('dashboard'))
        elif employee and not employee.is_manager:
            flash('Access denied. Only line managers can access this system.', 'error')
        else:
            flash('Invalid email or password', 'error')

    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out', 'info')
    return redirect(url_for('login'))

@app.route('/dashboard')
@login_required
def dashboard():
    # Check if enhanced dashboard is requested
    enhanced = request.args.get('enhanced', 'true').lower() == 'true'
    # Get analytics data for current user's scope
    if current_user.is_manager:
        subordinates = current_user.get_all_subordinates()
        direct_reports = current_user.get_direct_reports()
        employees_in_scope = subordinates + [current_user]
        
        # Debug logging for employee counts
        print(f"Manager: {current_user.full_name}")
        print(f"Direct reports count: {len(direct_reports)}")
        print(f"All subordinates count: {len(subordinates)}")
        print(f"Total employees in scope: {len(employees_in_scope)}")
        print(f"Direct reports: {[emp.full_name for emp in direct_reports]}")
    else:
        direct_reports = []
        employees_in_scope = [current_user]

    analytics = get_dashboard_analytics(employees_in_scope)
    
    # Add current date for quarter calculation
    from datetime import datetime
    current_date = datetime.now()

    # Get recent feedback given by manager
    recent_feedback = []
    feedback_summary = {
        'total_given': 0,
        'this_month': 0,
        'pending_reviews': 0
    }

    if current_user.is_manager:
        # Get all feedback given by this manager with proper joins
        all_feedback = db.session.query(Feedback)\
                                .join(Employee, Feedback.employee_id == Employee.id)\
                                .filter(Feedback.manager_id == current_user.id)\
                                .order_by(Feedback.created_at.desc()).all()
        recent_feedback = all_feedback[:5]  # Last 5 feedback entries

        feedback_summary['total_given'] = len(all_feedback)

        # Count feedback given this month
        current_month = datetime.now().month
        current_year = datetime.now().year
        feedback_summary['this_month'] = len([f for f in all_feedback 
                                            if f.created_at and f.created_at.month == current_month 
                                            and f.created_at.year == current_year])

        # Calculate pending reviews (employees without recent feedback in last 3 months)
        from datetime import timedelta
        three_months_ago = datetime.now() - timedelta(days=90)

        employees_with_recent_feedback = set()
        for feedback in all_feedback:
            if feedback.created_at and feedback.created_at >= three_months_ago:
                employees_with_recent_feedback.add(feedback.employee_id)

        feedback_summary['pending_reviews'] = len([emp for emp in direct_reports 
                                                 if emp.id not in employees_with_recent_feedback])

    # Group employees by categories for enhanced tooltips
    employees_by_type = {}
    employees_by_billable = {}
    employees_by_team = {}
    employees_by_location = {}

    for emp in employees_in_scope:
        # Group by employment type
        emp_type = emp.employment_type or 'Not Specified'
        if emp_type not in employees_by_type:
            employees_by_type[emp_type] = []
        employees_by_type[emp_type].append(emp.to_dict())

        # Group by billable status
        billable = emp.billable_status or 'Not Specified'
        if billable not in employees_by_billable:
            employees_by_billable[billable] = []
        employees_by_billable[billable].append(emp.to_dict())

        # Group by team
        team = emp.team or 'Not Assigned'
        if team not in employees_by_team:
            employees_by_team[team] = []
        employees_by_team[team].append(emp.to_dict())

        # Group by location
        location = emp.location or 'Not Specified'
        if location not in employees_by_location:
            employees_by_location[location] = []
        employees_by_location[location].append(emp.to_dict())

    # Use the new dashboard template with pie charts
    template_name = 'dashboard.html'
    return render_template(template_name, 
                         analytics=analytics, 
                         recent_feedback=recent_feedback,
                         feedback_summary=feedback_summary,
                         direct_reports=direct_reports,
                         employees_by_type=employees_by_type,
                         employees_by_billable=employees_by_billable,
                         employees_by_team=employees_by_team,
                         employees_by_location=employees_by_location,
                         now=datetime.now())

@app.route('/employees')
@login_required
def employees():
    if not current_user.is_manager:
        flash('Access denied. Only managers can view employee lists.', 'error')
        return redirect(url_for('dashboard'))

    # Get employees under current manager - if no subordinates, show all employees for managers
    subordinates = current_user.get_all_subordinates()
    
    # Debug: Log the subordinates count
    print(f"Manager {current_user.full_name} has {len(subordinates)} subordinates")
    
    # If manager has no subordinates, allow viewing all employees (for initial setup)
    if not subordinates and current_user.is_manager:
        subordinates = Employee.query.filter(Employee.id != current_user.id).all()
        print(f"Showing all employees: {len(subordinates)} total")

    return render_template('employees.html', employees=subordinates)

@app.route('/employee/add', methods=['GET', 'POST'])
@login_required
def add_employee():
    if not current_user.is_manager:
        flash('Access denied. Only managers can add employees.', 'error')
        return redirect(url_for('dashboard'))

    if request.method == 'POST':
        try:
            employee = Employee(
                employment_type=request.form.get('employment_type'),
                billable_status=request.form.get('billable_status'),
                employee_status=request.form.get('employee_status'),
                system_id=request.form.get('system_id'),
                bensl_id=request.form.get('bensl_id'),
                full_name=request.form.get('full_name'),
                role=request.form.get('role'),
                skill=request.form.get('skill'),
                team=request.form.get('team'),
                manager_name=request.form.get('manager_name'),
                manager_id=current_user.id,
                critical=request.form.get('critical'),
                grade=request.form.get('grade'),
                designation=request.form.get('designation'),
                gender=request.form.get('gender'),
                company=request.form.get('company'),
                emailid=request.form.get('emailid'),
                location=request.form.get('location'),
                billing_rate=float(request.form['billing_rate']) if request.form.get('billing_rate') else None,
                rate_card=request.form.get('rate_card'),
                remarks=request.form.get('remarks'),
                is_manager=request.form.get('is_manager') == 'on'
            )

            # Handle date fields
            if request.form.get('doj_allianz'):
                employee.doj_allianz = datetime.strptime(request.form['doj_allianz'], '%Y-%m-%d').date()
            if request.form.get('dol_allianz'):
                employee.dol_allianz = datetime.strptime(request.form['dol_allianz'], '%Y-%m-%d').date()
            if request.form.get('doj_project'):
                employee.doj_project = datetime.strptime(request.form['doj_project'], '%Y-%m-%d').date()
            if request.form.get('dol_project'):
                employee.dol_project = datetime.strptime(request.form['dol_project'], '%Y-%m-%d').date()

            # Set default password (employee should change it)
            employee.set_password('password123')

            db.session.add(employee)
            db.session.commit()

            flash('Employee added successfully!', 'success')
            return redirect(url_for('employees'))

        except Exception as e:
            db.session.rollback()
            flash(f'Error adding employee: {str(e)}', 'error')

    return render_template('employee_form.html', employee=None, action='Add')

@app.route('/employee/edit/<int:id>', methods=['GET', 'POST'])
@login_required
def edit_employee(id):
    employee = Employee.query.get_or_404(id)

    if not current_user.can_manage(employee) and current_user.id != employee.id:
        flash('Access denied. You can only edit employees under your management.', 'error')
        return redirect(url_for('employees'))

    if request.method == 'POST':
        try:
            employee.employment_type = request.form.get('employment_type')
            employee.billable_status = request.form.get('billable_status')
            employee.employee_status = request.form.get('employee_status')
            employee.system_id = request.form.get('system_id')
            employee.bensl_id = request.form.get('bensl_id')
            employee.full_name = request.form.get('full_name')
            employee.role = request.form.get('role')
            employee.skill = request.form.get('skill')
            employee.team = request.form.get('team')
            employee.manager_name = request.form.get('manager_name')
            employee.critical = request.form.get('critical')
            employee.grade = request.form.get('grade')
            employee.designation = request.form.get('designation')
            employee.gender = request.form.get('gender')
            employee.company = request.form.get('company')
            employee.emailid = request.form.get('emailid')
            employee.location = request.form.get('location')
            employee.billing_rate = float(request.form['billing_rate']) if request.form.get('billing_rate') else None
            employee.rate_card = request.form.get('rate_card')
            employee.remarks = request.form.get('remarks')

            # Handle date fields
            if request.form.get('doj_allianz'):
                employee.doj_allianz = datetime.strptime(request.form['doj_allianz'], '%Y-%m-%d').date()
            if request.form.get('dol_allianz'):
                employee.dol_allianz = datetime.strptime(request.form['dol_allianz'], '%Y-%m-%d').date()
            if request.form.get('doj_project'):
                employee.doj_project = datetime.strptime(request.form['doj_project'], '%Y-%m-%d').date()
            if request.form.get('dol_project'):
                employee.dol_project = datetime.strptime(request.form['dol_project'], '%Y-%m-%d').date()

            if current_user.is_manager:
                employee.is_manager = request.form.get('is_manager') == 'on'

            db.session.commit()
            flash('Employee updated successfully!', 'success')
            return redirect(url_for('employees'))

        except Exception as e:
            db.session.rollback()
            flash(f'Error updating employee: {str(e)}', 'error')

    return render_template('employee_form.html', employee=employee, action='Edit')

@app.route('/employee/<int:id>')
@login_required
def employee_details(id):
    employee = Employee.query.get_or_404(id)

    # Check if user can view this employee
    if not current_user.is_manager and current_user.id != employee.id:
        if not current_user.can_manage(employee):
            flash('Access denied. You can only view employees under your management.', 'error')
            return redirect(url_for('employees'))

    return render_template('employee_details.html', employee=employee)

@app.route('/employee/delete/<int:id>', methods=['POST'])
@login_required
def delete_employee(id):
    employee = Employee.query.get_or_404(id)

    # Enhanced permission check for managers
    can_delete = False
    if current_user.is_manager:
        # Manager can delete if they directly manage the employee or if employee is in their hierarchy
        if employee.manager_id == current_user.id or current_user.can_manage(employee):
            can_delete = True
        # Also allow if current user is a higher-level manager
        elif current_user.id != employee.id:  # Can't delete themselves
            can_delete = True

    if not can_delete:
        flash('Access denied. You can only delete employees under your management.', 'error')
        return redirect(url_for('employees'))

    # Prevent self-deletion
    if employee.id == current_user.id:
        flash('You cannot delete your own account.', 'error')
        return redirect(url_for('employees'))

    try:
        # First, check for dependencies and handle them
        # Remove manager relationships for subordinates
        subordinates = Employee.query.filter_by(manager_id=employee.id).all()
        for subordinate in subordinates:
            subordinate.manager_id = None
            subordinate.manager_name = None

        # Delete related feedback records
        Feedback.query.filter((Feedback.employee_id == employee.id) | 
                             (Feedback.manager_id == employee.id)).delete()

        # Delete related billing records
        BillingDetail.query.filter_by(employee_id=employee.id).delete()

        # Finally delete the employee
        db.session.delete(employee)
        db.session.commit()
        flash(f'Employee {employee.full_name or "record"} deleted successfully!', 'success')
    except Exception as e:
        db.session.rollback()
        flash(f'Error deleting employee: {str(e)}', 'error')

    return redirect(url_for('employees'))

@app.route('/feedback')
@login_required
def feedback():
    if not current_user.is_manager:
        flash('Access denied. Only managers can manage feedback.', 'error')
        return redirect(url_for('dashboard'))

    # Get feedback given by current manager
    feedback_list = Feedback.query.filter_by(manager_id=current_user.id)\
                                 .order_by(Feedback.created_at.desc()).all()

    return render_template('feedback.html', feedback_list=feedback_list)

@app.route('/feedback/add', methods=['GET', 'POST'])
@login_required
def add_feedback():
    if not current_user.is_manager:
        flash('Access denied. Only managers can give feedback.', 'error')
        return redirect(url_for('dashboard'))

    if request.method == 'POST':
        try:
            # Validate required fields
            employee_id = request.form.get('employee_id')
            feedback_type = request.form.get('feedback_type')
            period_year = request.form.get('period_year')

            if not employee_id or not feedback_type or not period_year:
                flash('Please fill in all required fields.', 'error')
                direct_reports = current_user.direct_reports
                return render_template('feedback_form.html', feedback=None, employees=direct_reports, action='Add')

            # Verify employee is under current manager first
            employee = Employee.query.get(int(employee_id))
            if not employee or not current_user.can_manage(employee):
                flash('Access denied. You can only give feedback to your direct reports.', 'error')
                return redirect(url_for('feedback'))

            feedback = Feedback(
                employee_id=int(employee_id),
                manager_id=current_user.id,
                feedback_type=feedback_type,
                period_year=int(period_year),
                performance_rating=int(request.form['performance_rating']) if request.form.get('performance_rating') else None,
                goals_achieved=request.form.get('goals_achieved', ''),
                areas_of_improvement=request.form.get('areas_of_improvement', ''),
                strengths=request.form.get('strengths', ''),
                comments=request.form.get('comments', '')
            )

            if feedback_type == 'Monthly':
                period_month = request.form.get('period_month')
                if period_month:
                    feedback.period_month = int(period_month)
            else:
                period_quarter = request.form.get('period_quarter')
                if period_quarter:
                    feedback.period_quarter = int(period_quarter)

            db.session.add(feedback)
            db.session.commit()

            flash('Feedback added successfully!', 'success')
            return redirect(url_for('feedback'))

        except ValueError as e:
            db.session.rollback()
            flash('Invalid data format. Please check your inputs.', 'error')
        except Exception as e:
            db.session.rollback()
            flash(f'Error adding feedback: {str(e)}', 'error')

    # Get direct reports for dropdown
    direct_reports = current_user.direct_reports
    return render_template('feedback_form.html', feedback=None, employees=direct_reports, action='Add', now=datetime.now())

@app.route('/feedback/edit/<int:id>', methods=['GET', 'POST'])
@login_required
def edit_feedback(id):
    feedback = Feedback.query.get_or_404(id)

    if feedback.manager_id != current_user.id:
        flash('Access denied. You can only edit your own feedback.', 'error')
        return redirect(url_for('feedback'))

    if request.method == 'POST':
        try:
            feedback.feedback_type = request.form['feedback_type']
            feedback.period_year = int(request.form['period_year'])
            feedback.performance_rating = int(request.form['performance_rating']) if request.form['performance_rating'] else None
            feedback.goals_achieved = request.form['goals_achieved']
            feedback.areas_of_improvement = request.form['areas_of_improvement']
            feedback.strengths = request.form['strengths']
            feedback.comments = request.form['comments']

            if request.form['feedback_type'] == 'Monthly':
                feedback.period_month = int(request.form['period_month'])
                feedback.period_quarter = None
            else:
                feedback.period_quarter = int(request.form['period_quarter'])
                feedback.period_month = None

            db.session.commit()
            flash('Feedback updated successfully!', 'success')
            return redirect(url_for('feedback'))

        except Exception as e:
            db.session.rollback()
            flash(f'Error updating feedback: {str(e)}', 'error')

    direct_reports = current_user.direct_reports
    return render_template('feedback_form.html', feedback=feedback, employees=direct_reports, action='Edit', now=datetime.now())

@app.route('/billing')
@login_required
def billing():
    if not current_user.is_manager:
        flash('Access denied. Only managers can view billing details.', 'error')
        return redirect(url_for('dashboard'))

    # Get billing details for employees under current manager
    subordinate_ids = [emp.id for emp in current_user.get_all_subordinates()]
    subordinate_ids.append(current_user.id)

    billing_records = BillingDetail.query.filter(BillingDetail.employee_id.in_(subordinate_ids))\
                                        .order_by(BillingDetail.billing_year.desc(), 
                                                BillingDetail.billing_month.desc()).all()

    return render_template('billing.html', billing_records=billing_records)

@app.route('/hierarchy')
@login_required
def hierarchy():
    try:
        # Determine access level and get appropriate employee data
        if is_top_level_manager(current_user):
            # Top-level managers see entire organization
            all_employees = Employee.query.all()
            access_level = "full"
        elif current_user.is_manager:
            # Line managers see their hierarchy (themselves + all subordinates)
            subordinates = current_user.get_all_subordinates()
            all_employees = [current_user] + subordinates
            access_level = "manager"
        else:
            # Regular employees see only themselves and their immediate peers
            all_employees = [current_user]
            if current_user.manager_id:
                # Add manager and peer employees
                manager = Employee.query.get(current_user.manager_id)
                if manager:
                    all_employees.append(manager)
                    peers = Employee.query.filter_by(manager_id=current_user.manager_id).all()
                    all_employees.extend([emp for emp in peers if emp.id != current_user.id])
            access_level = "employee"

        # Build hierarchy structure with role-based organization
        top_managers = build_role_based_hierarchy(all_employees, current_user)
        
        # Get statistics
        stats = calculate_hierarchy_stats(all_employees, current_user)

        return render_template('hierarchy.html', 
                             top_managers=top_managers,
                             current_user=current_user,
                             access_level=access_level,
                             stats=stats)
    except Exception as e:
        print(f"Hierarchy error: {str(e)}")  # Debug log
        flash(f'Error loading hierarchy: {str(e)}', 'error')
        return redirect(url_for('dashboard'))

def is_top_level_manager(employee):
    """Check if employee is a top-level manager (CEO/VP level)"""
    # Consider someone a top-level manager if they have no manager or their designation suggests it
    if not employee.manager_id:
        return True
    
    # Check designation for executive titles
    designation = (employee.designation or '').lower()
    executive_titles = ['ceo', 'cto', 'vp', 'vice president', 'director', 'head of']
    return any(title in designation for title in executive_titles)

def calculate_hierarchy_stats(employees, current_user):
    """Calculate hierarchy statistics"""
    total_employees = len(employees)
    managers = [emp for emp in employees if emp.is_manager]
    
    # Calculate depth levels
    depths = []
    for emp in employees:
        depth = 0
        current = emp
        visited = set()
        while current.manager_id and current.manager_id not in visited and depth < 10:
            visited.add(current.id)
            current = next((e for e in employees if e.id == current.manager_id), None)
            if not current:
                break
            depth += 1
        depths.append(depth)
    
    return {
        'total_employees': total_employees,
        'total_managers': len(managers),
        'max_depth': max(depths) + 1 if depths else 1,
        'user_subordinates': len(current_user.get_all_subordinates()) if current_user.is_manager else 0
    }

def build_role_based_hierarchy(employees, current_user):
    """Build a role-based hierarchical tree structure"""
    # Create employee lookup dictionary
    employee_dict = {emp.id: emp for emp in employees}
    
    # Initialize direct_reports for each employee
    for emp in employees:
        emp.direct_reports = []
        # Add role-based level for styling
        emp.hierarchy_level = determine_hierarchy_level(emp)

    # Build the hierarchy relationships
    top_managers = []
    
    for emp in employees:
        if emp.manager_id is None or emp.manager_id not in employee_dict:
            # This is a top-level manager or orphaned employee
            top_managers.append(emp)
        else:
            # This employee has a manager in our scope
            manager = employee_dict.get(emp.manager_id)
            if manager:
                manager.direct_reports.append(emp)

    # Sort employees by hierarchy level, then by role importance, then by name
    def sort_key(emp):
        role_priority = get_role_priority(emp)
        return (role_priority, emp.grade or 'ZZ', emp.full_name or '')

    # Sort direct reports for each manager
    for emp in employees:
        emp.direct_reports.sort(key=sort_key)

    # Sort top managers
    top_managers.sort(key=sort_key)

    return top_managers

def determine_hierarchy_level(employee):
    """Determine the hierarchy level based on role and designation"""
    designation = (employee.designation or '').lower()
    role = (employee.role or '').lower()
    
    # Executive level (0)
    if any(title in designation for title in ['ceo', 'cto', 'vp', 'vice president', 'chief']):
        return 0
    
    # Director level (1)
    if any(title in designation for title in ['director', 'head of', 'associate director']):
        return 1
    
    # Manager level (2)
    if any(title in designation for title in ['manager', 'lead manager', 'senior manager']):
        return 2
    
    # Team Lead level (3)
    if any(title in designation for title in ['lead', 'team lead', 'tech lead', 'senior lead']):
        return 3
    
    # Senior level (4)
    if any(title in designation for title in ['senior', 'sr', 'principal']):
        return 4
    
    # Regular employee (5)
    return 5

def get_role_priority(employee):
    """Get role priority for sorting (lower number = higher priority)"""
    level = determine_hierarchy_level(employee)
    is_manager_bonus = 0 if employee.is_manager else 10
    return level + is_manager_bonus

@app.route('/import_excel', methods=['GET', 'POST'])
@login_required
def import_excel():
    if not current_user.is_manager:
        flash('Access denied. Only managers can import employee data.', 'error')
        return redirect(url_for('dashboard'))

    if request.method == 'POST':
        if 'file' not in request.files:
            flash('No file selected', 'error')
            return redirect(request.url)

        file = request.files['file']
        if file.filename == '':
            flash('No file selected', 'error')
            return redirect(request.url)

        if file and file.filename and allowed_file(file.filename):
            try:
                filename = secure_filename(file.filename)
                result = process_excel_file(file, current_user.id)

                if result['success']:
                    success_msg = f'Successfully imported {result["count"]} employees as your direct reports'
                    if result['skipped'] > 0:
                        success_msg += f' (skipped {result["skipped"]} duplicates)'

                    flash(success_msg, 'success')
                    
                    # Add a note about manager assignment
                    flash(f'All imported employees have been assigned to you ({current_user.full_name}) as their manager.', 'info')

                    # Show errors if any
                    if result['errors']:
                        error_summary = f"Import completed with {len(result['errors'])} warnings. "
                        error_summary += "Check the employee list for details."
                        flash(error_summary, 'warning')

                    return redirect(url_for('employees'))
                else:
                    error_msg = f'Import failed: {result["error"]}'
                    if result['errors']:
                        error_msg += f' Additional errors: {len(result["errors"])} rows had issues.'
                    flash(error_msg, 'error')

            except Exception as e:
                flash(f'Error processing file: {str(e)}', 'error')
        else:
            flash('Invalid file type. Please upload an Excel file (.xlsx or .xls)', 'error')

    return render_template('import_excel.html')

# API endpoints for charts
@app.route('/api/dashboard_data')
@login_required
def dashboard_data():
    if current_user.is_manager:
        subordinates = current_user.get_all_subordinates()
        employees_in_scope = subordinates + [current_user]
    else:
        employees_in_scope = [current_user]

    analytics = get_dashboard_analytics(employees_in_scope)
    return jsonify(analytics)

@app.errorhandler(404)
def not_found_error(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return render_template('500.html'), 500
# API endpoint to get import results
@app.route('/api/import_results')
@login_required 
def import_results():
    session = request.environ.get('werkzeug.session')
    if session and 'import_errors' in session:
        errors = session.pop('import_errors', [])
        return jsonify({'errors': errors})
    return jsonify({'errors': []})

@app.route('/api/employee/<int:id>')
@login_required
def api_employee_details(id):
    employee = Employee.query.get_or_404(id)

    # Check if user can view this employee
    if not current_user.is_manager and current_user.id != employee.id:
        if not current_user.can_manage(employee):
            return jsonify({'error': 'Access denied'}), 403

    return jsonify(employee.to_dict())
@app.route('/download_template')
@login_required
def download_template():
    if not current_user.is_manager:
        flash('Access denied. Only managers can download templates.', 'error')
        return redirect(url_for('dashboard'))

    try:
        # Create sample data matching database schema
        sample_data = [
            {
                'Employment_Type': 'Permanent',
                'Billable_Status': 'Billable',
                'Employee_Status': 'Active',
                'System_ID': 'SYS001',
                'Bensl_ID': 'BENSL001',
                'Full_Name': 'John Doe',
                'Role': 'Software Engineer',
                'Skill': 'Python, JavaScript, SQL',
                'Team': 'UFS',
                'Manager_Name': 'Jane Smith',
                'Manager_ID': '',
                'Critical': 'No',
                'DOJ_Allianz': '2024-01-15',
                'DOL_Allianz': '',
                'Grade': 'L3',
                'Designation': 'Software Engineer',
                'DOJ_Project': '2024-01-20',
                'DOL_Project': '',
                'Gender': 'Male',
                'Company': 'Allianz',
                'Emailid': 'john.doe@company.com',
                'Location': 'Bangalore',
                'Billing_Rate': '50.00',
                'Rate_Card': 'Standard',
                'Remarks': 'Good performer'
            },
            {
                'Employment_Type': 'Permanent',
                'Billable_Status': 'Billable',
                'Employee_Status': 'Active',
                'System_ID': 'SYS002',
                'Bensl_ID': 'BENSL002',
                'Full_Name': 'Jane Smith',
                'Role': 'Senior Developer',
                'Skill': 'Java, React, MongoDB',
                'Team': 'RG',
                'Manager_Name': 'Manager Name',
                'Manager_ID': '',
                'Critical': 'No',
                'DOJ_Allianz': '2023-08-01',
                'DOL_Allianz': '',
                'Grade': 'L4',
                'Designation': 'Senior Developer',
                'DOJ_Project': '2023-08-05',
                'DOL_Project': '',
                'Gender': 'Female',
                'Company': 'Allianz',
                'Emailid': 'jane.smith@company.com',
                'Location': 'Mumbai',
                'Billing_Rate': '75.00',
                'Rate_Card': 'Premium',
                'Remarks': 'Team lead'
            }
        ]

        # Create DataFrame and save to Excel
        df = pd.DataFrame(sample_data)

        # Create Excel file in memory
        from io import BytesIO
        output = BytesIO()

        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Employees', index=False)

            # Get the workbook and worksheet
            workbook = writer.book
            worksheet = writer.sheets['Employees']

            # Auto-adjust column widths
            for column in worksheet.columns:
                max_length = 0
                column_letter = column[0].column_letter
                for cell in column:
                    try:
                        if len(str(cell.value)) > max_length:
                            max_length = len(str(cell.value))
                    except:
                        pass
                adjusted_width = min(max_length + 2, 50)
                worksheet.column_dimensions[column_letter].width = adjusted_width

        output.seek(0)

        return send_file(
            output,
            as_attachment=True,
            download_name='employee_import_template.xlsx',
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )

    except Exception as e:
        flash(f'Error generating template: {str(e)}', 'error')
        return redirect(url_for('import_excel'))