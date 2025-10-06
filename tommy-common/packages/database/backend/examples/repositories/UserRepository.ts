import Database from 'better-sqlite3';
import { Sequelize } from 'sequelize';
import { Connection } from 'mongoose';
import { DatabaseAdapter, SQLiteAdapter, MongooseAdapter, SequelizeAdapter } from '../../src/adapters';
import { User, USER_TABLE_SQL, createUserMongooseModel, createUserSequelizeModel } from '../models/User';
import { DatabaseType, ProviderInfo } from '../../src/types';

/**
 * User Repository
 * Demonstrates how to use database adapters with custom logic
 */
export class UserRepository {
  private adapter: DatabaseAdapter<User>;

  constructor(connection: Database.Database | Sequelize | Connection, dbType: DatabaseType) {
    if (dbType === 'sqlite') {
      this.adapter = new SQLiteAdapter<User>(connection as Database.Database, 'users');
      this.initializeSQLiteTable(connection as Database.Database);
    } else if (dbType === 'mongodb') {
      // MongoDB Mongoose 모델 생성
      const userModel = createUserMongooseModel(connection as Connection);
      this.adapter = new MongooseAdapter<User>(userModel, 'users');
      // MongoDB는 첫 문서 삽입 시 자동으로 컬렉션 생성
      // 인덱스는 스키마에서 이미 정의됨
      this.initializeMongoDBIndexes(userModel);
    } else if (dbType === 'postgresql' || dbType === 'mysql') {
      // PostgreSQL/MySQL Sequelize 모델 생성
      const userModel = createUserSequelizeModel(connection as Sequelize);
      this.adapter = new SequelizeAdapter<User>(userModel, 'users', dbType);
      // Sequelize sync로 테이블 생성
      this.initializeSequelizeTable(userModel);
    } else {
      throw new Error(
        `Database type ${dbType} not supported.`
      );
    }
  }

  /**
   * Initialize SQLite table
   */
  private initializeSQLiteTable(db: Database.Database): void {
    db.exec(USER_TABLE_SQL);
  }

  /**
   * Initialize MongoDB indexes (스키마에 정의된 인덱스를 실제로 생성)
   */
  private async initializeMongoDBIndexes(model: any): Promise<void> {
    try {
      await model.createIndexes();
      console.log('✅ MongoDB indexes created for users collection');
    } catch (error) {
      console.warn('⚠️  Failed to create MongoDB indexes:', error);
    }
  }

  /**
   * Initialize Sequelize table (PostgreSQL/MySQL)
   */
  private async initializeSequelizeTable(model: any): Promise<void> {
    try {
      await model.sync({ alter: false });  // 테이블이 없으면 생성, 있으면 유지
      console.log('✅ Sequelize table synced for users');
    } catch (error) {
      console.warn('⚠️  Failed to sync Sequelize table:', error);
    }
  }

  /**
   * Find all users
   */
  async findAll(options?: any): Promise<User[]> {
    return this.adapter.findAll(options);
  }

  /**
   * Find user by ID
   */
  async findById(id: number | string): Promise<User | null> {
    return this.adapter.findById(id);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.adapter.findOne({ email });
  }

  /**
   * Find users by name (search)
   */
  async findByName(name: string): Promise<User[]> {
    // For SQLite, we need to use raw query for LIKE
    // This is a limitation of the generic adapter pattern
    // You could implement this in a SQLite-specific way
    const allUsers = await this.adapter.findAll();
    return allUsers.filter(user =>
      user.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  /**
   * Create a new user
   */
  async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    return this.adapter.create(data);
  }

  /**
   * Update a user
   */
  async update(
    id: number | string,
    data: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<User | null> {
    return this.adapter.update(id, data);
  }

  /**
   * Delete a user
   */
  async delete(id: number | string): Promise<boolean> {
    return this.adapter.delete(id);
  }

  /**
   * Count users
   */
  async count(where?: Record<string, any>): Promise<number> {
    return this.adapter.count(where);
  }

  /**
   * Get provider information
   */
  getProviderInfo(): ProviderInfo {
    return this.adapter.getProviderInfo();
  }
}
