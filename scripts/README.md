# Scripts de Utilidad para la Base de Datos

Este directorio contiene scripts útiles para gestionar la base de datos.

## 📋 Scripts Disponibles

### 1. `clear-database.sql`
Script SQL puro para vaciar todas las tablas de la base de datos.

**Uso:**
```bash
# Con Docker
docker exec -i financial-db-1 psql -U postgres -d financial_db < scripts/clear-database.sql

# Con psql directo
psql -h localhost -p 5432 -U tu_usuario -d financial_db -f scripts/clear-database.sql
```

### 2. `clear-database.ts`
Script TypeScript que usa TypeORM para vaciar la base de datos automáticamente.

**Uso:**
```bash
# Con yarn/npm
yarn db:clear
# o
npm run db:clear
```

### 3. `clear-db.sh` (Linux/Mac)
Script bash para ejecutar el script SQL desde Docker.

**Uso:**
```bash
chmod +x scripts/clear-db.sh
./scripts/clear-db.sh
```

### 4. `clear-db.ps1` (Windows PowerShell)
Script PowerShell para ejecutar el script SQL desde Docker en Windows.

**Uso:**
```powershell
.\scripts\clear-db.ps1
```

## 🚨 Advertencia

⚠️ **TODOS estos scripts eliminarán TODOS los datos de la base de datos de forma permanente.**

No hay forma de recuperar los datos después de ejecutarlos. Úsalos con precaución, especialmente en producción.

## 📝 Métodos Recomendados

### Opción 1: Usar el script npm/yarn (Recomendado)
```bash
yarn db:clear
```
Este es el método más fácil y seguro, ya que usa TypeORM y carga automáticamente las variables de entorno.

### Opción 2: Usar SQL directo con Docker
```bash
# En Windows PowerShell
.\scripts\clear-db.ps1

# En Linux/Mac
./scripts/clear-db.sh
```

### Opción 3: Usar SQL manualmente
```bash
# Conectar a PostgreSQL
docker exec -it financial-db-1 psql -U postgres -d financial_db

# Ejecutar comandos SQL
TRUNCATE TABLE buy_history_detalle, buy_history, transaccion, account, banco, tropy, counter, products_categories, product, category, users CASCADE;
```

### Opción 4: Eliminar y recrear la base de datos (Más drástico)
```bash
# Detener y eliminar contenedor y volúmenes
docker-compose down -v

# Eliminar carpeta de datos
rm -rf postgres-db

# Reiniciar
docker-compose up -d
```

## 🔄 Después de Vaciar

Después de vaciar la base de datos:
- TypeORM recreará las tablas automáticamente si `synchronize: true` está activo
- O puedes ejecutar migraciones si las tienes configuradas
- Los datos de prueba necesitarán ser insertados nuevamente

## 💡 Consejos

- **Desarrollo**: Usa `yarn db:clear` para limpiar datos de prueba rápidamente
- **Testing**: Considera usar transacciones en tus tests para no necesitar limpiar la DB
- **Producción**: ⚠️ NUNCA ejecutes estos scripts en producción a menos que sea absolutamente necesario

