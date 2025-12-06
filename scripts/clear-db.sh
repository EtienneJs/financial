#!/bin/bash

# Script para vaciar la base de datos usando Docker
# Uso: ./scripts/clear-db.sh

# Cargar variables de entorno
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

DB_NAME=${DB_NAME:-financial_db}
DB_USERNAME=${DB_USERNAME:-postgres}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}

echo "🗑️  Vaciando base de datos: $DB_NAME"

# Verificar si Docker está ejecutándose
if docker ps > /dev/null 2>&1; then
    echo "✅ Docker está ejecutándose"
    
    # Ejecutar script SQL dentro del contenedor
    docker exec -i financial-db-1 psql -U $DB_USERNAME -d $DB_NAME < scripts/clear-database.sql
    
    if [ $? -eq 0 ]; then
        echo "✅ Base de datos vaciada exitosamente"
    else
        echo "❌ Error al vaciar la base de datos"
        exit 1
    fi
else
    echo "❌ Docker no está ejecutándose"
    echo "💡 Alternativa: usar psql directamente"
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d $DB_NAME -f scripts/clear-database.sql
fi

