# Hospital Dashboard Component

This folder contains the components for the Hospital Dashboard feature of Patient PATH. The dashboard provides a central control center for hospital staff to manage patient transports.

## Integration Guide

To integrate the Hospital Dashboard into your application, follow these steps:

### 1. Update App.js

Add the following import statement at the top of your `App.js` file:

```jsx
import HospitalDashboard from './components/Dashboard/Hospital/HospitalDashboard';
```

### 2. Add the Route

In your `App.js` file, add a new route for the Hospital Dashboard:

```jsx
<Route path="/hospital-dashboard" element={<HospitalDashboard />} />
```

### 3. Update Navigation (Optional)

If you have a navigation component, add a link to the Hospital Dashboard:

```jsx
<Link to="/hospital-dashboard">Hospital Dashboard</Link>
```

## Protected Route (Recommended)

For security, it's recommended to wrap the Hospital Dashboard route in a ProtectedRoute component:

```jsx
<Route 
  path="/hospital-dashboard" 
  element={
    <ProtectedRoute userType="hospital">
      <HospitalDashboard />
    </ProtectedRoute>
  } 
/>
```

## Features

The Hospital Dashboard includes the following key elements:

1. **Summary Statistics**: 
   - Active transports
   - Pending requests
   - Completed transports
   - Urgent requests

2. **Recent Activity Feed**:
   - Transport creation
   - Status updates
   - Assignment notifications
   - Message alerts

3. **Quick Action Buttons**:
   - New transport request
   - View schedule

4. **Notifications Panel**:
   - Real-time notifications
   - Mark as read functionality

5. **Navigation Menu**:
   - Links to other hospital features
   - User profile information

## Supabase Integration

The dashboard is designed to work with Supabase for real-time updates. It utilizes Supabase's real-time subscriptions to update the UI whenever there are changes to:

- Transport requests
- Notifications

## Responsive Design

The dashboard is fully responsive and will adapt to different screen sizes:

- Desktop: Full three-column layout
- Tablet: Stacked layout with full-width sections
- Mobile: Simplified single-column layout 