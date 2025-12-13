export async function up(knex) {
    await knex.schema.createTable("auth_nonces", (table) => {
        table.string("wallet_address").primary();
        table.string("nonce").notNullable();
        table.timestamp("expires_at").notNullable();
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.index("expires_at");
    });
    await knex.schema.createTable("auth_sessions", (table) => {
        table.increments("id").primary();
        table.string("wallet_address").notNullable();
        table.string("token").notNullable().unique();
        table.timestamp("expires_at").notNullable();
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.index("wallet_address");
        table.index("token");
        table.index("expires_at");
    });
}
export async function down(knex) {
    await knex.schema.dropTableIfExists("auth_sessions");
    await knex.schema.dropTableIfExists("auth_nonces");
}
//# sourceMappingURL=005_create_auth_tables.js.map