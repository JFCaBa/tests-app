# Educational Testing Application (Qwen Context)

## Project Overview

This is a comprehensive educational testing platform built with a Node.js/Express backend and React frontend. The application supports multiple subjects, question types, and user progress tracking. It includes features such as user authentication, admin panel for content management, file upload support for audio and images, and comprehensive test analysis.

## Architecture

The application follows a full-stack architecture with:
- **Backend**: Node.js with Express.js, MongoDB with Mongoose for data storage
- **Frontend**: React with modern tooling (Vite, Tailwind CSS, React Router)
- **Authentication**: JWT-based authentication system
- **File Handling**: Multer for file uploads, particularly audio files

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer for file uploads
- Bcrypt for password hashing
- OpenAI and GPT4All for AI integration

### Frontend
- React (v18+)
- Vite (build tool)
- Tailwind CSS
- React Router
- ShadcnUI components
- Context API for state management

## Project Structure

```
test-app/
  ├── backend/
  │   ├── src/
  │   │   ├── config/
  │   │   ├── models/          # Mongoose models (User, Question, etc.)
  │   │   ├── routes/          # API route definitions
  │   │   ├── middleware/      # Authentication and validation middleware
  │   │   └── services/        # Business logic
  │   ├── package.json
  │   └── .env
  │
  ├── frontend/
  │   ├── src/
  │   │   ├── components/      # React components organized by feature
  │   │   ├── contexts/        # React Context providers
  │   │   └── services/        # API service functions
  │   └── package.json
  │
  ├── scripts/
  └── package.json
```

## Key Features

1. **Multiple Subject Support**: Listening, Grammar, History, Laws, Reading, Writing
2. **Various Question Types**: Multiple Choice, Writing Exercises, Audio Questions
3. **User Progress Tracking**: Statistics and test history
4. **Admin Panel**: Content management for questions and users
5. **File Upload Support**: Audio and image handling
6. **Test Analysis**: Comprehensive test results and statistics
7. **Authentication & Authorization**: Role-based access control (user/admin/tutor)
8. **Subscription Management**: PayPal integration for subscriptions
9. **Tutor Booking System**: Scheduling and session management

## Data Models

### User Model
- Core fields: username, email, password
- Role-based access (user/admin/tutor)
- Statistics tracking with subject-specific metrics
- Test history with detailed results
- Preferences for learning experience

### Question Model
- Subject categorization (listening, grammar, etc.)
- Multiple question types (multiple-choice, writing, audio)
- Difficulty levels (easy, medium, hard)
- Rich content support (audio, images)
- Statistics tracking (attempts, success rate, average time)
- Active/inactive status for content management

## Building and Running

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Setup Commands

From the root directory:

```bash
# Install all dependencies
npm install

# Install backend and frontend dependencies separately
npm run install:backend
npm run install:frontend

# Setup database and run initial configuration
npm run setup

# Start both backend and frontend in development mode
npm start

# Start individual services
npm run start:backend  # Backend only
npm run start:frontend # Frontend only
```

### Backend Setup
1. Navigate to `backend/` directory
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure environment variables
4. Start development server: `npm run dev`

### Frontend Setup
1. Navigate to `frontend/` directory
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

## Development Conventions

### Code Style
- ES6+ features (import/export syntax)
- Async/await for asynchronous operations
- Proper error handling with try/catch
- Component-based architecture on frontend
- Mongoose schemas for data modeling on backend

### Security Measures
- JWT authentication with proper token validation
- Request validation and sanitization
- Password hashing with Bcrypt
- CORS configuration for secure cross-origin requests
- File upload restrictions with size limits
- Role-based access control for protected routes

### API Endpoints
- `/api/auth` - Authentication routes (login, register, etc.)
- `/api/questions` - Question management
- `/api/tests` - Test creation and results
- `/api/admin` - Administrative functions
- `/api/coach` - AI coaching features
- `/api/tutors` - Tutor management
- `/api/subscription` - Subscription handling
- `/api/chat` - Chat functionality

## Testing

The project includes testing frameworks:
- Jest for backend testing
- Frontend testing capabilities (setup in package.json)

Run all tests: `npm test`

## Key Files and Directories

### Backend
- `backend/src/index.js` - Main server entry point
- `backend/src/models/` - Mongoose data models
- `backend/src/routes/` - API route definitions
- `backend/src/config/config.js` - Configuration settings

### Frontend
- `frontend/src/App.jsx` - Main application router
- `frontend/src/contexts/` - Global state management
- `frontend/src/components/` - React components organized by feature
- `frontend/src/services/` - API communication services

## Environmental Configuration

The application uses `.env` files for configuration with these common variables:
- `PORT` - Server port
- `MONGODB_URI` - Database connection string
- `JWT_SECRET` - Secret for token generation
- `CORS_ORIGIN` - Allowed origins
- `UPLOAD_PATH` - File upload directory
- `MAX_FILE_SIZE` - Maximum upload size limit

## Deployment Notes

- The backend serves static files from `/uploads` directory for user-uploaded content
- CORS is configured for production domains
- Database connection is established on server startup
- Both frontend and backend should be built separately for production:
  - Frontend: `npm run build` (in frontend directory)
  - Backend: Just run `npm start`

The application is designed to be deployed as a full-stack application with both frontend and backend serving their respective roles in the educational testing platform ecosystem.