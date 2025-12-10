import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('swaps', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('offer_id').notNullable();
    table.string('proposal_id').nullable();
    table.string('buyer').notNullable();
    table.string('seller').notNullable();
    table.string('token_a_mint').notNullable();
    table.string('token_a_amount').notNullable();
    table.string('token_b_mint').notNullable();
    table.string('token_b_amount').notNullable();
    table.string('signature').notNullable().unique();
    table.bigInteger('slot').notNullable();
    table.timestamp('executed_at').defaultTo(knex.fn.now());

    table.index(['buyer']);
    table.index(['seller']);
    table.index(['offer_id']);
    table.index(['executed_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('swaps');
}




