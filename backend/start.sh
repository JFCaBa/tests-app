#!/bin/bash

# Check if uploads already exist, if not, extract from backup
if [ ! -d "/app/uploads" ] || [ -z "$(ls -A /app/uploads)" ]; then
    echo "Extracting uploads from backup..."
    mkdir -p /app/uploads
    tar -xzf /backup/testmyrussian_uploads_20250928_082741.tar.gz -C /app/uploads
    echo "Uploads extracted successfully!"
fi

# Start the backend application
npm run start