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

    if (!titulo || typeof titulo !== "string") {
      throw new AppError(400, "O campo titulo é obrigatório e deve ser uma string.");
    }
    if (!descricao || typeof descricao !== "string") {
      throw new AppError(400, "O campo descricao é obrigatório e deve ser uma string.");
    }
    if (!status) {
      throw new AppError(400, "O campo status é obrigatório.");
    }
    const statusValidos = ["aberto", "solucionado"];
    if (!statusValidos.includes(status)) {
      throw new AppError(400, "O status do caso deve ser 'aberto' ou 'solucionado'.");
    }
    if (!agente_id || typeof agente_id !== "number" || agente_id <= 0) {
      throw new AppError(400, "O campo agente_id é obrigatório e deve ser um número inteiro positivo.");
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
      throw new AppError(400, "O 'id' do corpo da requisição não pode ser diferente do 'id' da URL.");
    }

    if (!titulo || typeof titulo !== "string") {
      throw new AppError(400, "O campo titulo é obrigatório e deve ser uma string para atualização PUT.");
    }
    if (!descricao || typeof descricao !== "string") {
      throw new AppError(400, "O campo descricao é obrigatório e deve ser uma string para atualização PUT.");
    }
    if (!status) {
      throw new AppError(400, "O campo status é obrigatório para atualização PUT.");
    }
    const statusValidos = ["aberto", "solucionado"];
    if (!statusValidos.includes(status)) {
      throw new AppError(400, "O status do caso deve ser 'aberto' ou 'solucionado' para atualização PUT.");
    }
    if (!agente_id || typeof agente_id !== "number" || agente_id <= 0) {
      throw new AppError(400, "O campo agente_id é obrigatório e deve ser um número inteiro positivo para atualização PUT.");
    }

    // Verifica se o caso existe antes de tentar atualizar
    await casosRepository.findById(id);
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
      throw new AppError(400, "O campo 'id' não pode ser alterado.");
    }

    if (Object.keys(updates).length === 0) {
      throw new AppError(400, "O corpo da requisição não pode estar vazio para uma operação PATCH.");
    }
    
    if (updates.titulo && typeof updates.titulo !== "string") {
      throw new AppError(400, "O título deve ser uma string.");
    }
    if (updates.descricao && typeof updates.descricao !== "string") {
      throw new AppError(400, "A descrição deve ser uma string.");
    }
    if (updates.status && !["aberto", "solucionado"].includes(updates.status)) {
      throw new AppError(400, "O status do caso deve ser 'aberto' ou 'solucionado'.");
    }
    if (updates.agente_id) {
      if (typeof updates.agente_id !== "number" || updates.agente_id <= 0) {
        throw new AppError(400, "O campo agente_id deve ser um número inteiro positivo.");
      }
      await agentesRepository.findById(updates.agente_id);
    }

    // Verifica se o caso existe antes de tentar atualizar parcialmente
    await casosRepository.findById(id);

    const updatedCase = await casosRepository.update(id, updates);
    
    res.status(200).json(updatedCase);
  } catch (error) {
    next(error);
  }
};

const deleteCaso = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Verifica se o caso existe antes de tentar deletar
    await casosRepository.findById(id);

    const deleted = await casosRepository.remove(id);
    if (!deleted) {
      // Isso não deve acontecer se findById já verificou, mas é um fallback
      throw new AppError(404, "Caso não encontrado.");
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