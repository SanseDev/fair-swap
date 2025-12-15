import { Knex } from 'knex';
import { getDb } from '../db';

export abstract class BaseRepository<T> {
  protected db: Knex;
  protected tableName: string;

  constructor(tableName: string) {
    this.db = getDb();
    this.tableName = tableName;
  }

  async findAll(limit = 100, offset = 0): Promise<T[]> {
    return this.db(this.tableName).select('*').limit(limit).offset(offset);
  }

  async findById(id: string): Promise<T | null> {
    const result = await this.db(this.tableName).where({ id }).first();
    return result || null;
  }

  async create(data: Partial<T>): Promise<T> {
    const [result] = await this.db(this.tableName).insert(data).returning('*');
    return result;
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const [result] = await this.db(this.tableName)
      .where({ id })
      .update(data)
      .returning('*');
    return result || null;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.db(this.tableName).where({ id }).delete();
    return deleted > 0;
  }

  protected query() {
    return this.db(this.tableName);
  }
}




