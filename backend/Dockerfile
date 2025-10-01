FROM node:18

# Install build tools needed for native modules
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY backend/src/ ./src/
COPY backend/.env.example ./.env

# Copy startup script and uploads backup
COPY backend/start.sh .
COPY testmyrussian_uploads_20250928_082741.tar.gz /backup/

# Make startup script executable
RUN chmod +x start.sh

# Expose port
EXPOSE 3000

CMD ["./start.sh"]