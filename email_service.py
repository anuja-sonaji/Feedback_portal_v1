"""
Email service for sending manager credentials
"""
import os
import sys
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content

def send_manager_credentials(manager_name, manager_email, password, team, reports_count):
    """Send login credentials to a manager via email"""
    
    sendgrid_key = os.environ.get('SENDGRID_API_KEY')
    if not sendgrid_key:
        print("SendGrid API key not configured - credentials not sent")
        return False
    
    try:
        sg = SendGridAPIClient(sendgrid_key)
        
        # Email content
        subject = "Employee Feedback Portal - Manager Access Credentials"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }}
                .credentials {{ background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
                .btn {{ display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>Employee Feedback Portal</h2>
                    <p>Manager Access Credentials</p>
                </div>
                <div class="content">
                    <h3>Hello {manager_name},</h3>
                    <p>You have been granted access to the Employee Feedback Portal as a Line Manager. This system allows you to manage feedback for your team members and track performance.</p>
                    
                    <div class="credentials">
                        <h4>Your Login Credentials:</h4>
                        <p><strong>Email:</strong> {manager_email}</p>
                        <p><strong>Password:</strong> <code>{password}</code></p>
                        <p><strong>Team:</strong> {team}</p>
                        <p><strong>Direct Reports:</strong> {reports_count} employees</p>
                    </div>
                    
                    <p><strong>Important Security Notes:</strong></p>
                    <ul>
                        <li>Please change your password after first login</li>
                        <li>Do not share these credentials with anyone</li>
                        <li>You can only view and manage your direct reports</li>
                        <li>Contact IT support if you experience any issues</li>
                    </ul>
                    
                    <p>You can access the portal using the link below:</p>
                    <a href="#" class="btn">Access Employee Portal</a>
                    
                    <div class="footer">
                        <p>This is an automated message from the Employee Feedback Portal.<br>
                        Please do not reply to this email.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Employee Feedback Portal - Manager Access Credentials
        
        Hello {manager_name},
        
        You have been granted access to the Employee Feedback Portal as a Line Manager.
        
        Your Login Credentials:
        Email: {manager_email}
        Password: {password}
        Team: {team}
        Direct Reports: {reports_count} employees
        
        Important Security Notes:
        - Please change your password after first login
        - Do not share these credentials with anyone
        - You can only view and manage your direct reports
        - Contact IT support if you experience any issues
        
        This is an automated message from the Employee Feedback Portal.
        """
        
        message = Mail(
            from_email=Email('noreply@company.com', 'Employee Feedback Portal'),
            to_emails=To(manager_email),
            subject=subject
        )
        
        message.content = [
            Content("text/plain", text_content),
            Content("text/html", html_content)
        ]
        
        response = sg.send(message)
        
        if response.status_code == 202:
            print(f"Credentials sent to {manager_name} at {manager_email}")
            return True
        else:
            print(f"Failed to send email to {manager_email}: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"Email sending error for {manager_email}: {e}")
        return False

def send_bulk_manager_notifications(managers_list):
    """Send credentials to multiple managers"""
    successful_sends = 0
    failed_sends = 0
    
    for manager in managers_list:
        success = send_manager_credentials(
            manager['name'],
            manager['email'], 
            'manager123',
            manager['team'],
            manager['reports']
        )
        
        if success:
            successful_sends += 1
        else:
            failed_sends += 1
    
    return {
        'successful': successful_sends,
        'failed': failed_sends,
        'total': len(managers_list)
    }