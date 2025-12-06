import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Cargar variables de entorno
dotenv.config({ path: resolve(__dirname, '../.env') });
dotenv.config({ path: resolve(__dirname, '../.env.local') });

async function clearDatabase() {
  console.log('🗑️  Iniciando limpieza de base de datos...\n');

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: +(process.env.DB_PORT || 5432),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: ['src/**/*.entity.ts'],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Conectado a la base de datos:', process.env.DB_NAME);

    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Obtener todas las tablas
      const tables = await queryRunner.query(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename;
      `);

      if (tables.length === 0) {
        console.log('ℹ️  No se encontraron tablas en la base de datos');
        await queryRunner.rollbackTransaction();
        return;
      }

      console.log(`\n📋 Tablas encontradas: ${tables.length}`);
      tables.forEach((table: { tablename: string }) => {
        console.log(`   - ${table.tablename}`);
      });

      // Desactivar temporalmente las restricciones de foreign key
      await queryRunner.query('SET session_replication_role = replica;');
      console.log('\n🔄 Desactivando restricciones de foreign key...');

      // Truncar todas las tablas
      console.log('\n🗑️  Vaciando tablas...\n');
      for (const table of tables) {
        try {
          await queryRunner.query(`TRUNCATE TABLE "${table.tablename}" CASCADE;`);
          console.log(`  ✓ ${table.tablename}`);
        } catch (error: any) {
          console.error(`  ✗ Error en "${table.tablename}":`, error.message);
        }
      }

      // Restaurar las restricciones de foreign key
      await queryRunner.query('SET session_replication_role = origin;');
      console.log('\n🔄 Restaurando restricciones de foreign key...');

      await queryRunner.commitTransaction();
      console.log('\n✅ Base de datos vaciada exitosamente\n');
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      console.error('\n❌ Error al vaciar la base de datos:', error.message);
      throw error;
    } finally {
      await queryRunner.release();
    }

    await dataSource.destroy();
  } catch (error: any) {
    console.error('\n❌ Error de conexión:', error.message);
    console.error('\n💡 Verifica:');
    console.error('   - Que la base de datos esté corriendo');
    console.error('   - Que las variables de entorno (.env) estén correctas');
    console.error('   - Que Docker esté ejecutándose (si usas Docker)\n');
    process.exit(1);
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  clearDatabase();
}

export { clearDatabase };
