# Financial Management System

Sistema integral de gestión financiera construido con NestJS, que incluye gestión de bancos y cuentas bancarias, seguimiento de productos, historial de compras y sistema de trofeos.

## 🚀 Características

- **Gestión de Bancos**: Sistema completo de gestión de bancos y cuentas bancarias
  - Creación y gestión de bancos con múltiples cuentas
  - Gestión de cuentas bancarias con diferentes tipos
  - Sistema de transacciones entre cuentas
  - Validación de existencia y unicidad de datos
- **Gestión de Productos**: Catálogo de productos e inventario
  - Gestión de productos con categorías
  - Control de inventario
- **Historial de Compras**: Seguimiento detallado de transacciones y compras
  - Registro de compras con detalles
  - Relación con cuentas bancarias
- **Sistema de Trofeos**: Sistema de logros y recompensas
- **Módulo Contador**: Funcionalidad de contadores y estadísticas
- **API RESTful**: API REST completa con validación y manejo de errores
- **Validación por Grupos**: Sistema de validación en dos fases (base y base de datos)
- **Integración con Base de Datos**: PostgreSQL con TypeORM
- **Soporte Docker**: Entorno de desarrollo containerizado

## 🛠️ Stack Tecnológico

- **Framework Backend**: NestJS 11.x
- **Lenguaje**: TypeScript 5.7.3
- **Base de Datos**: PostgreSQL 15.1
- **ORM**: TypeORM 0.3.24
- **Validación**: class-validator, class-transformer
- **Containerización**: Docker & Docker Compose
- **Gestor de Paquetes**: Yarn
- **Testing**: Jest
- **Linting**: ESLint con Prettier

## 📋 Prerrequisitos

- Node.js (v18 o superior)
- Yarn como gestor de paquetes
- Docker y Docker Compose
- PostgreSQL (si se ejecuta localmente sin Docker)

## 🚀 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd financial
   ```

2. **Instalar dependencias**
   ```bash
   yarn install
   ```

3. **Configuración del entorno**
   ```bash
   cp .env-example .env
   ```
   
   Edita el archivo `.env` con tu configuración:
   ```env
   DB_PASSWORD=tu_contraseña
   DB_NAME=financial_db
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=tu_usuario
   JWT_SECRET=tu_secreto_jwt
   PORT=3000
   HOST_API=http://localhost:3000
   ```

4. **Iniciar la base de datos**
   ```bash
   docker-compose up -d
   ```

5. **Ejecutar la aplicación**

   **Modo desarrollo:**
   ```bash
   yarn start:dev
   ```

   **Modo producción:**
   ```bash
   yarn build
   yarn start:prod
   ```

## 📁 Estructura del Proyecto

```
src/
├── bank/                    # Gestión de bancos y cuentas
│   ├── entities/           # Entidades: Bank, BankAccount, Transaction
│   ├── dto/                # DTOs: create, update para bancos y cuentas
│   ├── pipes/              # Pipes personalizados de validación
│   ├── mappers/            # Mappers para transformación de datos
│   └── validadorCustom/    # Validadores personalizados
├── buy-history/            # Gestión de historial de compras
│   ├── entities/           # Entidades: BuyHistory, BuyHistoryDetalle
│   └── dto/                # DTOs para historial de compras
├── product/                # Gestión de productos
│   ├── entities/           # Entidades: Product, Category
│   └── dto/                # DTOs para productos y categorías
├── contador/               # Funcionalidad de contadores
│   ├── entities/           # Entidad Contador
│   └── dto/                # DTOs para contadores
├── tropy/                  # Sistema de trofeos/logros
│   ├── entities/           # Entidad Tropy
│   └── dto/                # DTOs para trofeos
├── validatonsGlobals/      # Validadores globales reutilizables
│   ├── validator-exist.ts  # Validador de existencia
│   └── validator-unique-nro-count.ts  # Validador de unicidad
├── interfaces/             # Interfaces compartidas
│   └── response.ts         # Interfaz de respuesta estándar
├── app.module.ts           # Módulo principal de la aplicación
└── main.ts                 # Punto de entrada de la aplicación
```

## 🔧 Scripts Disponibles

- `yarn start` - Iniciar la aplicación
- `yarn start:dev` - Iniciar en modo desarrollo con hot reload
- `yarn start:debug` - Iniciar en modo debug
- `yarn start:prod` - Iniciar en modo producción
- `yarn build` - Compilar la aplicación
- `yarn test` - Ejecutar tests
- `yarn test:watch` - Ejecutar tests en modo watch
- `yarn test:cov` - Ejecutar tests con cobertura
- `yarn test:debug` - Ejecutar tests en modo debug
- `yarn test:e2e` - Ejecutar tests end-to-end
- `yarn lint` - Ejecutar ESLint
- `yarn format` - Formatear código con Prettier

## 🌐 Endpoints de la API

La API está disponible en `http://localhost:3000/api` con los siguientes módulos principales:

