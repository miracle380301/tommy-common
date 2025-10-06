import { Model, ModelCtor, Sequelize, Op, Order } from 'sequelize';
import { DatabaseAdapter } from './DatabaseAdapter';
import { BaseEntity, FindOptions, ProviderInfo, DatabaseConfig, DatabaseType } from '../types';

/**
 * Sequelize Database Adapter
 * Supports PostgreSQL, MySQL, and SQLite through Sequelize ORM
 */
export class SequelizeAdapter<T extends BaseEntity> extends DatabaseAdapter<T> {
  protected model: ModelCtor<Model>;
  protected sequelize: Sequelize;
  protected dbType: DatabaseType;

  constructor(model: ModelCtor<Model>, tableName: string, dbType: DatabaseType = 'postgresql') {
    super(tableName);
    this.model = model;
    this.sequelize = model.sequelize!;
    this.dbType = dbType;
  }

  /**
   * Transform Sequelize instance to plain object
   */
  private transform(instance: Model | null): T | null {
    if (!instance) return null;
    return instance.toJSON() as T;
  }

  /**
   * Transform array of instances
   */
  private transformArray(instances: Model[]): T[] {
    return instances.map(instance => this.transform(instance)).filter(Boolean) as T[];
  }

  /**
   * Build Sequelize order from orderBy string
   */
  private buildOrder(orderBy?: string): Order | undefined {
    if (!orderBy) return undefined;

    // orderBy format: "createdAt" or "createdAt DESC"
    const [field, direction] = orderBy.split(' ');
    return [[field, direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']];
  }

  /**
   * Convert simple where to Sequelize where with operators
   */
  private buildWhere(where?: Record<string, any>): any {
    if (!where || Object.keys(where).length === 0) return {};

    // For simple equality, Sequelize handles it automatically
    // For complex queries, you can extend this method
    return where;
  }

  /**
   * Find all records
   */
  async findAll(options: FindOptions = {}): Promise<T[]> {
    const { where, limit, offset, orderBy, include } = options;

    const instances = await this.model.findAll({
      where: this.buildWhere(where),
      limit,
      offset,
      order: this.buildOrder(orderBy),
      include: include || []
    });

    return this.transformArray(instances);
  }

  /**
   * Find one record by ID
   */
  async findById(id: number | string): Promise<T | null> {
    const instance = await this.model.findByPk(id);
    return this.transform(instance);
  }

  /**
   * Find one record by conditions
   */
  async findOne(where: Record<string, any>): Promise<T | null> {
    const instance = await this.model.findOne({
      where: this.buildWhere(where)
    });
    return this.transform(instance);
  }

  /**
   * Create a new record
   */
  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const instance = await this.model.create(data as any);
    return this.transform(instance) as T;
  }

  /**
   * Update a record by ID
   */
  async update(
    id: number | string,
    data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<T | null> {
    const instance = await this.model.findByPk(id);

    if (!instance) {
      return null;
    }

    await instance.update(data as any);
    return this.transform(instance);
  }

  /**
   * Delete a record by ID
   */
  async delete(id: number | string): Promise<boolean> {
    const result = await this.model.destroy({
      where: { id } as any
    });
    return result > 0;
  }

  /**
   * Count records
   */
  async count(where?: Record<string, any>): Promise<number> {
    return await this.model.count({
      where: this.buildWhere(where)
    });
  }

  /**
   * Transaction support
   */
  async transaction<R>(callback: (transaction: any) => Promise<R>): Promise<R> {
    return await this.sequelize.transaction(async (t) => {
      return await callback(t);
    });
  }

  /**
   * Get provider information
   */
  getProviderInfo(): ProviderInfo {
    const dialect = this.sequelize.getDialect();
    return {
      name: `Sequelize (${dialect})`,
      type: this.dbType,
      version: (Sequelize as any).version || 'unknown'
    };
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    await this.sequelize.close();
  }

  /**
   * Static method to create a Sequelize connection
   */
  static createConnection(config: DatabaseConfig): Sequelize {
    const dialect = config.type === 'sqlite' ? 'sqlite' :
                    config.type === 'mysql' ? 'mysql' :
                    config.type === 'postgresql' ? 'postgres' : 'postgres';

    if (config.type === 'sqlite') {
      return new Sequelize({
        dialect: 'sqlite',
        storage: config.filename || './database.sqlite',
        logging: config.logging ? console.log : false,
        pool: {
          max: config.poolSize || 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      });
    }

    // PostgreSQL/MySQL: URI 방식 또는 개별 설정 방식 지원
    if (config.uri) {
      return new Sequelize(config.uri, {
        dialect,
        logging: config.logging ? console.log : false,
        pool: {
          max: config.poolSize || 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        },
        dialectOptions: {
          ssl: config.uri.includes('sslmode=require') ? {
            require: true,
            rejectUnauthorized: false
          } : undefined
        }
      });
    }

    return new Sequelize(
      config.database || 'test',
      config.username || 'root',
      config.password || '',
      {
        host: config.host || 'localhost',
        port: config.port || (config.type === 'mysql' ? 3306 : 5432),
        dialect,
        logging: config.logging ? console.log : false,
        pool: {
          max: config.poolSize || 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      }
    );
  }
}
