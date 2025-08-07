# Financial Management System

A comprehensive financial management system built with NestJS, featuring bank account management, product tracking, purchase history, and trophy system.

## 🚀 Features

- **Bank Management**: Complete bank account management system
- **Product Management**: Product catalog and inventory tracking
- **Purchase History**: Detailed transaction and purchase history tracking
- **Trophy System**: Achievement and reward system
- **Contador Module**: Counter and statistics functionality
- **RESTful API**: Full REST API with validation and error handling
- **Database Integration**: PostgreSQL database with TypeORM
- **Docker Support**: Containerized development environment

## 🛠️ Tech Stack

- **Backend Framework**: NestJS 11.x
- **Language**: TypeScript
- **Database**: PostgreSQL 15.1
- **ORM**: TypeORM
- **Validation**: class-validator, class-transformer
- **Containerization**: Docker & Docker Compose
- **Package Manager**: Yarn

## 📋 Prerequisites

- Node.js (v18 or higher)
- Yarn package manager
- Docker and Docker Compose
- PostgreSQL (if running locally)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd financial
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Environment Setup**
   ```bash
   cp .env-example .env
   ```
   
   Edit the `.env` file with your configuration:
   ```env
   DB_PASSWORD=your_password
   DB_NAME=financial_db
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=your_username
   JWT_SECRET=your_jwt_secret
   PORT=3000
   HOST_API=http://localhost:3000
   ```

4. **Start the database**
   ```bash
   docker-compose up -d
   ```

5. **Run the application**

   **Development mode:**
   ```bash
   yarn start:dev
   ```

   **Production mode:**
   ```bash
   yarn build
   yarn start:prod
   ```

## 📁 Project Structure

```
src/
├── bank/                 # Bank account management
│   ├── entities/        # Bank-related entities
│   ├── dto/            # Data transfer objects
│   ├── pipes/          # Custom pipes
│   └── validadorCustom/ # Custom validators
├── buy-history/         # Purchase history management
│   ├── entities/        # History entities
│   └── dto/            # History DTOs
├── product/            # Product management
│   ├── entities/       # Product entities
│   └── dto/           # Product DTOs
├── contador/           # Counter functionality
├── tropy/              # Trophy/achievement system
├── validatonsGlobals/  # Global validation rules
├── helpers/            # Utility functions
├── app.module.ts       # Main application module
└── main.ts            # Application entry point
```

## 🔧 Available Scripts

- `yarn start` - Start the application
- `yarn start:dev` - Start in development mode with hot reload
- `yarn start:debug` - Start in debug mode
- `yarn start:prod` - Start in production mode
- `yarn build` - Build the application
- `yarn test` - Run tests
- `yarn test:watch` - Run tests in watch mode
- `yarn test:cov` - Run tests with coverage
- `yarn lint` - Run ESLint
- `yarn format` - Format code with Prettier

## 🌐 API Endpoints

The API is available at `http://localhost:3000/api` with the following main modules:

- **Bank**: `/api/bank/*` - Bank account operations
- **Products**: `/api/product/*` - Product management
- **Buy History**: `/api/buy-history/*` - Purchase history
- **Contador**: `/api/contador/*` - Counter operations
- **Trophy**: `/api/tropy/*` - Trophy system

## 🗄️ Database

The application uses PostgreSQL with the following configuration:
- **Host**: `localhost` (configurable via `DB_HOST`)
- **Port**: `5432` (configurable via `DB_PORT`)
- **Database**: `financial_db` (configurable via `DB_NAME`)
- **Auto-synchronization**: Enabled for development

## 🐳 Docker

The project includes Docker support for easy development setup:

```bash
# Start the database
docker-compose up -d

# Stop the database
docker-compose down
```

## 🔒 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_PASSWORD` | Database password | - |
| `DB_NAME` | Database name | - |
| `DB_HOST` | Database host | - |
| `DB_PORT` | Database port | 5432 |
| `DB_USERNAME` | Database username | - |
| `JWT_SECRET` | JWT secret key | - |
| `PORT` | Application port | 3000 |
| `HOST_API` | API host URL | - |

## 🧪 Testing

```bash
# Run unit tests
yarn test

# Run e2e tests
yarn test:e2e

# Run tests with coverage
yarn test:cov
```

## 📝 Code Quality

The project uses ESLint and Prettier for code quality:

```bash
# Run linting
yarn lint

# Format code
yarn format
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is private and unlicensed.

## 👥 Authors

- Financial Management System Team

---

For more information, please contact the development team.
