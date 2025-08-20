# Multi-User Support & Alert Storage Implementation

## ✅ What Has Been Implemented

### Backend Features

1. **User Authentication System**
   - User registration and login with JWT tokens
   - Secure password hashing with bcrypt
   - Role-based access (driver, supervisor, admin)
   - Token refresh mechanism

2. **Database Models**
   - **Users**: Store user accounts with profiles
   - **Monitoring Sessions**: Track each monitoring session per user
   - **Alerts**: Store all alerts with detailed metrics
   - **Calibrations**: Store user-specific calibration data
   - **Alert Statistics**: Daily aggregated statistics
   - **Configurations**: User-specific settings

3. **Alert Storage & Analytics**
   - Automatic alert storage during monitoring
   - Session tracking with duration and alert counts
   - Daily statistics aggregation
   - Risk score calculation
   - Alert history with filtering
   - Analytics API with period-based analysis

4. **Multi-User WebSocket**
   - Per-user processor instances
   - User authentication via WebSocket
   - Session-based alert storage
   - Isolated user configurations

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get tokens
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/refresh` - Refresh access token

#### Alerts & Analytics
- `POST /api/alerts/store` - Store new alert
- `GET /api/alerts/history` - Get alert history
- `GET /api/alerts/analytics` - Get analytics data
- `GET /api/alerts/sessions` - Get monitoring sessions
- `POST /api/alerts/sessions/end` - End active session
- `GET /api/alerts/statistics/daily` - Get daily statistics

## 📦 Installation Steps

### 1. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Initialize Database

The database will be created automatically when you start the backend. It uses SQLite by default (`dms_database.db`).

### 3. Run Backend

```bash
cd backend
python main.py
```

## 🔐 Testing the System

### 1. Register a User

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "driver1",
    "email": "driver1@example.com",
    "password": "password123",
    "full_name": "John Driver",
    "role": "driver"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=driver1&password=password123"
```

This will return:
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "token_type": "bearer",
  "user": {...}
}
```

### 3. Access Protected Endpoints

Use the access token in headers:
```bash
curl http://localhost:8000/api/alerts/history \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 📊 Database Schema

### Users Table
- `id` (UUID primary key)
- `username` (unique)
- `email` (unique)
- `hashed_password`
- `full_name`
- `role` (driver/supervisor/admin)
- `is_active`
- `created_at`
- `updated_at`

### Monitoring Sessions Table
- `id` (UUID primary key)
- `user_id` (foreign key)
- `start_time`
- `end_time`
- `duration_seconds`
- `total_alerts`
- `drowsiness_alerts`
- `distraction_alerts`

### Alerts Table
- `id` (UUID primary key)
- `user_id` (foreign key)
- `session_id` (foreign key)
- `timestamp`
- `alert_type`
- `severity`
- `message`
- `eye_aspect_ratio`
- `mouth_aspect_ratio`
- `blink_count`
- `head_position` (JSON)
- `gaze_metrics` (JSON)
- `states` (JSON)
- `duration_ms`

## 🎯 Key Features

### 1. Per-User Isolation
- Each user has their own processor instance
- Separate calibration data
- Individual configuration settings
- Isolated alert history

### 2. Session Management
- Automatic session creation on monitoring start
- Session ends when monitoring stops
- Duration tracking
- Alert counting per session

### 3. Alert Analytics
- Daily, weekly, monthly, yearly analysis
- Severity breakdown
- Hourly distribution
- Risk score calculation
- Most common alerts

### 4. Supervisor Features
- View multiple driver statistics
- Generate reports
- Monitor real-time sessions
- Risk assessment

## 🔄 WebSocket Flow with Authentication

1. **Connect to WebSocket**
```javascript
const ws = new WebSocket('ws://localhost:8000/ws');
```

2. **Authenticate**
```javascript
ws.send(JSON.stringify({
  type: 'authenticate',
  token: 'YOUR_ACCESS_TOKEN'
}));
```

3. **Start Monitoring**
```javascript
ws.send(JSON.stringify({
  type: 'start_monitoring'
}));
```

4. **Send Frames**
```javascript
ws.send(JSON.stringify({
  type: 'frame',
  data: base64ImageData
}));
```

Alerts are automatically stored in the database during monitoring.

## 📈 Analytics Dashboard Features

The system now supports:

1. **Real-time Monitoring**
   - Live alert display
   - Current session tracking
   - Instant risk assessment

2. **Historical Analysis**
   - Alert trends over time
   - Pattern recognition
   - Performance metrics

3. **Risk Assessment**
   - Daily risk scores
   - Severity analysis
   - Predictive insights

4. **Multi-User Management**
   - User profiles
   - Role-based access
   - Supervisor oversight

## 🚀 Production Deployment

### Using PostgreSQL (Recommended)

1. Install PostgreSQL
2. Create database:
```sql
CREATE DATABASE dms_production;
```

3. Update environment variable:
```bash
export DATABASE_URL="postgresql://user:password@localhost/dms_production"
```

4. Update SECRET_KEY:
```bash
export SECRET_KEY="your-secure-secret-key-here"
```

### Security Considerations

1. **Use HTTPS in production**
2. **Secure JWT secret key**
3. **Enable CORS only for trusted domains**
4. **Implement rate limiting**
5. **Add input validation**
6. **Enable audit logging**

## 📱 Frontend Integration

To integrate with the frontend:

1. **Add authentication context**
2. **Store tokens in localStorage/sessionStorage**
3. **Add auth headers to API calls**
4. **Handle token refresh**
5. **Add login/register pages**
6. **Create analytics dashboard**

## 🔍 Monitoring & Maintenance

1. **Database Backup**
```bash
sqlite3 dms_database.db ".backup backup.db"
```

2. **Clear Old Sessions**
```sql
DELETE FROM monitoring_sessions 
WHERE end_time < datetime('now', '-30 days');
```

3. **Generate Reports**
```python
# Use the analytics API to generate reports
GET /api/alerts/analytics?period=month
```

## 📝 Next Steps for Frontend

The frontend needs:

1. **Login/Register Pages**
2. **Auth Context/Provider**
3. **Protected Routes**
4. **Alert History Page**
5. **Analytics Dashboard**
6. **User Profile Page**
7. **Token Management**

The backend is fully ready with all APIs implemented and tested!