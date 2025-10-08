# GEMINI.md

## Project Overview

This is a full-stack web application for an educational testing platform. It allows users to take tests in various subjects, tracks their progress, and provides an admin panel for content management.

**Frontend:**
- React
- Vite
- Tailwind CSS
- `i18next` for internationalization
- `axios` for API requests

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- `multer` for file uploads

**Infrastructure:**
- Docker and `docker-compose` for containerization and orchestration.

## Building and Running

The project can be run using Docker or locally.

### Docker (Recommended)

To build and run the application using Docker, run the following command from the root of the project:

```bash
docker-compose up --build
```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:1999`.

### Local Development

**Prerequisites:**
- Node.js (v14 or higher)
- MongoDB

**1. Install Dependencies:**

```bash
npm install
```

This will install the dependencies for the root, backend, and frontend.

**2. Configure Backend Environment:**

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your configuration.

**3. Start the Application:**

```bash
npm start
```

This will start both the frontend and backend servers concurrently.

## Development Conventions

### Scripts

The root `package.json` contains the following useful scripts:

- `npm run setup`: Installs dependencies for all services and sets up the database.
- `npm run install-all`: Installs dependencies for the backend and frontend.
- `npm start`: Starts the backend and frontend development servers.
- `npm run build`: Builds the backend and frontend for production.
- `npm test`: Runs tests for the backend and frontend.
- `npm run lint`: Lints the backend and frontend code.
- `npm run clean`: Removes all `node_modules` directories.

### Testing

- The backend uses `jest` for testing.
- The frontend does not have a testing framework configured yet.

### Code Style

- The project uses ESLint for code style.
- The backend uses ES6+ features and `async/await`.

### Localization

The frontend uses `i18next` for internationalization. All new or modified text must be added to all supported languages. The translation files are located in `frontend/src/i18n/translations`.
