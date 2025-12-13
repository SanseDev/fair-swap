export async function up(knex) {
    await knex.schema.createTable('proposals', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.string('proposal_id').notNullable();
        table.string('buyer').notNullable();
        table.string('offer_id').notNullable();
        table.string('proposed_mint').notNullable();
        table.string('proposed_amount').notNullable();
        table.enum('status', ['pending', 'accepted', 'withdrawn']).defaultTo('pending');
        table.string('signature').notNullable().unique();
        table.bigInteger('slot').notNullable();
        table.timestamps(true, true);
        table.index(['buyer']);
        table.index(['offer_id']);
        table.index(['status']);
        table.index(['proposed_mint']);
    });
}
export async function down(knex) {
    await knex.schema.dropTable('proposals');
}
//# sourceMappingURL=002_create_proposals_table.js.map