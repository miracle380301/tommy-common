import Database from 'better-sqlite3';

export interface BaseEntity {
  id?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FindOptions {
  where?: Record<string, any>;
  orderBy?: string;
  limit?: number;
  offset?: number;
}

export abstract class BaseRepository<T extends BaseEntity> {
  protected db: Database.Database;
  protected tableName: string;

  constructor(db: Database.Database, tableName: string) {
    this.db = db;
    this.tableName = tableName;
  }

  /**
   * 모든 레코드 조회
   */
  findAll(options?: FindOptions): T[] {
    let query = `SELECT * FROM ${this.tableName}`;
    const params: any[] = [];

    if (options?.where) {
      const conditions = Object.keys(options.where).map(key => {
        params.push(options.where![key]);
        return `${key} = ?`;
      });
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    if (options?.orderBy) {
      query += ` ORDER BY ${options.orderBy}`;
    }

    if (options?.limit) {
      query += ` LIMIT ${options.limit}`;
    }

    if (options?.offset) {
      query += ` OFFSET ${options.offset}`;
    }

    const stmt = this.db.prepare(query);
    return stmt.all(...params) as T[];
  }

  /**
   * ID로 단일 레코드 조회
   */
  findById(id: number): T | undefined {
    const stmt = this.db.prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`);
    return stmt.get(id) as T | undefined;
  }

  /**
   * 조건에 맞는 단일 레코드 조회
   */
  findOne(where: Record<string, any>): T | undefined {
    const conditions = Object.keys(where).map(key => `${key} = ?`);
    const values = Object.values(where);

    const stmt = this.db.prepare(
      `SELECT * FROM ${this.tableName} WHERE ${conditions.join(' AND ')} LIMIT 1`
    );
    return stmt.get(...values) as T | undefined;
  }

  /**
   * 레코드 생성
   */
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): T {
    const now = new Date().toISOString();
    const dataWithTimestamps = {
      ...data,
      createdAt: now,
      updatedAt: now
    };

    const columns = Object.keys(dataWithTimestamps);
    const placeholders = columns.map(() => '?').join(', ');
    const values = Object.values(dataWithTimestamps);

    const stmt = this.db.prepare(
      `INSERT INTO ${this.tableName} (${columns.join(', ')}) VALUES (${placeholders})`
    );

    const result = stmt.run(...values);
    return this.findById(result.lastInsertRowid as number)!;
  }

  /**
   * 레코드 업데이트
   */
  update(id: number, data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>): T | undefined {
    const dataWithTimestamp = {
      ...data,
      updatedAt: new Date().toISOString()
    };

    const columns = Object.keys(dataWithTimestamp).map(key => `${key} = ?`);
    const values = [...Object.values(dataWithTimestamp), id];

    const stmt = this.db.prepare(
      `UPDATE ${this.tableName} SET ${columns.join(', ')} WHERE id = ?`
    );

    stmt.run(...values);
    return this.findById(id);
  }

  /**
   * 레코드 삭제
   */
  delete(id: number): boolean {
    const stmt = this.db.prepare(`DELETE FROM ${this.tableName} WHERE id = ?`);
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * 레코드 개수 조회
   */
  count(where?: Record<string, any>): number {
    let query = `SELECT COUNT(*) as count FROM ${this.tableName}`;
    const params: any[] = [];

    if (where) {
      const conditions = Object.keys(where).map(key => {
        params.push(where[key]);
        return `${key} = ?`;
      });
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    const stmt = this.db.prepare(query);
    const result = stmt.get(...params) as { count: number };
    return result.count;
  }
}
