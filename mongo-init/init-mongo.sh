#!/bin/bash
set -e

echo "Starting MongoDB data import..."

# Wait for MongoDB to be ready
sleep 5

# Import all collections from the dump
mongorestore --host localhost --username admin --password password --authenticationDatabase admin --db test-app /docker-entrypoint-initdb.d/

echo "MongoDB data import completed!"