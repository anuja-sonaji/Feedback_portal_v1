# Excel Import Instructions for Line Managers

## Overview
Line managers can import employee data via Excel sheets. All imported employees will automatically become direct reports of the importing manager.

## Supported Excel Column Names
The system supports multiple column name formats. Use any of these column headers in your Excel file:

### Employee Basic Information
- **Name**: `Full_Name`, `Full Name`, `Name`, `Employee Name`
- **Employee ID**: `Bensl_ID`, `Bensl ID`, `BENSL_ID`
- **System ID**: `System_ID`, `System ID`
- **Email**: `Email`, `Email ID`, `EmailID`

### Employment Details
- **Employment Type**: `Employment_Type`, `Employment Type`
- **Status**: `Employee_Status`, `Employee Status`
- **Billable Status**: `Billable_Status`, `Billable Status`
- **Role/Designation**: `Role`, `Designation`
- **Team**: `Team`
- **Skills**: `Skill`, `Skills`
- **Location**: `Location`
- **Grade**: `Grade`
- **Gender**: `Gender`
- **Company**: `Company`

### Financial Information
- **Billing Rate**: `Billing Rate`, `Billing_Rate`, `BillingRate`
- **Rate Card**: `Rate Card`, `Rate_Card`

### Dates
- **DOJ Allianz**: `DOJ_Allianz`, `DOJ Allianz`, `Date of Joining`
- **DOL Allianz**: `DOL_Allianz`, `DOL Allianz`, `Date of Leaving`
- **Project Start**: `DOJ_Project`, `DOJ Project`, `Project Start Date`
- **Project End**: `DOL_Project`, `DOL Project`, `Project End Date`

### Additional Fields
- **Critical**: `Critical`
- **Remarks**: `Remarks`

## Import Process
1. **Login** as a line manager
2. **Navigate** to Import Excel section
3. **Upload** your Excel file (.xlsx or .xls)
4. **All imported employees** will automatically be assigned to you as their manager
5. **View results** in the Employees section

## Important Notes
- Only line managers can import employee data
- All imported employees become your direct reports automatically
- Duplicate employees (same Bensl_ID) will be skipped
- Default password `password123` is set for all imported employees
- Missing required fields will use default values
- Maximum file size: 16MB

## Data Integrity
The system automatically maintains proper manager-subordinate relationships:
- Imported employees are linked to the importing manager
- Dashboard analytics update immediately
- Hierarchy views reflect the new structure
- Employee counts and reports are accurate

## Troubleshooting
If you don't see imported employees in your dashboard:
1. Refresh the page
2. Check the Employees section
3. Verify you're logged in as a manager
4. Contact system administrator if issues persist