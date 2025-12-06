# Script PowerShell para vaciar la base de datos
# Uso: .\scripts\clear-db.ps1

# Cargar variables de entorno desde .env
if (Test-Path .env) {
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value, 'Process')
        }
    }
}

$DB_NAME = $env:DB_NAME
$DB_USERNAME = $env:DB_USERNAME
$DB_PASSWORD = $env:DB_PASSWORD
$DB_HOST = $env:DB_HOST
$DB_PORT = if ($env:DB_PORT) { $env:DB_PORT } else { "5432" }

Write-Host "🗑️  Vaciando base de datos: $DB_NAME" -ForegroundColor Yellow

# Verificar si Docker está ejecutándose
$dockerRunning = docker ps 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Docker está ejecutándose" -ForegroundColor Green
    
    # Buscar el contenedor de PostgreSQL
    $containerName = docker ps --format "{{.Names}}" | Select-String -Pattern "db|postgres" | Select-Object -First 1
    
    if ($containerName) {
        Write-Host "📦 Contenedor encontrado: $containerName" -ForegroundColor Cyan
        Get-Content scripts/clear-database.sql | docker exec -i $containerName psql -U $DB_USERNAME -d $DB_NAME
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Base de datos vaciada exitosamente" -ForegroundColor Green
        } else {
            Write-Host "❌ Error al vaciar la base de datos" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "❌ No se encontró contenedor de PostgreSQL" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "⚠️  Docker no está ejecutándose" -ForegroundColor Yellow
    Write-Host "💡 Alternativa: usar psql directamente si está instalado" -ForegroundColor Cyan
    
    if (Get-Command psql -ErrorAction SilentlyContinue) {
        $env:PGPASSWORD = $DB_PASSWORD
        psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d $DB_NAME -f scripts/clear-database.sql
    } else {
        Write-Host "❌ psql no está instalado. Por favor instálalo o ejecuta Docker." -ForegroundColor Red
        exit 1
    }
}

