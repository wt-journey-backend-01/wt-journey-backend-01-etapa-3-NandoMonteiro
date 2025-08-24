const casosRepository = require("../repositories/casosRepository");
const agentesRepository = require("../repositories/agentesRepository");
const { AppError } = require("../utils/errorHandler"); 

const getAllCasos = async (req, res, next) => {
  try {
    const { status, agente_id, search, orderBy, order } = req.query;
    
    const casos = await casosRepository.findAll({
      status,
      agente_id,
      search,
      orderBy,
      order,
    });

    const casosComAgente = await Promise.all(casos.map(async (caso) => {
      try {
        const agente = await agentesRepository.findById(caso.agente_id);
        return { ...caso, agente };
      } catch (error) {
        // Se o agente não for encontrado, retorna o caso sem o agente ou com um agente nulo
        return { ...caso, agente: null }; 
      }
    }));

    res.status(200).json(casosComAgente);
  } catch (error) {
    next(error);
  }
};

const getCasoById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const caso = await casosRepository.findById(id); // findById já lança 404 se não encontrar

    const agente = await agentesRepository.findById(caso.agente_id);

    res.status(200).json({ ...caso, agente });
  } catch (error) {
    next(error);
  }
};

const createCaso = async (req, res, next) => {
  try {
    const { titulo, descricao, status, agente_id } = req.body;

    if (!titulo || typeof titulo !== "string" || !descricao || typeof descricao !== "string" || !status || !agente_id) {
      throw new AppError("Todos os campos (titulo, descricao, status, agente_id) são obrigatórios e devem ser strings.", 400);
    }
    const statusValidos = ["aberto", "solucionado"];
    if (!statusValidos.includes(status)) {
      throw new AppError("O status do caso deve ser \'aberto\' ou \'solucionado\'.", 400);
    }
    
    await agentesRepository.findById(agente_id);

    const newCase = { titulo, descricao, status, agente_id };
    const createdCaso = await casosRepository.create(newCase);

    res.status(201).json(createdCaso);
  } catch (error) {
    next(error);
  }
};

const updateCaso = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { titulo, descricao, status, agente_id } = req.body;

    if (req.body.id && req.body.id !== id) {
      throw new AppError("O \'id\' do corpo da requisição não pode ser diferente do \'id\' da URL.", 400);
    }

    if (!titulo || typeof titulo !== "string" || !descricao || typeof descricao !== "string" || !status || !agente_id) {
      throw new AppError("Para uma requisição PUT, todos os campos (titulo, descricao, status, agente_id) são obrigatórios e devem ser strings.", 400);
    }
    const statusValidos = ["aberto", "solucionado"];
    if (!statusValidos.includes(status)) {
      throw new AppError("O status do caso deve ser \'aberto\' ou \'solucionado\'.", 400);
    }

    await agentesRepository.findById(agente_id);
    
    const updatedCase = await casosRepository.update(id, { titulo, descricao, status, agente_id });

    res.status(200).json(updatedCase);
  } catch (error) {
    next(error);
  }
};

const patchCaso = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.id) {
      throw new AppError("O campo \'id\' não pode ser alterado.", 400);
    }

    if (Object.keys(updates).length === 0) {
      throw new AppError("O corpo da requisição não pode estar vazio para uma operação PATCH.", 400);
    }
    
    if (updates.titulo && typeof updates.titulo !== "string") {
      throw new AppError("O título deve ser uma string.", 400);
    }
    if (updates.descricao && typeof updates.descricao !== "string") {
      throw new AppError("A descrição deve ser uma string.", 400);
    }
    if (updates.status && !["aberto", "solucionado"].includes(updates.status)) {
      throw new AppError("O status do caso deve ser \'aberto\' ou \'solucionado\'.", 400);
    }
    if (updates.agente_id) {
      await agentesRepository.findById(updates.agente_id);
    }

    const updatedCase = await casosRepository.update(id, updates);
    
    res.status(200).json(updatedCase);
  } catch (error) {
    next(error);
  }
};

const deleteCaso = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await casosRepository.remove(id);
    if (!deleted) {
      throw new AppError("Caso não encontrado.", 404);
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCasos,
  getCasoById,
  createCaso,
  updateCaso,
  patchCaso,
  deleteCaso,
};