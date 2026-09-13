# Notification System Integration Guide

## 1. Import NotificationsView in Your Dashboard

```javascript
// In your employer dashboard file (e.g., EmployerDashboard.jsx or DashboardLayout.jsx)
import NotificationsView from './NotificationsView';

// Add as a route or navigation option
<Route path="/employer/notifications" element={<NotificationsView />} />
```

## 2. Add Notification Bell to Header

```javascript
import { useEffect, useState } from 'react';

function HeaderNotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/employer/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setUnreadCount(data.unreadCount || 0);
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <a href="/employer/notifications" className="relative">
      <span>🔔</span>
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-red-500 text-white rounded-full text-xs font-bold">
          {unreadCount}
        </span>
      )}
    </a>
  );
}
```

## 3. Trigger Notifications When Creating Applications/Jobs

### When Application Status Changes (in jobSeekerController.js or similar)

```javascript
// After application is created/updated
await sendNotification(
  employerId,
  'employer',
  'New Application Received',
  `${candidateName} applied for ${jobTitle}`,
  'new_applicant',
  `/employer/applications/${applicationId}`,
  'high'
);
```

### When Sending Message to Candidate

```javascript
await sendNotification(
  candidateId,
  'job_seeker',
  'Message from Employer',
  `${employerName} sent you a message`,
  'candidate_message',
  `/messages/${messageId}`,
  'normal'
);
```

### When Job is About to Expire

```javascript
// Triggered by scheduled job or cron task
await sendNotification(
  employerId,
  'employer',
  'Job Listing Expiring Soon',
  `Your "${jobTitle}" posting expires in 2 days`,
  'job_expiring',
  `/employer/jobs/${jobId}`,
  'high'
);
```

## 4. Admin Broadcasting

### Send to All Employers

```bash
# POST /api/admin/broadcast-notification
curl -X POST http://localhost:5000/api/admin/broadcast-notification \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "System Maintenance Notice",
    "message": "Platform will be under maintenance tonight from 10 PM - 12 AM UTC",
    "link": "/employer/dashboard",
    "priority": "high"
  }'
```

## 5. Database Schema Requirements

The `notifications` table must exist with these columns:
- `id` (INT PRIMARY KEY AUTO_INCREMENT)
- `user_id` (INT, FOREIGN KEY)
- `type` (ENUM with 7 types)
- `title` (VARCHAR)
- `message` (TEXT)
- `action_url` (VARCHAR)
- `is_read` (BOOLEAN)
- `read_at` (TIMESTAMP)
- `created_at` (TIMESTAMP)

### If table doesn't exist, run:
```sql
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('new_applicant', 'candidate_message', 'ai_match_alert', 'job_expiring', 'company_verified', 'interview_reminder', 'system_announcement', 'application-status') DEFAULT 'application-status',
  title VARCHAR(200) NOT NULL,
  message TEXT,
  action_url VARCHAR(255),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_read (user_id, is_read),
  INDEX idx_created (created_at)
);
```

## 6. Test the System

### 1. Verify Backend is Running
```bash
curl http://localhost:5000/api/employer/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Mark Notification as Read
```bash
curl -X PATCH http://localhost:5000/api/employer/notifications/mark-read \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"notificationId": 1}'
```

### 3. Mark All as Read
```bash
curl -X PATCH http://localhost:5000/api/employer/notifications/mark-read \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## 7. Features Summary

✅ **7 Notification Types** with distinct visual badges
✅ **Real-time Refresh** - Auto-updates every 30 seconds
✅ **5 Filter Categories** - All, Unread, Applications, Messages, System
✅ **Admin Broadcasting** - Send system-wide announcements
✅ **Mark as Read** - Individual or bulk mark read
✅ **Mobile Responsive** - Works on all screen sizes
✅ **Accessibility** - Proper semantic HTML and ARIA labels
