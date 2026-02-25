<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=220&section=header&text=AI%20Smart%20Study%20Planner&fontSize=40&animation=fadeIn" alt="AI Smart Study Planner" width="100%" />
</div>

<div align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=22&duration=2500&pause=600&color=2F81F7&center=true&vCenter=true&width=600&lines=AI+powered+study+plans;Smarter+topics+and+task+flow;Visual+progress+that+motivates" alt="Typing intro" />
</div>

<div align="center">
  <img src="https://img.shields.io/badge/Laravel-11-red" alt="Laravel 11" />
  <img src="https://img.shields.io/badge/React-TypeScript-61dafb" alt="React + TypeScript" />
  <img src="https://img.shields.io/badge/Inertia.js-Enabled-9553f0" alt="Inertia.js" />
  <img src="https://img.shields.io/badge/AI-OpenAI-0b7" alt="OpenAI" />
  <img src="https://img.shields.io/badge/License-MIT-black" alt="MIT License" />
  <img src="https://img.shields.io/badge/Status-Active-success" alt="Active status" />
</div>

---

## Table of Contents

- [Overview](#overview)
- [Quick Peek](#quick-peek)
- [Demo Gallery](#demo-gallery)
- [Motion Highlights](#motion-highlights)
- [Feature Highlights](#feature-highlights)
- [Quick Start](#quick-start)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

AI Smart Study Planner helps students build optimized daily schedules based on exam dates, subject priorities, and available time. It works with or without an OpenAI key, using a fallback algorithm when AI is not configured.

---

## Quick Peek

<div align="center">
  <img src="https://placehold.co/380x220?text=AI+Plan+Card+GIF" alt="AI Plan Card" width="32%" />
  <img src="https://placehold.co/380x220?text=Subject+Board+GIF" alt="Subject Board" width="32%" />
  <img src="https://placehold.co/380x220?text=Progress+Pulse+GIF" alt="Progress Pulse" width="32%" />
</div>

---

## Demo Gallery

Replace the images below with your own animated GIFs or short clips.

<div align="center">
  <img src="https://placehold.co/1200x675?text=Dashboard+Overview+GIF" alt="Dashboard Overview" width="100%" />
</div>

<div align="center">
  <img src="https://placehold.co/1200x675?text=AI+Plan+Generation+GIF" alt="AI Plan Generation" width="100%" />
</div>

<div align="center">
  <img src="https://placehold.co/1200x675?text=Task+Progress+Flow+GIF" alt="Task Progress Flow" width="100%" />
</div>

---

## Motion Highlights

<div align="center">
  <img src="https://placehold.co/1200x300?text=Study+Plan+Timeline+Animation" alt="Study plan timeline" width="100%" />
</div>

<div align="center">
  <img src="https://placehold.co/1200x300?text=Focus+Mode+Animation" alt="Focus mode" width="100%" />
</div>

<div align="center">
  <img src="https://placehold.co/1200x300?text=Analytics+Glide+Animation" alt="Analytics glide" width="100%" />
</div>

---

## Feature Highlights

| Area | What it does | Why it matters |
| --- | --- | --- |
| AI Planning | Generates daily plans and task sequences | Keeps study time aligned with deadlines |
| Subject + Topic Tracking | Breaks down subjects into actionable items | Creates manageable goals |
| Progress Tracking | Marks tasks and logs study sessions | Keeps motivation visible |
| Analytics | Shows trends, velocity, and completion ratios | Identifies weak spots early |
| Fallback Planning | Works without OpenAI credentials | No hard dependency on AI |

---

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

---

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

---

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

---

## Roadmap

- [ ] Add onboarding walkthrough with guided setup
- [ ] Add downloadable calendar export (ICS)
- [ ] Add study streak tracking and reminders
- [ ] Expand analytics charts with weekly trends

---

## Contributing

Pull requests are welcome. Please open an issue for major changes.

## License

MIT

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=120&section=footer" alt="Footer" width="100%" />
</div>
