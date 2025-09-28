# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Root Level Commands (package.json)
- `npm run setup` - Sets up the entire project (installs dependencies for both frontend and backend)
- `npm run start` - Starts both backend and frontend concurrently
- `npm run build` - Builds both backend and frontend
- `npm run test` - Runs tests for both backend and frontend
- `npm run lint` - Lints both backend and frontend code

### Backend Commands (backend/package.json)
- `npm run dev` - Start backend in development mode with nodemon
- `npm start` - Start backend in production mode
- `npm test` - Run Jest tests

### Frontend Commands (frontend/package.json)
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production with Vite
- `npm run lint` - Run ESLint on frontend code
- `npm run preview` - Preview production build locally

### Docker Commands
- `docker-compose up` - Start all services (MongoDB, backend, frontend)
- `docker-compose down` - Stop all services
- `docker-compose build` - Rebuild Docker images

## Architecture Overview

### Monorepo Structure
This is a full-stack educational testing application with the following structure:
- `backend/` - Node.js/Express API server with MongoDB
- `frontend/` - React/Vite application with Tailwind CSS and Radix UI
- `scripts/` - Setup and utility scripts
- `mongo-init/` - MongoDB initialization scripts

### Backend Architecture
- **Framework**: Express.js with ES modules (`"type": "module"`)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based auth system
- **File Uploads**: Multer for handling audio/image uploads
- **Key Features**: Educational testing platform with multiple question types, user progress tracking, admin panel

### Frontend Architecture
- **Framework**: React 18 with Vite build tool
- **Routing**: React Router DOM for navigation
- **UI Components**: Radix UI primitives with Tailwind CSS styling
- **State Management**: Context API for application state
- **Internationalization**: i18next for multi-language support
- **Key Features**: Test interface, admin dashboard, user statistics, payment integration (PayPal)

### Database Models
Main entities include:
- Users (authentication, roles, test history)
- Questions (multiple types: MC, writing, audio with subject categorization)
- Tests and test sessions
- Tutors and coaching sessions
- Chat functionality
- Subscriptions and payments

### API Structure
RESTful API with routes organized by feature:
- `/api/auth` - Authentication endpoints
- `/api/questions` - Question management
- `/api/tests` - Test execution and results
- `/api/admin` - Administrative functions
- `/api/coach` - Coaching features
- `/api/tutors` - Tutor management
- `/api/subscription` - Payment and subscription handling
- `/api/chat` - Chat functionality

### Environment Configuration
Backend requires these environment variables:
- `MONGODB_URI` - Database connection string
- `JWT_SECRET` - JWT signing secret
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - Allowed frontend origins
- `UPLOAD_PATH` - File upload directory

### Development Notes
- Backend uses ES modules with file extensions required in imports
- Frontend uses TypeScript definitions for enhanced development experience
- Both frontend and backend have ESLint configurations
- File uploads are handled with size limits (50MB for large content)
- CORS is configured for specific production domains