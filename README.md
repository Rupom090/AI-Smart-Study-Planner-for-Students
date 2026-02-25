# AI Smart Study Planner for Students

An intelligent study planner that generates personalized schedules based on subjects, exam dates, and available time.

## Features

- AI-powered daily study plans with a fallback heuristic when no API key is set
- Subject and topic management with priorities and exam dates
- Progress tracking for tasks and study sessions
- Dashboard analytics and quick insights
- Smart scheduling that balances urgency and workload

## Technology Stack

- Backend: Laravel 11 (PHP 8.2)
- Frontend: React + TypeScript + Inertia.js
- Database: SQLite (development) / MySQL (production)
- AI: OpenAI
- Styling: Tailwind CSS
- Auth: Laravel Breeze

## Quick Start

### Prerequisites

- PHP 8.2 or higher
- Composer
- Node.js 20+ and npm
- OpenAI API key (optional)

### Installation

1. Install dependencies:
   ```powershell
   composer install
   npm install
   ```

2. Configure environment:
   ```powershell
   copy .env.example .env
   ```
   Then update `.env` with your database settings and optional OpenAI key.

3. Set up the database:
   ```powershell
   php artisan migrate
   ```

4. Build frontend assets:
   ```powershell
   npm run build
   ```
   Or for development with hot reload:
   ```powershell
   npm run dev
   ```

5. Start the app:
   ```powershell
   php artisan serve
   ```

Visit http://localhost:8000

## Configuration

### OpenAI

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
```

The app works without an API key using a fallback algorithm, but AI plans are more optimized.

### Database (MySQL example)

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=study_planner
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

## Common Scripts

```powershell
php artisan serve
php artisan test
./vendor/bin/pint
npm run dev
npm run build
npm run lint
```

## API Endpoints

### Authentication

- `POST /register`
- `POST /login`
- `POST /logout`

### Subjects

- `GET /api/subjects`
- `POST /api/subjects`
- `PUT /api/subjects/{id}`
- `DELETE /api/subjects/{id}`

### Topics

- `GET /api/subjects/{id}/topics`
- `POST /api/subjects/{id}/topics`
- `PUT /api/topics/{id}`
- `DELETE /api/topics/{id}`

### Study Plans

- `GET /api/plans/today`
- `POST /api/plans/generate`
- `POST /api/plans/regenerate`

### Tasks

- `PATCH /api/tasks/{id}`

### Progress Logs

- `POST /api/progress-logs`

## Project Structure

```
app/
├── Http/
│   ├── Controllers/
│   └── Requests/
├── Models/
└── Services/
    └── StudyPlanGenerator.php

database/
└── migrations/

resources/
├── js/
│   ├── Pages/
│   └── Layouts/
└── css/

routes/
├── api.php
└── web.php
```

## Troubleshooting

- OpenAI errors: verify `OPENAI_API_KEY` in `.env`.
- Database errors: confirm connection settings and that migrations have run.
- Assets not loading: run `npm run build` and clear browser cache.

## Contributing

Pull requests are welcome. Please open an issue for major changes.

## License

MIT
