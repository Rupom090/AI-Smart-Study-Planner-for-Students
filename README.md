# AI Smart Study Planner for Students

An intelligent study planner powered by AI that helps students create personalized study schedules based on their subjects, exam dates, and available study time.

## Features

- 🤖 **AI-Powered Study Plans** - Generate optimal daily study schedules using OpenAI
- 📚 **Subject Management** - Track multiple subjects with exam dates and priority levels
- 📝 **Topic Tracking** - Break down subjects into manageable topics
- ✅ **Progress Monitoring** - Track completed tasks and study progress
- 📊 **Dashboard Analytics** - Visual insights into your study performance
- 🎯 **Smart Scheduling** - AI considers exam proximity, priority, and available time

## Technology Stack

- **Backend**: Laravel 11 (PHP 8.2)
- **Frontend**: React + TypeScript + Inertia.js
- **Database**: SQLite (development) / MySQL (production)
- **AI**: OpenAI GPT-4
- **Styling**: Tailwind CSS
- **Authentication**: Laravel Breeze

## Quick Start

### Prerequisites
- PHP 8.2 or higher
- Composer
- Node.js 20+ and npm
- OpenAI API key (optional, fallback mode available)

### Installation

1. **Install dependencies**:
   ```powershell
   # PHP dependencies
   composer install
   
   # Frontend dependencies
   npm install
   ```

2. **Environment setup**:
   - Copy `.env.example` to `.env` (already done)
   - Update database settings if needed
   - Add your OpenAI API key to `.env`:
     ```
     OPENAI_API_KEY=your_api_key_here
     OPENAI_MODEL=gpt-4o
     ```

3. **Database setup**:
   ```powershell
   # Create SQLite database (already done)
   # Run migrations (already done)
   php artisan migrate
   ```

4. **Build frontend assets**:
   ```powershell
   npm run build
   # Or for development with hot reload:
   npm run dev
   ```

5. **Start the application**:
   ```powershell
   php artisan serve
   ```

   Visit: http://localhost:8000

## Usage Guide

### 1. Register/Login
Create an account or login to access your personalized study planner.

### 2. Add Subjects
- Navigate to **Subjects** from the dashboard
- Click **Add Subject**
- Enter subject name, exam date, and priority level (1-5)
- Add topics for each subject

### 3. Generate Study Plan
- Go to **Study Plan** page
- Enter available study time (in minutes)
- Click **Generate Plan**
- AI will create an optimized daily schedule based on:
  - Exam proximity
  - Subject priority
  - Topic difficulty
  - Your available time

### 4. Track Progress
- Mark tasks as "In Progress" or "Completed"
- View progress stats on the dashboard
- Log study sessions

## API Endpoints

### Authentication
- `POST /register` - Register new user
- `POST /login` - Login
- `POST /logout` - Logout

### Subjects
- `GET /api/subjects` - List all subjects
- `POST /api/subjects` - Create subject
- `PUT /api/subjects/{id}` - Update subject
- `DELETE /api/subjects/{id}` - Delete subject

### Topics
- `GET /api/subjects/{id}/topics` - List topics for subject
- `POST /api/subjects/{id}/topics` - Create topic
- `PUT /api/topics/{id}` - Update topic
- `DELETE /api/topics/{id}` - Delete topic

### Study Plans
- `GET /api/plans/today` - Get today's plan
- `POST /api/plans/generate` - Generate new plan
- `POST /api/plans/regenerate` - Regenerate existing plan

### Tasks
- `PATCH /api/tasks/{id}` - Update task status

### Progress Logs
- `POST /api/progress-logs` - Log study session

## Configuration

### OpenAI Settings
Edit `.env` to configure AI behavior:
```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o  # or gpt-3.5-turbo for lower cost
```

**Note**: The system works without an API key using a fallback algorithm, but AI-powered plans provide better optimization.

### Database
Switch to MySQL for production:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=study_planner
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

## Project Structure

```
app/
├── Http/
│   ├── Controllers/       # API controllers
│   └── Requests/          # Form validation
├── Models/                # Eloquent models
└── Services/
    └── StudyPlanGenerator.php  # AI plan generation logic

database/
└── migrations/            # Database schema

resources/
├── js/
│   ├── Pages/            # React components
│   └── Layouts/          # Page layouts
└── css/                  # Tailwind styles

routes/
├── api.php               # API routes
└── web.php               # Web routes
```

## Development

### Run development server:
```powershell
# Terminal 1: Laravel server
php artisan serve

# Terminal 2: Vite dev server (hot reload)
npm run dev
```

### Run tests:
```powershell
php artisan test
```

### Code formatting:
```powershell
# PHP (Laravel Pint)
./vendor/bin/pint

# TypeScript/React
npm run lint
```

## Troubleshooting

### Issue: OpenAI API errors
**Solution**: Check your API key in `.env`. System will use fallback algorithm if key is invalid.

### Issue: Database connection failed
**Solution**: Verify database settings in `.env` and ensure database file exists.

### Issue: Assets not loading
**Solution**: Run `npm run build` and clear browser cache.

### Issue: Composer alias not working
**Solution**: Restart PowerShell or run: `. $PROFILE`

## License

This project is open-source software licensed under the MIT license.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues or questions, please open an issue on GitHub.

---

**Made with ❤️ for students by students**
   ```
7) Run migrations:
   ```bash
   php artisan migrate
   ```
8) Serve the API:
   ```bash
   php artisan serve --host=0.0.0.0 --port=8000
   ```

## Environment for AI (OpenAI)
Add to `.env`:
```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
```

## Key routes (API-first)
- Auth (from Breeze/Sanctum): `POST /register`, `POST /login`.
- Subjects: `GET/POST/PUT/DELETE /subjects`.
- Topics: `GET/POST/PUT/DELETE /subjects/{subject}/topics`.
- Plans: `POST /plans/generate`, `GET /plans/today`, `POST /plans/regenerate`.
- Tasks: `PATCH /tasks/{task}`.
- Progress: `POST /progress-logs`.
- AI feedback is stored automatically when generating plans.

## What’s included here
- Migrations for all tables (UUID primary keys).
- Eloquent models with relationships.
- Controllers with basic CRUD/plan endpoints (thin, returning JSON).
- A `StudyPlanGenerator` service stub to call OpenAI and persist daily plans/tasks.
- API route definitions.

## Next steps
- Plug in Breeze/Sanctum for auth middleware on protected routes.
- Flesh out validation rules in the Form Requests (add `app/Http/Requests` if desired).
- Implement real prompt craft and response parsing in `StudyPlanGenerator`.
- Add frontend (Blade/Alpine or a SPA) for dashboard, add-subject, today plan, and progress pages.
- Add tests for short deadlines, long syllabi, missed days, and low daily time.
