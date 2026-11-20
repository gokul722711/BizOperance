#!/usr/bin/env bash
set -e

echo "=================================================="
echo "    Starting BizOperance Demonstration Suite     "
echo "=================================================="

# Check if PostgreSQL is ready
if ! pg_isready -h localhost -p 5432 -q; then
    echo "Warning: PostgreSQL does not seem to be running on localhost:5432."
    echo "Please ensure the PostgreSQL service is active."
fi

# Activate backend venv
echo "Starting Django REST backend on http://127.0.0.1:8000 ..."
cd backend
source venv/bin/activate
python manage.py migrate --noinput
python manage.py runserver 127.0.0.1:8000 &
BACKEND_PID=$!
cd ..

# Trap SIGINT / SIGTERM to clean up background processes
cleanup() {
    echo "Stopping BizOperance servers..."
    kill $BACKEND_PID 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# Start frontend
echo "Starting Vite React frontend on http://127.0.0.1:5173 ..."
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
