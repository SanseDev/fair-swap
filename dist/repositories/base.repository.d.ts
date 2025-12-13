import { Knex } from 'knex';
export declare abstract class BaseRepository<T> {
    protected db: Knex;
    protected tableName: string;
    constructor(tableName: string);
    findAll(limit?: number, offset?: number): Promise<T[]>;
    findById(id: string): Promise<T | null>;
    create(data: Partial<T>): Promise<T>;
    update(id: string, data: Partial<T>): Promise<T | null>;
    delete(id: string): Promise<boolean>;
    protected query(): Knex.QueryBuilder<any, {
        _base: any;
        _hasSelection: false;
        _keys: never;
        _aliases: {};
        _single: false;
        _intersectProps: {};
        _unionProps: never;
    }[]>;
}
//# sourceMappingURL=base.repository.d.ts.map