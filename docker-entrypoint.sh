#!/bin/sh

# Wait for PostgreSQL to start
echo "Waiting for PostgreSQL to start..."
sleep 5

# Run the application
if [ "$NODE_ENV" = "production" ]; then
  echo "Starting in production mode..."
  node dist/main
else
  echo "Starting in development mode..."
  npm run start:dev
fi 