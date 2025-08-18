const agentesRepository = require('../repositories/agentesRepository');
const { AppError } = require('../utils/errorHandler'); 


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
    const { cargo, dataDeIncorporacao, dataInicio, dataFim, orderBy, order } = req.query;
       
    let agentes = await agentesRepository.findAll();
    
    if (dataInicio || dataFim) {
      agentes = agentes.filter((agente) => {
        const data = new Date(agente.dataDeIncorporacao);
        const inicio = dataInicio ? new Date(dataInicio) : null;
        const fim = dataFim ? new Date(dataFim) : null;
        return (!inicio || data >= inicio) && (!fim || data <= fim);
      });
    }

    if (cargo) {
      agentes = agentes.filter(
        (agente) => agente.cargo && agente.cargo.toLowerCase() === cargo.toLowerCase()
      );
    }

    if (dataDeIncorporacao) {
      agentes = agentes.filter((agente) => agente.dataDeIncorporacao === dataDeIncorporacao);
    }

    if (orderBy) {
      const camposValidos = ['nome', 'dataDeIncorporacao', 'cargo'];
      if (!camposValidos.includes(orderBy)) {
        throw new AppError(`Campo para ordenação inválido. Use: ${camposValidos.join(', ')}`, 400);
      }
      const ordem = order === 'desc' ? -1 : 1;
      agentes.sort((a, b) => {
        if (a[orderBy] < b[orderBy]) return -1 * ordem;
        if (a[orderBy] > b[orderBy]) return 1 * ordem;
        return 0;
      });
    }

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

    if (!nome || !dataDeIncorporacao || !cargo) {
      throw new AppError('Os campos nome, dataDeIncorporacao e cargo são obrigatórios.', 400);
    }
    if (!validarData(dataDeIncorporacao)) {
      throw new AppError('Data de incorporação inválida. Use o formato YYYY-MM-DD e não informe datas futuras.', 400);
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
    if (!nome || !dataDeIncorporacao || !cargo) {
      throw new AppError('Para uma requisição PUT, todos os campos (nome, dataDeIncorporacao, cargo) são obrigatórios.', 400);
    }
    if (!validarData(dataDeIncorporacao)) {
      throw new AppError('Data de incorporação inválida.', 400);
    }

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

    const agenteAtualizado = await agentesRepository.update(id, updates);
    
    res.status(200).json(agenteAtualizado);
  } catch (error) {
    next(error);
  }
};

const deleteAgente = async (req, res, next) => {
  try {
    const { id } = req.params;
    await agentesRepository.remove(id);
    
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