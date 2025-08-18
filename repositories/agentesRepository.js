const db = require('../db/db.js');
const { AppError } = require('../utils/errorHandler.js');

async function findById(id) {
  try {
    const agente = await db('agentes').where({ id }).first();
    if (!agente) {
      throw new AppError('Agente não encontrado', [], 404);
    }
    return agente;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, 'Erro ao buscar agente', [error.message]);
  }
}

async function findAll() {
  try {
    const agentes = await db('agentes').select('*');
    return agentes;
  } catch (error) {
    throw new AppError(500, 'Erro ao buscar agentes', [error.message]);
  }
}

async function create(data) {
  try {
    const [agente] = await db('agentes').insert(data).returning('*');
    return agente;  
  } catch (error) {
    throw new AppError(500, 'Erro ao criar agente', [error.message]);
  }
}

async function update(id, data) {
  try {
    const [agente] = await db('agentes').where({ id }).update(data).returning('*');
    if (!agente) {
      throw new AppError('Agente não encontrado', [], 404);
    }
    return agente;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, 'Erro ao atualizar agente', [error.message]);
  }
}

async function remove(id) {
  try {
    const deleted = await db('agentes').where({ id }).del();
    return deleted > 0;
    
  } catch (error) {
    throw new AppError(500, 'Erro ao deletar agente', [error.message]);
  }
}


module.exports = {
  findById,
  findAll,
  create,
  update,
  remove
};