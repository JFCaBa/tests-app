# Docker Setup for Educational Testing Application

This document describes how to run the Educational Testing Application using Docker and Docker Compose, including how to import existing MongoDB data.

## Prerequisites

- Docker Engine (v20.10.0 or later)
- Docker Compose (v2.0.0 or later)
- At least 4GB of RAM available for Docker

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd tests-app
```

### 2. Build and Start the Application

```bash
docker-compose up --build
```

This will:
- Build the backend and frontend Docker images
- Start MongoDB, backend, and frontend services
- Import existing data from the MongoDB dump
- Extract existing uploads

The application will be available at:
- Frontend: `http://localhost`
- Backend API: `http://localhost/api/`
- MongoDB: `localhost:27017` (for direct connection)

### 3. Alternative: Start in Detached Mode

```bash
docker-compose up --build -d
```

This runs the containers in the background. You can view logs with:

```bash
docker-compose logs -f
```

## Data Persistence

- MongoDB data is persisted in a named volume (`mongodb_data`)
- Uploaded files are persisted in a named volume (`uploads`)
- Data will persist between container restarts

## Database Import Details

The MongoDB container will automatically import data from the existing dump during initialization:
- The dump file (`testmyrussian_dump_20250928_082741.tar.gz`) is extracted to `/mongo-init/test-app/`
- The `init-mongo.sh` script automatically runs during container startup
- All collections (users, questions, chatmessages, tutors, tutorsessions, caches) are imported

The uploads directory (`/var/www/testmyrussian.com/uploads`) is extracted from `testmyrussian_uploads_20250928_082741.tar.gz` during backend startup.

## Environment Variables

The Docker setup uses these environment variables:

- `MONGODB_URI`: Connection string for MongoDB
- `JWT_SECRET`: Secret for JWT token generation (default is set in docker-compose.yml)
- `CORS_ORIGIN`: Allowed origins for CORS
- `UPLOAD_PATH`: Path for file uploads

## Useful Commands

### View Logs
```bash
docker-compose logs -f backend    # Backend logs
docker-compose logs -f mongodb    # MongoDB logs
docker-compose logs -f frontend   # Frontend logs
```

### Stop the Application
```bash
docker-compose down
```

### Stop and Remove Volumes (Warning: This will delete all data)
```bash
docker-compose down -v
```

### Access MongoDB Shell
```bash
docker exec -it test-app-mongodb mongosh -u admin -p password --authenticationDatabase admin
```

### Access Backend Container
```bash
docker exec -it test-app-backend sh
```

### Access Frontend Container
```bash
docker exec -it test-app-frontend sh
```

## Troubleshooting

### If the application fails to start
1. Check that all required files exist (dump files in project root)
2. Verify Docker has enough resources allocated
3. Check logs with `docker-compose logs`

### If database import fails
1. Check that the MongoDB container starts successfully
2. Verify dump files are in the correct location

### If uploads don't work
1. Verify the uploads extraction completed during backend startup
2. Check that the upload directory is properly mounted

## Production Considerations

For production deployment, consider:
- Using HTTPS with reverse proxy (nginx, traefik)
- Securing environment variables with Docker secrets
- Setting up regular MongoDB backups
- Configuring proper logging and monitoring
- Using tagged image versions instead of latest
- Securing the MongoDB instance with proper authentication

## Customization

### Custom JWT Secret
Replace the default JWT secret in docker-compose.yml with your own secure secret:

```yaml
- JWT_SECRET=your-very-secure-secret-key-here
```

### MongoDB Credentials
Update the MongoDB credentials in docker-compose.yml:

```yaml
- MONGO_INITDB_ROOT_USERNAME=your_username
- MONGO_INITDB_ROOT_PASSWORD=your_secure_password
```