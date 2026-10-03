param([string]$DbName = "collabcanvas")
$ErrorActionPreference = "Stop"
Write-Host "Checking PostgreSQL..." -ForegroundColor Cyan
psql --version | Out-Null
Write-Host "Creating database '$DbName' if it does not exist..." -ForegroundColor Cyan
$exists = psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DbName'" 2>$null
if ($exists.Trim() -ne "1") { createdb -U postgres $DbName }
Write-Host "Applying CollabCanvas schema..." -ForegroundColor Cyan
psql -U postgres -d $DbName -f "$PSScriptRoot\schema.sql"
Write-Host "Database ready." -ForegroundColor Green
