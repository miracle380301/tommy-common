import { BaseEntity, FindOptions, ProviderInfo } from '../types';

/**
 * Abstract Database Adapter
 * All database adapters must extend this class
 */
export abstract class DatabaseAdapter<T extends BaseEntity> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  /**
   * Find all records
   */
  abstract findAll(options?: FindOptions): Promise<T[]>;

  /**
   * Find one record by ID
   */
  abstract findById(id: number | string): Promise<T | null>;

  /**
   * Find one record by conditions
   */
  abstract findOne(where: Record<string, any>): Promise<T | null>;

  /**
   * Create a new record
   */
  abstract create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;

  /**
   * Update a record by ID
   */
  abstract update(
    id: number | string,
    data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<T | null>;

  /**
   * Delete a record by ID
   */
  abstract delete(id: number | string): Promise<boolean>;

  /**
   * Count records
   */
  abstract count(where?: Record<string, any>): Promise<number>;

  /**
   * Get provider information
   */
  abstract getProviderInfo(): ProviderInfo;

  /**
   * Close database connection
   */
  abstract close(): Promise<void>;
}
