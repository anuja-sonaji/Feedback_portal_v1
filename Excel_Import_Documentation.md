# Employee Excel Import - How It Works

## Overview
This document explains how the Excel import feature works in the Employee Feedback Portal, what data gets populated where, and how managers can view their team information.

## Import Process Step-by-Step

### 1. Who Can Import?
- Only **Line Managers** can import Excel files
- Regular employees cannot access the import feature
- The system checks `is_manager = true` in the database

### 2. Excel File Structure
The system expects these columns in your Excel file:

| Excel Column | Database Field | Description | Required |
|--------------|----------------|-------------|----------|
| Employment_Type | employment_type | Permanent/Contract | No |
| Billable_Status | billable_status | Billable/Non-Billable | No |
| Employee_Status | employee_status | ACTIVE/INACTIVE | No |
| System_ID | system_id | Company system ID | No |
| **Bensl_ID** | bensl_id | Unique employee ID | **Yes** |
| **Full_Name** | full_name | Employee full name | **Yes** |
| Role | role | Job role/position | No |
| Skill | skill | Technical skills | No |
| Team | team | Team name | No |
| Manager Name | manager_name | Direct manager's name | No |
| **Manager ID** | manager_bensl_id | Manager's Bensl_ID | **Important** |
| Grade | grade | Employee grade | No |
| Designation | designation | Job title | No |
| Gender | gender | Male/Female/Other | No |
| Company | company | Company name | No |
| Emailid | emailid | Email address | No |
| Location | location | Work location | No |
| BillingRate | billing_rate | Hourly rate | No |
| Remarks | remarks | Additional notes | No |

### 3. Import Process

#### Step 1: File Upload
- Manager uploads Excel file through "Import Excel" page
- System validates file format (.xlsx, .xls)
- System reads the first sheet of the Excel file

#### Step 2: Data Validation
- Checks for required columns (Full_Name, Bensl_ID)
- Validates data types and formats
- Skips empty rows
- Reports duplicate Bensl_IDs

#### Step 3: Employee Creation
- Creates new employee records in database
- Sets default password: `password123`
- Assigns all imported employees to the importing manager initially

#### Step 4: Manager Relationship Setup
- Reads "Manager ID" column from Excel
- Finds existing managers by their Bensl_ID
- Updates manager_id relationships
- Sets is_manager = true for people who manage others

## Dashboard Data Population

### When Anuja Sonaji Logs In:

#### Personal Information Displayed:
- Full Name: "Anuja Sonaji"
- Bensl_ID: "CF9RFCI" 
- Manager Status: "Manager" badge
- Team: "UFS"

#### Dashboard Metrics:

**Total Employees (Blue Card):**
- Shows count of ALL employees Anuja manages
- Includes direct reports + indirect reports (team members of her direct reports)
- Currently: Based on manager_id relationships in database

**Direct Reports (Green Card):**
- Shows only employees who report directly to Anuja
- Based on: `SELECT * FROM employees WHERE manager_id = anuja_id`
- These are people whose "Manager ID" in Excel matched Anuja's Bensl_ID

**Team Quick View Table:**
- Lists all direct reports with columns:
  - Employee Name
  - Role & Team
  - Last Feedback Date
  - Performance indicators
  - Action buttons (Give Feedback, View Details)

#### Data Source for Dashboard:
```sql
-- Direct reports query
SELECT * FROM employees 
WHERE manager_id = (SELECT id FROM employees WHERE bensl_id = 'CF9RFCI')

-- This should show:
- Priyatha Radha Padmakumar
- Adarsh M
- Vijay K A
- Jiby Jose
- Rohan Sitaram Babar
- Sachin Girnare
- Bhagwan Raut
- Abhijeet Pawar
```

## Common Issues & Solutions

### Issue 1: "No Direct Reports" Showing
**Cause:** Manager relationship not established correctly
**Solution:** 
1. Check if Manager ID column in Excel matches manager's Bensl_ID exactly
2. Verify manager exists in system before importing team members
3. Check database: `manager_id` should point to correct manager record

### Issue 2: Duplicate Manager Entries
**Cause:** Same person imported multiple times with different IDs
**Solution:**
1. Remove duplicate records
2. Update all manager_id references to point to correct record
3. Re-establish manager relationships

### Issue 3: Import Works in Replit but Not Visual Studio
**Cause:** Database state differences between environments
**Solution:**
1. Ensure database schema is identical
2. Check if manager records exist before importing team
3. Verify environment variables (DATABASE_URL) are set correctly

## Best Practices

### For Excel File Preparation:
1. **Manager First:** Always import managers before their team members
2. **Unique IDs:** Ensure Bensl_ID is unique for each person
3. **Consistent Naming:** Use exact same Manager ID that exists in system
4. **Clean Data:** Remove empty rows and invalid characters

### For System Administrators:
1. **Check Relationships:** After import, verify manager-employee links
2. **Test Login:** Test that managers can see their teams
3. **Data Integrity:** Run SQL checks to ensure no orphaned records

## Troubleshooting Commands

```sql
-- Check manager relationships
SELECT m.full_name as manager, m.bensl_id as manager_id, 
       COUNT(e.id) as direct_reports
FROM employees m
LEFT JOIN employees e ON e.manager_id = m.id
WHERE m.is_manager = true
GROUP BY m.id, m.full_name, m.bensl_id;

-- Find employees without managers
SELECT full_name, bensl_id, manager_name, manager_bensl_id
FROM employees 
WHERE manager_bensl_id IS NOT NULL 
AND manager_id IS NULL;

-- Fix broken relationships
UPDATE employees 
SET manager_id = (SELECT id FROM employees WHERE bensl_id = employees.manager_bensl_id)
WHERE manager_bensl_id IS NOT NULL AND manager_id IS NULL;
```

## Summary
The Excel import creates employee records and establishes manager-subordinate relationships based on the Manager ID column. When a manager logs in, the dashboard queries the database using these relationships to show their team members and analytics. The key is ensuring the Manager ID in Excel exactly matches the Bensl_ID of existing managers in the system.