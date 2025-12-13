import { db } from '../config/database.js';
export class BaseRepository {
    db;
    tableName;
    constructor(tableName) {
        this.db = db;
        this.tableName = tableName;
    }
    async findAll(limit = 100, offset = 0) {
        return this.db(this.tableName).select('*').limit(limit).offset(offset);
    }
    async findById(id) {
        const result = await this.db(this.tableName).where({ id }).first();
        return result || null;
    }
    async create(data) {
        const [result] = await this.db(this.tableName).insert(data).returning('*');
        return result;
    }
    async update(id, data) {
        const [result] = await this.db(this.tableName)
            .where({ id })
            .update(data)
            .returning('*');
        return result || null;
    }
    async delete(id) {
        const deleted = await this.db(this.tableName).where({ id }).delete();
        return deleted > 0;
    }
    query() {
        return this.db(this.tableName);
    }
}
//# sourceMappingURL=base.repository.js.map