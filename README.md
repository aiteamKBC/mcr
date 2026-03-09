# MCR Dashboard

Monorepo for the MCR Dashboard application with:
- `MCR-Backend`: Django + Django REST Framework API
- `MCR-Frontend`: React + TypeScript + Vite client

## Project Structure

```text
MCR-Dashboard/
|- MCR-Backend/
|  |- manage.py
|  |- requirements.txt
|  `- ...
|- MCR-Frontend/
|  |- package.json
|  `- src/
`- README.md
```

## Prerequisites

- Python 3.11+ (recommended for backend tooling)
- Node.js 18+ and npm

## Backend Setup (Django)

```bash
cd MCR-Backend
python -m venv .venv
.venv\Scripts\activate
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend default URL: `http://127.0.0.1:8000`

## Frontend Setup (React + Vite)

```bash
cd MCR-Frontend
npm install
npm run dev
```

Frontend default URL: `http://localhost:5173`

## Useful Commands

Backend:

```bash
python manage.py check
python manage.py test
```

Frontend:

```bash
npm run type-check
npm run lint
npm run build
```
