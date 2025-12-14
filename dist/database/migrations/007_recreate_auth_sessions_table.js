export async function up(knex) {
    await knex.schema.createTable("auth_sessions", (table) => {
        table.increments("id").primary();
        table.string("wallet_address").notNullable();
        table.string("session_token").notNullable().unique();
        table.timestamp("expires_at").notNullable();
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.index("wallet_address");
        table.index("session_token");
        table.index("expires_at");
    });
}
export async function down(knex) {
    await knex.schema.dropTableIfExists("auth_sessions");
}
//# sourceMappingURL=007_recreate_auth_sessions_table.js.map