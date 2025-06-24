
#!/usr/bin/env python3
"""
Fix manager-employee relationships based on Bensl_ID
Run this script if relationships are not established correctly after Excel import
"""

from app import app, db
from models import Employee

def fix_manager_relationships():
    """Fix manager-employee relationships using Bensl_ID mapping"""
    with app.app_context():
        try:
            print("Starting relationship fix...")
            
            # Get all employees
            all_employees = Employee.query.all()
            print(f"Found {len(all_employees)} employees")
            
            # Create lookup dictionary: bensl_id -> employee
            bensl_lookup = {}
            for emp in all_employees:
                if emp.bensl_id:
                    bensl_lookup[emp.bensl_id] = emp
            
            print(f"Created lookup for {len(bensl_lookup)} employees with Bensl_ID")
            
            # Fix relationships
            relationships_fixed = 0
            managers_identified = 0
            
            for employee in all_employees:
                if employee.manager_bensl_id:
                    # Find manager by their Bensl_ID
                    manager = bensl_lookup.get(employee.manager_bensl_id)
                    
                    if manager and manager.id != employee.id:
                        # Update relationship
                        employee.manager_id = manager.id
                        employee.manager_name = manager.full_name
                        relationships_fixed += 1
                        
                        # Mark as manager if not already
                        if not manager.is_manager:
                            manager.is_manager = True
                            managers_identified += 1
                            print(f"Identified new manager: {manager.full_name} ({manager.bensl_id})")
                    elif not manager:
                        print(f"Warning: Manager with Bensl_ID '{employee.manager_bensl_id}' not found for {employee.full_name}")
            
            # Commit changes
            db.session.commit()
            
            print(f"\nRelationship fix completed:")
            print(f"- Fixed {relationships_fixed} employee-manager relationships")
            print(f"- Identified {managers_identified} new managers")
            
            # Show manager summary
            print(f"\nManager Summary:")
            managers = Employee.query.filter_by(is_manager=True).all()
            for manager in managers:
                report_count = Employee.query.filter_by(manager_id=manager.id).count()
                print(f"- {manager.full_name} ({manager.bensl_id}): {report_count} direct reports")
            
        except Exception as e:
            db.session.rollback()
            print(f"Error fixing relationships: {str(e)}")

if __name__ == "__main__":
    fix_manager_relationships()
