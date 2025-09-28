FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src/ ./src/
COPY .env.example ./.env

# Copy startup script and uploads backup
COPY start.sh .
COPY ../testmyrussian_uploads_20250928_082741.tar.gz /backup/

# Make startup script executable
RUN chmod +x start.sh

# Expose port
EXPOSE 3000

CMD ["./start.sh"]