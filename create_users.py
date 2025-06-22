#!/usr/bin/env python3
from werkzeug.security import generate_password_hash
from app import app, db
from models import Employee

def create_sample_users():
    with app.app_context():
        # Check if users already exist
        if Employee.query.first():
            print("Users already exist in database")
            return
        
        # Create top-level manager
        top_manager = Employee(
            system_id='EMP001',
            bensl_id='BENSL001',
            full_name='Sooraj Kumar',
            emailid='sooraj@company.com',
            designation='VP Engineering',
            location='Bangalore',
            team='UFS',
            employment_type='Permanent',
            billable_status='Non-billable',
            employee_status='Active',
            is_manager=True,
            manager_id=None,
            password_hash=generate_password_hash('password123')
        )
        db.session.add(top_manager)
        db.session.commit()
        print(f"Created top manager: {top_manager.full_name}")
        
        # Create line managers
        managers_data = [
            {
                'system_id': 'EMP002',
                'bensl_id': 'BENSL002',
                'full_name': 'Anuja Sharma',
                'emailid': 'anuja@company.com',
                'designation': 'Engineering Manager',
                'team': 'UFS'
            },
            {
                'system_id': 'EMP003',
                'bensl_id': 'BENSL003',
                'full_name': 'Asha Patel',
                'emailid': 'asha@company.com',
                'designation': 'Tech Lead',
                'team': 'RG'
            },
            {
                'system_id': 'EMP004',
                'bensl_id': 'BENSL004',
                'full_name': 'Vinod Singh',
                'emailid': 'vinod@company.com',
                'designation': 'Senior Manager',
                'team': 'UFS'
            }
        ]
        
        for mgr_data in managers_data:
            manager = Employee(
                system_id=mgr_data['system_id'],
                bensl_id=mgr_data['bensl_id'],
                full_name=mgr_data['full_name'],
                emailid=mgr_data['emailid'],
                designation=mgr_data['designation'],
                location='Bangalore',
                team=mgr_data['team'],
                employment_type='Permanent',
                billable_status='Billable',
                employee_status='Active',
                is_manager=True,
                manager_id=top_manager.id,
                password_hash=generate_password_hash('password123')
            )
            db.session.add(manager)
            print(f"Created manager: {manager.full_name}")
        
        db.session.commit()
        print("Sample users created successfully!")

if __name__ == '__main__':
    create_sample_users()