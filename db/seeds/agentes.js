/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('agentes').del();
  await knex('agentes').insert([
      { nome: 'Rommel Carneiro',
        dataDeIncorporacao: '1992-10-04',
        cargo: 'delegado'
      },
      { nome: 'Ana Paula Silva',
        dataDeIncorporacao: '1995-05-15',
        cargo: 'inspetor'
      },
      { nome: 'Carlos Alberto Souza',
        dataDeIncorporacao: '2000-03-20',
        cargo: 'investigador'
      },
    ]);
};