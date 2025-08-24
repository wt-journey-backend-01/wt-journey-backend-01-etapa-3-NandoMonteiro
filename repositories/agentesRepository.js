const db = require("../db/db.js");
const { AppError } = require("../utils/errorHandler.js");

async function findById(id) {
  try {
    const agente = await db("agentes").where({ id }).first();
    if (!agente) {
      throw new AppError("Agente não encontrado", [], 404);
    }
    return agente;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Erro ao buscar agente", 500, [error.message]);
  }
}

async function findAll(filters = {}) {
  try {
    const query = db("agentes");

    if (filters.cargo) {
      query.where("cargo", "ilike", `%${filters.cargo}%`);
    }
    if (filters.dataInicio) {
      query.where("dataDeIncorporacao", ">=", filters.dataInicio);
    }
    if (filters.dataFim) {
      query.where("dataDeIncorporacao", "<=", filters.dataFim);
    }
    if (filters.orderBy) {
      query.orderBy(filters.orderBy, filters.order || "asc");
    }

    const agentes = await query.select("*");
    return agentes;
  } catch (error) {
    throw new AppError("Erro ao buscar agentes", 500, [error.message]);
  }
}

async function create(data) {
  try {
    const [agente] = await db("agentes").insert(data).returning("*");
    return agente;  
  } catch (error) {
    throw new AppError("Erro ao criar agente", 500, [error.message]);
  }
}

async function update(id, data) {
  try {
    const [agente] = await db("agentes").where({ id }).update(data).returning("*");
    if (!agente) {
      throw new AppError("Agente não encontrado", [], 404);
    }
    return agente;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Erro ao atualizar agente", 500, [error.message]);
  }
}

async function remove(id) {
  try {
    const deleted = await db("agentes").where({ id }).del();
    return deleted > 0;
    
  } catch (error) {
    throw new AppError("Erro ao deletar agente", 500, [error.message]);
  }
}


module.exports = {
  findById,
  findAll,
  create,
  update,
  remove
};