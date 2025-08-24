const agentesRepository = require("../repositories/agentesRepository");
const { AppError } = require("../utils/errorHandler"); 


const validarData = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateString || !regex.test(dateString)) {
    return false;
  }

  const date = new Date(dateString);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  return !isNaN(date.getTime()) && date.toISOString().slice(0, 10) === dateString && date <= today;
};

const getAllAgentes = async (req, res, next) => {
  try {
    const { cargo, dataInicio, dataFim, orderBy, order } = req.query;
       
    const agentes = await agentesRepository.findAll({
      cargo,
      dataInicio,
      dataFim,
      orderBy,
      order,
    });

    res.status(200).json(agentes);
  } catch (error) {
    next(error);
  }
};

const getAgenteById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const agente = await agentesRepository.findById(id);
    res.status(200).json(agente);
  } catch (error) {
    next(error);
  }
};

const createAgente = async (req, res, next) => {
  try {
    const { nome, dataDeIncorporacao, cargo } = req.body;

    if (!nome || typeof nome !== 'string') {
      throw new AppError('O campo nome é obrigatório e deve ser uma string.', 400);
    }
    if (!dataDeIncorporacao) {
      throw new AppError('O campo dataDeIncorporacao é obrigatório.', 400);
    }
    if (!validarData(dataDeIncorporacao)) {
      throw new new AppError('Data de incorporação inválida. Use o formato YYYY-MM-DD e não informe datas futuras.', 400);
    }
    if (!cargo || typeof cargo !== 'string') {
      throw new AppError('O campo cargo é obrigatório e deve ser uma string.', 400);
    }
    
    const dadosNovoAgente = { nome, dataDeIncorporacao, cargo };
    const agenteCriado = await agentesRepository.create(dadosNovoAgente);
    
    res.status(201).json(agenteCriado);
  } catch (error) {
    next(error);
  }
};

const updateAgente = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nome, dataDeIncorporacao, cargo } = req.body;

    if (req.body.id && req.body.id !== id) {
      throw new AppError("O 'id' do corpo da requisição não pode ser diferente do 'id' da URL.", 400);
    }
    if (!nome || typeof nome !== 'string') {
      throw new AppError('O campo nome é obrigatório e deve ser uma string para atualização PUT.', 400);
    }
    if (!dataDeIncorporacao) {
      throw new AppError('O campo dataDeIncorporacao é obrigatório para atualização PUT.', 400);
    }
    if (!validarData(dataDeIncorporacao)) {
      throw new AppError('Data de incorporação inválida para atualização PUT.', 400);
    }
    if (!cargo || typeof cargo !== 'string') {
      throw new AppError('O campo cargo é obrigatório e deve ser uma string para atualização PUT.', 400);
    }


    await agentesRepository.findById(id);
    
    const agenteAtualizado = await agentesRepository.update(id, { nome, dataDeIncorporacao, cargo });
    
    res.status(200).json(agenteAtualizado);
  } catch (error) {
    next(error);
  }
};

const patchAgente = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.id) {
      throw new AppError("O campo 'id' não pode ser alterado.", 400);
    }
    if (Object.keys(updates).length === 0) {
      throw new AppError('O corpo da requisição não pode estar vazio para uma operação PATCH.', 400);
    }
    if (updates.dataDeIncorporacao && !validarData(updates.dataDeIncorporacao)) {
      throw new AppError('Data de incorporação inválida.', 400);
    }
    if (updates.nome && typeof updates.nome !== 'string') {
      throw new AppError('O nome deve ser uma string.', 400);
    }
    if (updates.cargo && typeof updates.cargo !== 'string') {
      throw new AppError('O cargo deve ser uma string.', 400);
    }


    await agentesRepository.findById(id);
    
    const agenteAtualizado = await agentesRepository.update(id, updates);
    
    res.status(200).json(agenteAtualizado);
  } catch (error) {
    next(error);
  }
};

const deleteAgente = async (req, res, next) => {
  try {
    const { id } = req.params;

    await agentesRepository.findById(id);

    const deleted = await agentesRepository.remove(id);
    if (!deleted) {

      throw new AppError('Agente não encontrado.', 404);
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAgentes,
  getAgenteById,
  createAgente,
  updateAgente,
  patchAgente,
  deleteAgente,
};