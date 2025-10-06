import { Model, Document, Connection } from 'mongoose';
import { DatabaseAdapter } from './DatabaseAdapter';
import { BaseEntity, FindOptions, ProviderInfo, DatabaseConfig } from '../types';
import mongoose from 'mongoose';

/**
 * Mongoose (MongoDB) Database Adapter
 * Handles MongoDB operations with _id to id transformation
 */
export class MongooseAdapter<T extends BaseEntity> extends DatabaseAdapter<T> {
  protected model: Model<any>;

  constructor(model: Model<any>, tableName: string) {
    super(tableName);
    this.model = model;
  }

  /**
   * Transform MongoDB document to plain object with id
   */
  private transform(doc: Document | null): T | null {
    if (!doc) return null;

    const obj = doc.toObject ? doc.toObject() : doc;
    return {
      ...obj,
      id: obj._id?.toString(),
      _id: undefined
    } as T;
  }

  /**
   * Transform array of documents
   */
  private transformArray(docs: Document[]): T[] {
    return docs.map(doc => this.transform(doc)).filter(Boolean) as T[];
  }

  /**
   * Find all records
   */
  async findAll(options: FindOptions = {}): Promise<T[]> {
    const { where = {}, limit, offset, orderBy, populate } = options;

    let query = this.model.find(where);

    if (orderBy) {
      // orderBy format: "createdAt" or "createdAt DESC"
      const [field, direction] = orderBy.split(' ');
      const sort = direction?.toUpperCase() === 'DESC' ? -1 : 1;
      query = query.sort({ [field]: sort });
    }

    if (limit) {
      query = query.limit(limit);
    }

    if (offset) {
      query = query.skip(offset);
    }

    if (populate && populate.length > 0) {
      populate.forEach(field => {
        query = query.populate(field);
      });
    }

    const docs = await query.exec();
    return this.transformArray(docs);
  }

  /**
   * Find one record by ID
   */
  async findById(id: number | string): Promise<T | null> {
    const doc = await this.model.findById(id).exec();
    return this.transform(doc);
  }

  /**
   * Find one record by conditions
   */
  async findOne(where: Record<string, any>): Promise<T | null> {
    const doc = await this.model.findOne(where).exec();
    return this.transform(doc);
  }

  /**
   * Create a new record
   */
  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const doc = await this.model.create(data);
    return this.transform(doc) as T;
  }

  /**
   * Update a record by ID
   */
  async update(
    id: number | string,
    data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<T | null> {
    const doc = await this.model.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).exec();

    return this.transform(doc);
  }

  /**
   * Delete a record by ID
   */
  async delete(id: number | string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return result !== null;
  }

  /**
   * Count records
   */
  async count(where?: Record<string, any>): Promise<number> {
    return await this.model.countDocuments(where || {}).exec();
  }

  /**
   * Get provider information
   */
  getProviderInfo(): ProviderInfo {
    return {
      name: 'MongoDB (Mongoose)',
      type: 'mongodb',
      version: mongoose.version
    };
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    await mongoose.connection.close();
  }

  /**
   * Static method to create a MongoDB connection
   */
  static async createConnection(config: DatabaseConfig): Promise<Connection> {
    const uri = config.uri ||
      `mongodb://${config.host || 'localhost'}:${config.port || 27017}/${config.database || 'test'}`;

    await mongoose.connect(uri, {
      maxPoolSize: config.poolSize || 10,
      serverSelectionTimeoutMS: 5000,
    });

    return mongoose.connection;
  }
}
