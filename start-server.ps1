# Safe Server Starter Script
# Credentials are loaded from .env file by server/index.js (dotenv.config)
# No need to set environment variables here

Write-Host "🚀 Starting Terbang server..." -ForegroundColor Green
Write-Host "📁 Working directory: d:\vision-wares-ai-main(1)\Terbang" -ForegroundColor Cyan
Write-Host "🔐 Loading credentials from .env file..." -ForegroundColor Yellow
Write-Host ""

cd "d:\vision-wares-ai-main(1)\Terbang"
node server/index.js
