const db = require("../db/db.js");
const { AppError } = require("../utils/errorHandler.js");

async function findAll() {
  try {
    const casos = await db("casos").select("*");
    return casos;
  } catch (error) {
    throw new AppError(500, "Erro ao buscar casos", [error.message]);
  }
}

async function findById(id) {
  try {
    const caso = await db("casos").where({ id }).first();
    if (!caso) {
      throw new AppError("Caso não encontrado", [], 404);
    }
    return caso;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, "Erro ao buscar caso por ID", [error.message]);
  }
}

async function create(data) {
  try {
    const [caso] = await db("casos").insert(data).returning("*");
    return caso;  
  } catch (error) {
    throw new AppError("Erro ao criar caso", 500, [error.message]);
  }
}

async function update(id, data) {
  try {
    const [caso] = await db("casos").where({ id }).update(data).returning("*");
    if (!caso) {
      throw new AppError("Caso não encontrado", [], 404);
    }
    return caso;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Erro ao atualizar caso", [error.message]);
  }
}

async function remove(id) {
  try {
    const deleted = await db("casos").where({ id }).del();
    return deleted > 0;
    
  } catch (error) {
    throw new AppError(500, "Erro ao deletar caso", [error.message]);
  }
}


module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
};