# ALKHAT ALNAAQIL - Vehicle Logistics Management System

## Overview
A comprehensive vehicle logistics management web application with PostgreSQL database persistence. The system manages vehicles in transport/shipping with role-based access control (admins and regular users).

## Current State
- **Status**: Fully functional with all core features implemented
- **Database**: PostgreSQL with standard pg driver (compatible with Ubuntu server deployment)
- **Authentication**: Session-based with bcrypt password hashing

## Key Features
- Vehicle tracking and management
- Owner/user assignment
- Photo documentation (warehouse, loading, unloading)
- Invoice management with PDF/image support
- Logistics information (container numbers, booking, ETD/ETA)
- User management with role-based access
- Profile pictures for users
- Complete bilingual support (English/Arabic) with RTL layout
- Data persistence across server restarts

## Admin Credentials
- Username: `Admin`
- Password: `123`

## Project Architecture

### Frontend (client/)
- React with Vite
- Wouter for routing
- TailwindCSS for styling
- Zustand for state management
- React Query for data fetching

### Backend (server/)
- Express.js
- PostgreSQL with Drizzle ORM
- Multer for file uploads
- Session-based authentication

### Key Files
- `shared/schema.ts` - Database schema definitions
- `server/storage.ts` - Storage interface and CRUD operations
- `server/routes.ts` - API routes
- `server/db.ts` - Database connection
- `client/src/lib/store.ts` - Frontend state management
- `client/src/lib/language-context.tsx` - Bilingual translations

## Recent Changes
- Fixed file upload system to use server-side storage in `/uploads` directory
- Fixed navigation (nested `<a>` tag issue resolved)
- Reduced whitespace in car detail page layout
- Car detail page now uses proper server API for uploads (not blob URLs)
- Added missing translation keys

## Deployment Notes (Ubuntu Server)

### Environment Variables Required
```bash
export DATABASE_URL="postgresql://alkhat:YourPassword@localhost:5432/alkhat_naqqil"
export SESSION_SECRET="your-random-secret-key"
export NODE_ENV=production
```

### Permanent Setup with PM2
```bash
pm2 start npm --name "alkhat" --cwd /path/to/project -- start
pm2 save
pm2 startup
```

### Upload Directory Permissions
```bash
mkdir -p uploads
chmod 755 uploads
chown -R <user>:<group> uploads
```

## User Preferences
- Arabic terminology: "سياراتي" for My Garage, "التايتل" for Title, "رقم القطعة" for LOT
- Design: Clean, professional interface with sidebar navigation
- Only admins can: delete cars, edit vehicle details, delete invoices, manage users
