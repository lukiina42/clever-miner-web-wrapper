# Clever Miner Web Wrapper

This application consists of a Django backend, React frontend, and PostgreSQL database.

## Docker Setup

The entire application can be run using Docker Compose with a single command:

```bash
docker compose up -d
```

This will:
- Start a PostgreSQL database on port 6000
- Start the Django API server on port 8000
- Start the React frontend on port 3000

### Accessing the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/clever-miner

### Stopping the Application

```bash
docker compose down
```

### Rebuilding Images

If you've made changes to the code and need to rebuild the Docker images:

```bash
docker compose up -d --build
```

### Viewing Logs

```bash
docker compose logs -f
```

## Development

For local development without Docker:

### Backend (Django)

```bash
cd api
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend (React)

```bash
cd ui
pnpm install
pnpm run dev
```

# api dev commands
To start the server: `python manage.py runserver` <br>

# api db commands
User needs to be in api folder to execute those commands. <br> <br>
To create migration: `python manage.py makemigrations` <br>
To run migration: `python manage.py migrate` <br>
Revert all migrations: `python manage.py migrate app zero` <br>


