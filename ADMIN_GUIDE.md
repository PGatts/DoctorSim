# Admin Panel Guide - DoctorSim

## Overview

The Admin Panel provides comprehensive tools for managing users, viewing analytics, managing questions, and exporting data. Only users with the `ADMIN` role can access these features.

## Accessing the Admin Panel

### Login Credentials (Demo)
```
Email: admin@doctorsim.com
Password: admin123
```

### Auto-Redirect Behavior
- When an admin logs in, they are automatically redirected to `/admin/dashboard`
- Admins **cannot** play the game - they are restricted to admin functions only
- Attempting to access `/game` will redirect admins back to the dashboard

---

## Admin Dashboard

**URL:** `/admin/dashboard`

### Overview Statistics

The dashboard displays key metrics:

1. **Total Users** - Number of registered patients
2. **Game Sessions** - Total number of completed game sessions
3. **Questions Answered** - Total responses across all users
4. **Overall Accuracy** - System-wide accuracy percentage
5. **Hints Used** - Total number of hints accessed by all users

### Category Performance Chart

- Visual bar chart showing accuracy by category
- Helps identify which healthcare topics are most challenging
- Categories include:
  - Preventive Care
  - Insurance Basics
  - Medication Management
  - Common Conditions
  - And more...

### Most Difficult Questions

- Lists the 5 questions with the lowest accuracy rates
- Shows:
  - Question text
  - Accuracy percentage
  - Number of attempts
- Minimum 3 attempts required for a question to appear

### Data Export

Three export options available (CSV format):

1. **Export Users CSV**
   - User email and name
   - Total sessions per user
   - Total questions answered
   - Accuracy percentage
   - Join date

2. **Export Responses CSV**
   - User details
   - Session ID
   - Question category
   - Question text
   - Answer selected
   - Correct/Incorrect
   - Time taken
   - Timestamp

3. **Export Analytics CSV**
   - Overall statistics
   - Category-level accuracy
   - System-wide metrics

---

## User Management

**URL:** `/admin/users`

### User List View

- View all registered patients
- Search by name or email
- For each user, see:
  - Name and email
  - Join date
  - Total sessions
  - Total questions answered
  - Overall accuracy

### User Detail View

Click on any user to see detailed information:

#### User Profile
- Email address
- Total sessions
- Total questions answered
- Overall accuracy

#### Session History
- List of all game sessions
- For each session:
  - Date and time
  - Categories covered
  - Questions answered
  - Correct answers
  - Accuracy percentage
  - Link to view full results

#### Analysis Reports
- AI-generated analysis reports
- Knowledge gap identification
- Personalized recommendations

---

## Question Management

**URL:** `/admin/questions`

### Overview Statistics

- Total number of questions
- Number of categories
- Active vs inactive questions

### Category Filter

- Filter questions by category
- View counts per category
- Quick navigation

### Question List

For each question, see:
- Category tag
- Difficulty level (Beginner, Intermediate, Advanced)
- Active/Inactive status
- Question text
- Patient context (name and age)
- Number of answer options

### Question Detail View

Click on any question to see:

1. **Question Context**
   - Patient name and age
   - Category and difficulty
   - Active status

2. **Question Text**
   - Full question as it appears to users

3. **Hint Text**
   - The hint that appears when users click the notepad

4. **Answer Options**
   - All multiple choice options
   - Correct answer highlighted in green
   - Explanations for each option

---

## API Endpoints (Admin Only)

### Statistics
```
GET /api/admin/stats
```
Returns overview statistics, category performance, and difficult questions.

### User Management
```
GET /api/admin/users
GET /api/admin/users?userId={userId}
```
- Without userId: returns list of all users with stats
- With userId: returns detailed user info, sessions, and analyses

### Data Export
```
GET /api/admin/export?type=users
GET /api/admin/export?type=responses
GET /api/admin/export?type=analytics
```
Returns CSV files for download.

---

## Role-Based Access Control

### Admin Role Permissions

✅ **Can Access:**
- Admin dashboard
- User management
- Question viewing and management
- Analytics and reports
- Data exports

❌ **Cannot Access:**
- Game interface (restricted)
- Patient dashboard view

### Security Features

1. **Session-Based Authentication**
   - All admin routes check for valid session
   - Role verification on every request

2. **API Protection**
   - All admin API endpoints verify ADMIN role
   - Returns 403 Forbidden for non-admins

3. **Client-Side Guards**
   - Automatic redirects for unauthorized access
   - Loading states prevent unauthorized views

---

## Best Practices

### Data Privacy

- User data should be handled according to HIPAA guidelines
- Export data securely and store in encrypted locations
- Regularly audit access logs

### Analytics Interpretation

1. **Low Accuracy Categories**
   - Identify topics needing better questions
   - Consider adding educational content
   - May indicate unclear questions

2. **User Patterns**
   - High hint usage may indicate difficult content
   - Low completion rates suggest engagement issues
   - Time metrics can reveal comprehension levels

3. **Question Difficulty**
   - Adjust difficulty levels based on accuracy data
   - Balance question distribution across categories
   - Update or retire problematic questions

### Regular Maintenance

1. **Weekly Tasks**
   - Review most difficult questions
   - Check for new user feedback
   - Monitor system performance

2. **Monthly Tasks**
   - Export and archive analytics data
   - Review category performance trends
   - Update questions based on data

3. **Quarterly Tasks**
   - Comprehensive data analysis
   - Question library refresh
   - User engagement assessment

---

## Troubleshooting

### Common Issues

**Issue:** Cannot see admin dashboard
- **Solution:** Verify your user role is set to 'ADMIN' in database
- **Check:** Query the User table: `SELECT role FROM User WHERE email = 'your@email.com'`

**Issue:** Export not downloading
- **Solution:** Check browser pop-up blocker settings
- **Alternative:** Right-click export button and "Save link as..."

**Issue:** Statistics not loading
- **Solution:** Ensure database connection is active
- **Check:** Browser console for error messages
- **Verify:** API endpoints are accessible

**Issue:** Cannot see specific user
- **Solution:** User might not have role 'PATIENT'
- **Note:** Only patients appear in user management

---

## Future Enhancements

Planned features for admin panel:

1. **Question CRUD Operations**
   - Create new questions via UI
   - Edit existing questions
   - Delete or deactivate questions
   - Bulk import from CSV

2. **Advanced Analytics**
   - Time-series performance graphs
   - Cohort analysis
   - A/B testing for questions
   - Engagement heatmaps

3. **User Management**
   - Manual user creation
   - Password reset functionality
   - Role assignment
   - Account deactivation

4. **Notification System**
   - Alert admins to system issues
   - Flag inappropriate responses
   - Notify of unusual patterns

5. **Report Scheduling**
   - Automated weekly/monthly reports
   - Email delivery
   - Custom report builder

---

## Support

For technical issues or feature requests:
- Check the main [README.md](README.md)
- Review [DEPLOYMENT.md](DEPLOYMENT.md) for setup issues
- Contact the development team

---

## Quick Reference

### Navigation Menu

All admin pages include this navigation bar:

- **Dashboard** - Overview and statistics
- **Users** - User management and details
- **Questions** - Question library
- **Exit Admin** - Return to regular user view

### Keyboard Shortcuts

- `Ctrl/Cmd + K` - Quick search (if implemented)
- `Esc` - Close detail views
- Browser back button works for all views

### Data Refresh

- Dashboard stats: Real-time on page load
- User list: Real-time on page load
- Exports: Real-time generation
- Charts: Auto-update on navigation

---

*Last Updated: November 2024*

