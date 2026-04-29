# Start Development Environment

Write-Host "Starting Development Environment for AI Smart Study Planner..." -ForegroundColor Cyan

# Prevent inherited terminal env vars (often left from test/debug sessions)
# from overriding Laravel .env database/session settings in child processes.
$overrideVars = @(
    'DB_CONNECTION',
    'DB_DATABASE',
    'DB_HOST',
    'DB_PORT',
    'DB_USERNAME',
    'DB_PASSWORD',
    'SESSION_DRIVER',
    'CACHE_STORE',
    'APP_ENV'
)

foreach ($name in $overrideVars) {
    if (Test-Path "Env:$name") {
        Remove-Item "Env:$name" -ErrorAction SilentlyContinue
    }
}

Write-Host "Cleared inherited env overrides so Laravel uses .env settings." -ForegroundColor DarkGray

# 1. Start MySQL (XAMPP) if not running
$mysqlRunning = Get-Process mysqld -ErrorAction SilentlyContinue
if (-not $mysqlRunning) {
    if (Test-Path "C:\xampp\mysql_start.bat") {
        Write-Host "Starting MySQL (XAMPP)..." -ForegroundColor Yellow
        Start-Process "C:\xampp\mysql_start.bat" -WindowStyle Minimized
    } elseif (Test-Path "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe") {
         Write-Host "Please ensure MySQL is running." -ForegroundColor Yellow
         # Starting service via script might require admin, better to just warn or let user handle if standard xampp script isn't there
    } else {
        Write-Warning "Could not find XAMPP MySQL start script. Please ensure database is running."
    }
} else {
    Write-Host "MySQL is already running." -ForegroundColor Green
}

# 2. Start Laravel Server
Write-Host "Starting Laravel Server..." -ForegroundColor Green
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "php artisan serve; Read-Host 'Press Enter to exit'"

# 3. Start Vite
Write-Host "Starting Vite..." -ForegroundColor Green
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "npm run dev; Read-Host 'Press Enter to exit'"

# 4. Start Queue Worker
Write-Host "Starting Queue Worker..." -ForegroundColor Green
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "php artisan queue:listen; Read-Host 'Press Enter to exit'"

Write-Host "All services started." -ForegroundColor Cyan
