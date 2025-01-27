# Educational Testing Application

A comprehensive educational testing platform supporting multiple subjects, question types, and user progress tracking.

## Features

- Multiple subject support (Listening, Grammar, History, Laws, Reading, Writing)
- Various question types (Multiple Choice, Writing Exercises, Audio Questions)
- User progress tracking and statistics
- Admin panel for content management
- File upload support for audio and images
- Comprehensive test analysis
- User authentication and authorization

## Tech Stack

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer for file uploads

### Frontend (Planned)

- React
- Tailwind CSS
- ShadcnUI Components
- React Router
- Context API for state management

## Project Structure

```
test-app/
  ├── backend/
  │   ├── src/
  │   │   ├── config/
  │   │   ├── models/
  │   │   ├── routes/
  │   │   ├── middleware/
  │   │   └── utils/
  │   ├── package.json
  │   └── .env
  │
  ├── frontend/
  │   ├── src/
  │   │   ├── components/
  │   │   │   ├── auth/
  │   │   │   ├── admin/
  │   │   │   ├── test/
  │   │   │   └── statistics/
  │   │   ├── contexts/
  │   │   └── services/
  │   └── package.json
  │
  ├── scripts/
  └── package.json
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Backend Setup

1. Install dependencies:

```bash
cd backend
npm install
```

2. Configure environment variables:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/test-app
JWT_SECRET=your-secret-key-here
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
UPLOAD_PATH=uploads/
MAX_FILE_SIZE=10mb
```

3. Start the server:

```bash
# Development
npm run dev

# Production
npm start
```

### Database Models

1. **User Model**

- Username, email, password
- Role-based access (user/admin)
- Test history tracking
- User preferences

2. **Question Model**

- Multiple types (MC, writing, audio)
- Subject categorization
- Difficulty levels
- Media attachments
- Performance tracking

## API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed endpoint documentation.

## Development Guidelines

### Code Style

- Use ES6+ features
- Follow ESLint configuration
- Use async/await for asynchronous operations
- Implement proper error handling
- Add comments for complex logic

### Security Measures

- JWT authentication
- Request validation
- File upload restrictions
- Role-based access control
- Password hashing
- Input sanitization

### Testing

- Unit tests for models
- Integration tests for API endpoints
- Test coverage reporting

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Express.js documentation
- MongoDB documentation
- Mongoose documentation
- React documentation
- Tailwind CSS documentation
- ShadcnUI documentation