### Banco (`/api/bank`)
- `POST /api/bank` - Crear un nuevo banco
- `GET /api/bank` - Listar todos los bancos (con filtro opcional por nombre)
- `GET /api/bank/:id` - Obtener un banco por ID
- `PATCH /api/bank/:id` - Actualizar un banco
- `DELETE /api/bank/:id` - Eliminar un banco
- `POST /api/bank/create-account/:bankId` - Crear una cuenta bancaria
- `PATCH /api/bank/update-account/:id` - Actualizar una cuenta bancaria
- `DELETE /api/bank/delete-account/:id` - Eliminar una cuenta bancaria
- `POST /api/bank/account/transaction` - Crear una transacción entre cuentas

### Productos (`/api/product`)
- Gestión de productos y categorías

### Historial de Compras (`/api/buy-history`)
- Gestión del historial de compras

### Contador (`/api/contador`)
- Operaciones de contadores

### Trofeos (`/api/tropy`)
- Sistema de trofeos y logros

## 🗄️ Base de Datos

La aplicación utiliza PostgreSQL con la siguiente configuración:
- **Host**: `localhost` (configurable mediante `DB_HOST`)
- **Puerto**: `5432` (configurable mediante `DB_PORT`)
- **Base de Datos**: `financial_db` (configurable mediante `DB_NAME`)
- **Sincronización automática**: Habilitada para desarrollo
- **Carga automática de entidades**: Habilitada

### Entidades Principales
- **Bank**: Bancos con relación uno-a-muchos con cuentas
- **BankAccount**: Cuentas bancarias con número único, tipo y balance
- **Transaction**: Transacciones entre cuentas bancarias
- **Product**: Productos con categorías
- **BuyHistory**: Historial de compras con detalles
- **Contador**: Contadores y estadísticas
- **Tropy**: Sistema de trofeos

## 🐳 Docker

El proyecto incluye soporte Docker para facilitar la configuración del entorno de desarrollo:

```bash
# Iniciar la base de datos
docker-compose up -d

# Detener la base de datos
docker-compose down
```

El archivo `docker-compose.yml` configura un contenedor PostgreSQL 15.1 con:
- Volúmenes persistentes para los datos
- Variables de entorno desde el archivo `.env`
- Puerto configurable

## 🔒 Variables de Entorno

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `DB_PASSWORD` | Contraseña de la base de datos | - |
| `DB_NAME` | Nombre de la base de datos | - |
| `DB_HOST` | Host de la base de datos | - |
| `DB_PORT` | Puerto de la base de datos | 5432 |
| `DB_USERNAME` | Usuario de la base de datos | - |
| `JWT_SECRET` | Clave secreta para JWT | - |
| `PORT` | Puerto de la aplicación | 3000 |
| `HOST_API` | URL del host de la API | - |

## 🧪 Testing

```bash
# Ejecutar tests unitarios
yarn test

# Ejecutar tests end-to-end
yarn test:e2e

# Ejecutar tests con cobertura
yarn test:cov

# Ejecutar tests en modo watch
yarn test:watch

# Ejecutar tests en modo debug
yarn test:debug
```

## 📝 Calidad de Código

El proyecto utiliza ESLint y Prettier para mantener la calidad del código:

```bash
# Ejecutar linting
yarn lint

# Formatear código
yarn format
```

## 🔍 Validación por Grupos

El proyecto implementa un sistema de validación en dos fases para optimizar el rendimiento:

- **Grupo `base`**: Validaciones de formato, tipos de datos, rangos y tamaños
- **Grupo `db`**: Validaciones que requieren acceso a la base de datos (como `@isUnique`)

Esto evita ejecutar validaciones costosas cuando ya hay errores en las validaciones básicas.

Para más información, consulta la documentación en `docs/validacion-por-grupos.md`.

### Validadores Personalizados

- **@isUnique**: Valida la unicidad de campos en la base de datos
- **@isExist**: Valida la existencia de registros en la base de datos
- **Pipes personalizados**: Validación de existencia de bancos y cuentas antes de operaciones

## 📚 Documentación Adicional

- **Validación por Grupos**: Consulta `docs/validacion-por-grupos.md` para entender el sistema de validación en dos fases implementado en el proyecto.

## 🏗️ Arquitectura

### Validación
- Validación global con grupo `base` por defecto
- Validación encadenada en endpoints específicos (base → db)
- Validadores personalizados con inyección de dependencias
- Pipes personalizados para validación de existencia

### Mappers
- Transformación de datos de respuesta
- Interfaces tipadas para respuestas de API

### Relaciones de Base de Datos
- **Bank** ↔ **BankAccount**: Uno a muchos
- **BankAccount** ↔ **Transaction**: Uno a muchos (origen y destino)
- **BankAccount** ↔ **BuyHistory**: Uno a muchos

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama para tu feature
3. Realiza tus cambios
4. Ejecuta tests y linting
5. Envía un pull request

## 📄 Licencia

Este proyecto es privado y no tiene licencia.

## 👥 Autores

- Financial Management System Team

---

Para más información, contacta al equipo de desarrollo.
