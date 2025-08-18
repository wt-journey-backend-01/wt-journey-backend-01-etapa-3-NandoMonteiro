const casosRepository = require("../repositories/casosRepository");
const agentesRepository = require("../repositories/agentesRepository");
const { AppError } = require("../utils/errorHandler"); // Importa a classe AppError

const getAllCasos = async (req, res, next) => {
  try {
    const { status, agente_id, search, orderBy, order } = req.query;
    let casos = await casosRepository.findAll();

    if (status) {
      const statusValidos = ["aberto", "solucionado"];
      if (!statusValidos.includes(status)) {
        throw new AppError("O status do caso deve ser 'aberto' ou 'solucionado'.", 400);
      }
      casos = casos.filter((caso) => caso.status === status);
    }

    if (agente_id) {
      const agenteExistente = await agentesRepository.findById(agente_id);
      if (!agenteExistente) {
        throw new AppError("Agente não encontrado com o agente_id fornecido.", 404);
      }
      casos = casos.filter((caso) => caso.agente_id === agente_id);
    }

    if (search) {
      const termo = search.toLowerCase();
      casos = casos.filter(
        (caso) =>
          caso.titulo.toLowerCase().includes(termo) || caso.descricao.toLowerCase().includes(termo)
      );
    }

    if (orderBy) {
      const camposValidos = ["titulo", "status", "agente_id"];
      if (!camposValidos.includes(orderBy)) {
        throw new AppError(`Campo para ordenação inválido. Use: ${camposValidos.join(", ")}.`, 400);
      }

      if (order && !["asc", "desc"].includes(order)) {
        throw new AppError("Parâmetro 'order' inválido. Use 'asc' ou 'desc'.", 400);
      }

      const ordem = order === "desc" ? -1 : 1;
      casos.sort((a, b) => {
        if (a[orderBy] < b[orderBy]) return -1 * ordem;
        if (a[orderBy] > b[orderBy]) return 1 * ordem;
        return 0;
      });
    }

    const casosComAgente = await Promise.all(casos.map(async (caso) => ({
      ...caso,
      agente: await agentesRepository.findById(caso.agente_id),
    })));

    res.status(200).json(casosComAgente);
  } catch (error) {
    next(error);
  }
};

const getCasoById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const caso = await casosRepository.findById(id);

    const agente = await agentesRepository.findById(caso.agente_id);

    res.status(200).json({ ...caso, agente });
  } catch (error) {
    next(error);
  }
};

const createCaso = async (req, res, next) => {
  try {
    const { titulo, descricao, status, agente_id } = req.body;

    if (!titulo || !descricao || !status || !agente_id) {
      throw new AppError("Todos os campos (titulo, descricao, status, agente_id) são obrigatórios.", 400);
    }
    if (typeof titulo !== "string" || typeof descricao !== "string") {
      throw new AppError("Título e descrição devem ser strings.", 400);
    }
    const statusValidos = ["aberto", "solucionado"];
    if (!statusValidos.includes(status)) {
      throw new AppError("O status do caso deve ser 'aberto' ou 'solucionado'.", 400);
    }
    
    // O findById no repositório já lança um 404 se não encontrar, então não é necessário o if aqui.
    // É uma boa prática deixar a validação do ID na camada de repositório.
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
      throw new AppError("O 'id' do corpo da requisição não pode ser diferente do 'id' da URL.", 400);
    }

    if (!titulo || !descricao || !status || !agente_id) {
      throw new AppError("Para uma requisição PUT, todos os campos são obrigatórios.", 400);
    }
    if (typeof titulo !== "string" || typeof descricao !== "string") {
      throw new AppError("Título e descrição devem ser strings.", 400);
    }
    const statusValidos = ["aberto", "solucionado"];
    if (!statusValidos.includes(status)) {
      throw new AppError("O status do caso deve ser 'aberto' ou 'solucionado'.", 400);
    }

    await agentesRepository.findById(agente_id);
    
    const updatedCase = await casosRepository.update(id, { titulo, descricao, status, agente_id });

    // O update no repositório já lança um 404 se não encontrar o caso, o if !updatedCase não é mais necessário
    res.status(200).json(updatedCase);
  } catch (error) {
    next(error);
  }
};

const patchCaso = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const camposValidos = ["titulo", "descricao", "status", "agente_id"];

    if (updates.id) {
      throw new AppError("O campo 'id' não pode ser alterado.", 400);
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
      throw new AppError("O status do caso deve ser 'aberto' ou 'solucionado'.", 400);
    }
    if (updates.agente_id) {
      await agentesRepository.findById(updates.agente_id);
    }

    const updatedCase = await casosRepository.update(id, updates);
    
    // O repositório já trata o caso de não encontrar o ID, lançando um 404
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
      throw new AppError('Caso não encontrado.', 404);
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