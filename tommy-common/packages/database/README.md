# Database Infrastructure

범용 데이터베이스 인프라 레이어 - Repository 패턴과 CRUD 기능 제공

## Features

- 🗄️ **SQLite Database**: Lightweight, file-based database with zero configuration
- 🔄 **Repository Pattern**: Clean abstraction layer for database operations
- 📦 **Generic CRUD Operations**: Reusable base repository with common operations
- 🏗️ **Infrastructure Only**: Domain-agnostic database layer
- 📝 **TypeScript**: Full type safety
- 📚 **Working Examples**: Complete example implementation included

## Installation

```bash
npm install @miracle380301/database-service better-sqlite3
```

## Package Structure

```
@miracle380301/database-service/
├── src/                    # Infrastructure code (exported)
│   ├── core/
│   │   ├── Database.ts           # Database connection management
│   │   └── BaseRepository.ts     # Generic CRUD repository
│   ├── config/
│   │   └── database.config.ts    # Configuration utilities
│   └── index.ts                  # Main exports
│
└── examples/               # Domain-specific examples (not exported)
    ├── models/
    │   └── User.ts              # Example User model
    ├── repositories/
    │   └── UserRepository.ts    # Example User repository
    ├── routes/
    │   └── user.routes.ts       # Example REST routes
    ├── index.ts                 # Example server setup
    └── server.ts                # Example standalone server
```

## Quick Start

### 1. Try the Example Server

```bash
# Clone and navigate to backend directory
cd packages/database/backend

# Install dependencies
npm install

# Start example server
npm run dev
```

The example server will start on `http://localhost:3001` with User CRUD endpoints.

### 2. Use in Your Application

```typescript
import { DatabaseConnection, BaseRepository, createDatabaseConfig } from '@miracle380301/database-service';
import Database from 'better-sqlite3';

// 1. Define your model
interface Product {
  id?: number;
  name: string;
  price: number;
  stock: number;
  createdAt?: string;
  updatedAt?: string;
}

// 2. Create your repository
class ProductRepository extends BaseRepository<Product> {
  constructor(db: Database.Database) {
    super(db, 'products');
    this.initializeTable();
  }

  private initializeTable() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        stock INTEGER NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `);
  }

  // Add custom methods
  findByPriceRange(min: number, max: number): Product[] {
    const stmt = this.db.prepare(
      `SELECT * FROM ${this.tableName} WHERE price BETWEEN ? AND ?`
    );
    return stmt.all(min, max) as Product[];
  }
}

// 3. Connect and use
const dbConfig = createDatabaseConfig('./myapp.sqlite');
const dbConnection = new DatabaseConnection(dbConfig);
const db = dbConnection.connect();

const productRepo = new ProductRepository(db);

// Use the repository
const product = productRepo.create({
  name: 'Laptop',
  price: 999.99,
  stock: 10
});

const allProducts = productRepo.findAll();
const expensiveProducts = productRepo.findByPriceRange(500, 2000);
```

## Example API Endpoints

The example server (`npm run dev`) provides User CRUD operations:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user by ID |
| GET | `/api/users/email/:email` | Get user by email |
| GET | `/api/users/search/name?q=name` | Search users by name |
| POST | `/api/users` | Create new user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |
| GET | `/api/users/stats/count` | Get total user count |
| GET | `/health` | Health check |

### Example cURL Requests

```bash
# Create a user
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","age":30}'

# Get all users
curl http://localhost:3001/api/users

# Get user by ID
curl http://localhost:3001/api/users/1

# Update user
curl -X PUT http://localhost:3001/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","age":31}'

# Delete user
curl -X DELETE http://localhost:3001/api/users/1

# Health check
curl http://localhost:3001/health
```

## Architecture

### Core Concepts

This package provides **infrastructure only**. It exports:

1. **DatabaseConnection** - Manages SQLite connection with proper configuration
2. **BaseRepository<T>** - Generic CRUD operations for any entity
3. **Configuration utilities** - Helper functions for database setup

You define your own:
- Models (interfaces)
- Repositories (extending BaseRepository)
- Routes (Express routers)
- Business logic

## Available Repository Methods

The `BaseRepository` provides these methods out of the box:

- `findAll(options?)` - Get all records with optional filtering, ordering, pagination
- `findById(id)` - Get single record by ID
- `findOne(where)` - Get single record by conditions
- `create(data)` - Create new record
- `update(id, data)` - Update existing record
- `delete(id)` - Delete record
- `count(where?)` - Count records

## Environment Variables

For the example server (backend/.env):

```env
# Database Configuration
DB_FILENAME=./database.sqlite  # SQLite database file path
DB_VERBOSE=false               # Enable SQL query logging

# Server Configuration
PORT=3001                      # Server port
CORS_ORIGIN=*                  # CORS origin (use specific domain in production)
```

## Exported API

### Types

```typescript
import { BaseEntity, FindOptions, DatabaseConfig } from '@miracle380301/database-service';

// Base entity interface - all models should extend this
interface BaseEntity {
  id?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Find options for queries
interface FindOptions {
  where?: Record<string, any>;
  limit?: number;
  offset?: number;
  orderBy?: string;
}

// Database configuration
interface DatabaseConfig {
  filename: string;
  verbose?: boolean;
}
```

### Classes

```typescript
// Database connection
class DatabaseConnection {
  constructor(config: DatabaseConfig);
  connect(): Database.Database;
  close(): void;
  getDatabase(): Database.Database | null;
}

// Generic repository
abstract class BaseRepository<T extends BaseEntity> {
  protected db: Database.Database;
  protected tableName: string;

  findAll(options?: FindOptions): T[];
  findById(id: number): T | undefined;
  findOne(where: Record<string, any>): T | undefined;
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): T;
  update(id: number, data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>): T | undefined;
  delete(id: number): boolean;
  count(where?: Record<string, any>): number;
}
```

### Utility Functions

```typescript
function createDatabaseConfig(filename: string, verbose?: boolean): DatabaseConfig;
```

## Testing

```bash
# Start the example server
npm run dev

# Test with curl
curl http://localhost:3001/api/users
curl http://localhost:3001/health

# Or use Postman/Insomnia/Thunder Client
```

## License

MIT
