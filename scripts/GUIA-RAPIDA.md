# 🗑️ Guía Rápida: Cómo Vaciar la Base de Datos

## ⚠️ ADVERTENCIA IMPORTANTE

Estos scripts **eliminarán TODOS los datos** de la base de datos de forma permanente. No hay forma de recuperar los datos después de ejecutarlos.

---

## 🚀 Método Recomendado (Más Fácil)

### Usando yarn/npm:

```bash
yarn db:clear
```

o

```bash
npm run db:clear
```

Este comando:
- ✅ Se conecta automáticamente usando las variables de entorno (.env)
- ✅ Detecta todas las tablas automáticamente
- ✅ Maneja las restricciones de foreign key correctamente
- ✅ Muestra progreso detallado

---

## 🔧 Otros Métodos

### 1. Usar SQL directamente con Docker

**En Windows (PowerShell):**
```powershell
.\scripts\clear-db.ps1
```

**En Linux/Mac:**
```bash
chmod +x scripts/clear-db.sh
./scripts/clear-db.sh
```

### 2. Conectarse manualmente a PostgreSQL

```bash
# Conectar al contenedor Docker
docker exec -it financial-db-1 psql -U postgres -d financial_db

# Luego ejecutar:
TRUNCATE TABLE buy_history_detalle, buy_history, transaccion, account, banco, tropy, counter, products_categories, product, category, users CASCADE;
```

### 3. Usar el script SQL directamente

```bash
# Con Docker
docker exec -i financial-db-1 psql -U postgres -d financial_db < scripts/clear-database.sql

# Con psql instalado localmente
psql -h localhost -p 5432 -U tu_usuario -d financial_db -f scripts/clear-database.sql
```

### 4. Eliminar y recrear todo (Más drástico)

```bash
# Detener y eliminar contenedor + volúmenes
docker-compose down -v

# Eliminar carpeta de datos
rm -rf postgres-db  # Linux/Mac
# o
Remove-Item -Recurse -Force postgres-db  # Windows PowerShell

# Reiniciar
docker-compose up -d
```

---

## 📋 Tablas que se Vaciarán

- `buy_history_detalle`
- `buy_history`
- `transaccion`
- `account`
- `banco`
- `users`
- `tropy`
- `counter`
- `products_categories`
- `product`
- `category`

---

## 🔄 Después de Vaciar

1. TypeORM recreará automáticamente las tablas (si `synchronize: true` está activo)
2. Los datos de prueba necesitarán ser insertados nuevamente
3. Puedes registrar nuevos usuarios y comenzar desde cero

---

## ❓ Solución de Problemas

### Error: "No se puede conectar a la base de datos"

- ✅ Verifica que Docker esté corriendo: `docker ps`
- ✅ Verifica que el contenedor esté activo: `docker-compose ps`
- ✅ Verifica las variables de entorno en `.env`

### Error: "No se encontraron tablas"

- Esto es normal si la base de datos está recién creada
- Las tablas se crearán automáticamente al iniciar la aplicación

### Error: "Permiso denegado"

- Verifica que las credenciales en `.env` sean correctas
- Verifica que el usuario de PostgreSQL tenga los permisos necesarios

---

## 💡 Consejos

- **Para desarrollo**: Usa `yarn db:clear` frecuentemente para limpiar datos de prueba
- **Para testing**: Considera usar transacciones en tus tests
- **Para producción**: ⚠️ NUNCA ejecutes estos scripts en producción

