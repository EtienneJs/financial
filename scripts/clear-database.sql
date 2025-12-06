-- Script para vaciar todas las tablas de la base de datos
-- ⚠️  ADVERTENCIA: Esto eliminará TODOS los datos de todas las tablas
-- Ejecutar con cuidado

-- Desactivar las restricciones de foreign key temporalmente
SET session_replication_role = 'replica';

-- Eliminar datos de todas las tablas (respetando el orden de dependencias)
-- Orden: primero tablas dependientes, luego tablas principales
TRUNCATE TABLE 
  buy_history_detalle CASCADE,
  buy_history CASCADE,
  transaccion CASCADE,
  account CASCADE,
  banco CASCADE,
  tropy CASCADE,
  counter CASCADE,
  products_categories CASCADE,
  product CASCADE,
  category CASCADE,
  users CASCADE
RESTART IDENTITY;

-- Reactivar las restricciones de foreign key
SET session_replication_role = 'origin';

-- Verificar que las tablas estén vacías
SELECT 
  schemaname,
  tablename,
  'Vaciada' AS estado
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

