#!/usr/bin/env python3
"""
Import employees from Excel file and establish manager relationships
"""

import pandas as pd
from app import app, db
from models import Employee

def import_employees_from_excel():
    with app.app_context():
        # Clear existing data
        print("Clearing existing employee data...")
        Employee.query.delete()
        db.session.commit()
        
        # Read Excel file
        print("Reading Excel file...")
        df = pd.read_excel('attached_assets/EmployeeLatest_1749627905013.xlsx')
        
        # Filter out rows with missing essential data
        df_valid = df[df['Full_Name'].notna()].copy()
        print(f"Processing {len(df_valid)} valid employees...")
        
        # Process each employee
        for index, row in df_valid.iterrows():
            try:
                employee = Employee()
                
                # Map basic fields
                employee.employment_type = str(row.get('Employment_Type', 'Permanent')).strip() if pd.notna(row.get('Employment_Type')) else 'Permanent'
                employee.billable_status = str(row.get('Billable_Status', 'Billable')).strip() if pd.notna(row.get('Billable_Status')) else 'Billable'
                employee.employee_status = str(row.get('Employee_Status', 'ACTIVE')).strip() if pd.notna(row.get('Employee_Status')) else 'ACTIVE'
                employee.system_id = str(row.get('System_ID')).strip() if pd.notna(row.get('System_ID')) else None
                # Handle Bensl_ID - generate one if missing
                if pd.notna(row.get('Bensl_ID')):
                    employee.bensl_id = str(row.get('Bensl_ID')).strip()
                else:
                    # Generate a unique ID for employees without Bensl_ID
                    employee.bensl_id = f"GEN_{index}_{str(row.get('Full_Name', 'unknown')).replace(' ', '_')[:10]}"
                employee.full_name = str(row.get('Full_Name')).strip()
                employee.role = str(row.get('Role ', '')).strip() if pd.notna(row.get('Role ')) else None
                employee.skill = str(row.get('Skill')).strip() if pd.notna(row.get('Skill')) else None
                employee.team = str(row.get('Team')).strip() if pd.notna(row.get('Team')) else None
                employee.manager_name = str(row.get('Manager Name')).strip() if pd.notna(row.get('Manager Name')) else None
                employee.manager_bensl_id = str(row.get('Manager ID')).strip() if pd.notna(row.get('Manager ID')) else None
                employee.critical = str(row.get('Critical')).strip() if pd.notna(row.get('Critical')) else None
                employee.grade = str(row.get('Grade')).strip() if pd.notna(row.get('Grade')) else None
                employee.designation = str(row.get('Designation')).strip() if pd.notna(row.get('Designation')) else None
                employee.gender = str(row.get('Gender')).strip() if pd.notna(row.get('Gender')) else None
                employee.company = str(row.get('Company')).strip() if pd.notna(row.get('Company')) else None
                employee.emailid = str(row.get('Emailid')).strip() if pd.notna(row.get('Emailid')) else None
                employee.location = str(row.get('Location')).strip() if pd.notna(row.get('Location')) else None
                employee.rate_card = str(row.get('Rate_Card')).strip() if pd.notna(row.get('Rate_Card')) else None
                employee.remarks = str(row.get('Remarks')).strip() if pd.notna(row.get('Remarks')) else None
                
                # Handle billing rate (may be text like "L4")
                try:
                    billing_rate = row.get('BillingRate')
                    if pd.notna(billing_rate):
                        employee.billing_rate = float(billing_rate)
                except:
                    employee.billing_rate = None
                
                # Handle dates
                for date_field, col_name in [
                    ('doj_allianz', 'DOJ Allianz'),
                    ('dol_allianz', 'DOL Allianz'),
                    ('doj_project', 'DOJ Project'),
                    ('dol_project', 'DOL Project')
                ]:
                    date_val = row.get(col_name)
                    if pd.notna(date_val):
                        try:
                            if hasattr(date_val, 'date'):
                                setattr(employee, date_field, date_val.date())
                            else:
                                setattr(employee, date_field, pd.to_datetime(date_val).date())
                        except:
                            setattr(employee, date_field, None)
                    else:
                        setattr(employee, date_field, None)
                
                # Set default password
                employee.set_password('password123')
                
                db.session.add(employee)
                
            except Exception as e:
                print(f"Error processing row {index + 2}: {e}")
                continue
        
        # Commit all employees first
        db.session.commit()
        print(f"Imported {Employee.query.count()} employees")
        
        # Now establish manager relationships
        print("Establishing manager relationships...")
        employees_with_managers = Employee.query.filter(Employee.manager_bensl_id.isnot(None)).all()
        
        for employee in employees_with_managers:
            if employee.manager_bensl_id:
                manager = Employee.query.filter_by(bensl_id=employee.manager_bensl_id).first()
                if manager:
                    employee.manager_id = manager.id
                    manager.is_manager = True
        
        db.session.commit()
        
        # Print summary
        total_employees = Employee.query.count()
        total_managers = Employee.query.filter_by(is_manager=True).count()
        print(f"\nImport completed:")
        print(f"Total employees: {total_employees}")
        print(f"Total managers: {total_managers}")
        
        # Show manager-employee relationships
        print("\nManager-Employee relationships:")
        for manager in Employee.query.filter_by(is_manager=True).all():
            reports = Employee.query.filter_by(manager_id=manager.id).all()
            print(f"{manager.full_name} ({manager.bensl_id}) manages {len(reports)} employees")
            for report in reports[:3]:  # Show first 3 reports
                print(f"  - {report.full_name} ({report.bensl_id})")
            if len(reports) > 3:
                print(f"  ... and {len(reports) - 3} more")

if __name__ == "__main__":
    import_employees_from_excel()