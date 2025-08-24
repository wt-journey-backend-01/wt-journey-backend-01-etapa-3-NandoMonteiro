const db = require("../db/db.js");
const { AppError } = require("../utils/errorHandler.js");

async function findAll(filters = {}) {
  try {
    const query = db("casos");

    if (filters.status) {
      query.where("status", filters.status);
    }
    if (filters.agente_id) {
      query.where("agente_id", filters.agente_id);
    }
    if (filters.search) {
      const searchTerm = `%${filters.search.toLowerCase()}%`;
      query.where((builder) => {
        builder.where("titulo", "ilike", searchTerm)
               .orWhere("descricao", "ilike", searchTerm);
      });
    }
    if (filters.orderBy) {
      query.orderBy(filters.orderBy, filters.order || "asc");
    }

    const casos = await query.select("*");
    return casos;
  } catch (error) {
    throw new AppError("Erro ao buscar casos", 500, [error.message]);
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
    throw new AppError("Erro ao buscar caso por ID", 500, [error.message]);
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
    throw new AppError("Erro ao atualizar caso", 500, [error.message]);
  }
}

async function remove(id) {
  try {
    const deleted = await db("casos").where({ id }).del();
    return deleted > 0;
    
  } catch (error) {
    throw new AppError("Erro ao deletar caso", 500, [error.message]);
  }
}


module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
};