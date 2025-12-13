export async function up(knex) {
    await knex.schema.createTable('indexer_state', (table) => {
        table.string('key').primary();
        table.bigInteger('last_processed_slot').notNullable();
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
    // Initialize the indexer state
    await knex('indexer_state').insert({
        key: 'fair_swap',
        last_processed_slot: 0,
    });
}
export async function down(knex) {
    await knex.schema.dropTable('indexer_state');
}
//# sourceMappingURL=004_create_indexer_state_table.js.map