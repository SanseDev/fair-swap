import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('offers', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('offer_id').notNullable();
    table.string('seller').notNullable();
    table.string('token_mint_a').notNullable();
    table.string('token_amount_a').notNullable();
    table.string('token_mint_b').notNullable();
    table.string('token_amount_b').notNullable();
    table.boolean('allow_alternatives').defaultTo(false);
    table.enum('status', ['active', 'cancelled', 'completed']).defaultTo('active');
    table.string('signature').notNullable().unique();
    table.bigInteger('slot').notNullable();
    table.timestamps(true, true);

    table.index(['seller']);
    table.index(['status']);
    table.index(['token_mint_a']);
    table.index(['token_mint_b']);
    table.unique(['seller', 'offer_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('offers');
}




