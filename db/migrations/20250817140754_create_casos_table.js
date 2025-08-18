/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable('casos', (table) => {
    table.increments('id').primary();
    table
        .integer('agente_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('agentes')
        .onDelete('cascade')
        .onUpdate('cascade');
    table.string('titulo').notNullable();
    table.text('descricao').notNullable();
    table.enu('status', ['aberto', 'em andamento', 'fechado']).notNullable().defaultTo('aberto');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.dropTableIfExists('casos');
};
