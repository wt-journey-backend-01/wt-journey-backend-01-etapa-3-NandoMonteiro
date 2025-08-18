const express = require('express');
const router = express.Router();
const casosController = require('../controllers/casosController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Caso:
 *       type: object
 *       required:
 *         - titulo
 *         - descricao
 *         - status
 *         - agente_id
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único do caso
 *         titulo:
 *           type: string
 *           description: Título do caso
 *         descricao:
 *           type: string
 *           description: Descrição detalhada do caso
 *         status:
 *           type: string
 *           enum: [aberto, solucionado]
 *           description: Status do caso
 *         agente_id:
 *           type: string
 *           format: uuid
 *           description: ID do agente responsável
 *         agente:
 *           $ref: '#/components/schemas/Agente'
 *           description: Dados do agente responsável
 *       example:
 *         id: "f5fb2ad5-22a8-4cb4-90f2-8733517a0d46"
 *         titulo: "homicidio"
 *         descricao: "Disparos foram reportados às 22:33 do dia 10/07/2007 na região do bairro União, resultando na morte da vítima, um homem de 45 anos."
 *         status: "aberto"
 *         agente_id: "401bccf5-cf9e-489d-8412-446cd169a0f1"
 *         agente:
 *           id: "401bccf5-cf9e-489d-8412-446cd169a0f1"
 *           nome: "Rommel Carneiro"
 *           dataDeIncorporacao: "1992-10-04"
 *           cargo: "delegado"
 *
 *     CasoInput:
 *       type: object
 *       required:
 *         - titulo
 *         - descricao
 *         - status
 *         - agente_id
 *       properties:
 *         titulo:
 *           type: string
 *           description: Título do caso
 *         descricao:
 *           type: string
 *           description: Descrição detalhada do caso
 *         status:
 *           type: string
 *           enum: [aberto, solucionado]
 *           description: Status do caso
 *         agente_id:
 *           type: string
 *           format: uuid
 *           description: ID do agente responsável
 *       example:
 *         titulo: "Roubo a banco"
 *         descricao: "Assalto ocorrido na agência bancária do centro da cidade"
 *         status: "aberto"
 *         agente_id: "401bccf5-cf9e-489d-8412-446cd169a0f1"
 *
 *     CasoPatchInput:
 *       type: object
 *       properties:
 *         titulo:
 *           type: string
 *           description: Título do caso
 *         descricao:
 *           type: string
 *           description: Descrição detalhada do caso
 *         status:
 *           type: string
 *           enum: [aberto, solucionado]
 *           description: Status do caso
 *         agente_id:
 *           type: string
 *           format: uuid
 *           description: ID do agente responsável
 *       example:
 *         status: "solucionado"
 */

/**
 * @swagger
 * /casos:
 *   get:
 *     summary: Lista todos os casos
 *     tags: [Casos]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [aberto, solucionado]
 *         description: Filtrar casos por status
 *       - in: query
 *         name: agente_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar casos por agente responsável
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar casos por título ou descrição
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           enum: [titulo, status, agente_id]
 *         description: Campo para ordenação
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Ordem da classificação (padrão é asc)
 *     responses:
 *       200:
 *         description: Lista de casos com dados dos agentes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Caso'
 *       400:
 *         description: Parâmetros de consulta inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "O status do caso deve ser 'aberto' ou 'solucionado'."
 *       404:
 *         description: Agente não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Agente não encontrado com o agente_id fornecido."
 */

/**
 * @swagger
 * /casos/{id}:
 *   get:
 *     summary: Busca um caso por ID
 *     tags: [Casos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do caso
 *     responses:
 *       200:
 *         description: Caso encontrado com dados do agente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Caso'
 *       404:
 *         description: Caso não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Caso não encontrado."
 */

/**
 * @swagger
 * /casos:
 *   post:
 *     summary: Cria um novo caso
 *     tags: [Casos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CasoInput'
 *     responses:
 *       201:
 *         description: Caso criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 titulo:
 *                   type: string
 *                 descricao:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [aberto, solucionado]
 *                 agente_id:
 *                   type: string
 *                   format: uuid
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     campos_obrigatorios:
 *                       value: "Todos os campos são obrigatórios."
 *                     titulo_string:
 *                       value: "O título deve ser uma string."
 *                     descricao_string:
 *                       value: "A descrição deve ser uma string."
 *                     status_invalido:
 *                       value: "O status do caso deve ser 'aberto' ou 'solucionado'."
 *       404:
 *         description: Agente não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Agente não encontrado com o agente_id fornecido."
 */

/**
 * @swagger
 * /casos/{id}:
 *   put:
 *     summary: Atualiza um caso completamente
 *     tags: [Casos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do caso
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CasoInput'
 *     responses:
 *       200:
 *         description: Caso atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 titulo:
 *                   type: string
 *                 descricao:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [aberto, solucionado]
 *                 agente_id:
 *                   type: string
 *                   format: uuid
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     id_nao_alteravel:
 *                       value: "O campo 'id' não pode ser alterado."
 *                     campos_obrigatorios:
 *                       value: "Todos os campos são obrigatórios."
 *                     titulo_string:
 *                       value: "O título deve ser uma string."
 *                     descricao_string:
 *                       value: "A descrição deve ser uma string."
 *                     status_invalido:
 *                       value: "O status do caso deve ser 'aberto' ou 'solucionado'."
 *       404:
 *         description: Caso ou agente não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     caso_nao_encontrado:
 *                       value: "Caso não encontrado."
 *                     agente_nao_encontrado:
 *                       value: "Agente não encontrado com o agente_id fornecido."
 */

/**
 * @swagger
 * /casos/{id}:
 *   patch:
 *     summary: Atualiza um caso parcialmente
 *     tags: [Casos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do caso
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CasoPatchInput'
 *     responses:
 *       200:
 *         description: Caso atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 titulo:
 *                   type: string
 *                 descricao:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [aberto, solucionado]
 *                 agente_id:
 *                   type: string
 *                   format: uuid
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     id_nao_alteravel:
 *                       value: "O campo 'id' não pode ser alterado."
 *                     campo_obrigatorio:
 *                       value: "Deve conter pelo menos um campo para atualização."
 *                     titulo_string:
 *                       value: "O título deve ser uma string."
 *                     descricao_string:
 *                       value: "A descrição deve ser uma string."
 *                     status_invalido:
 *                       value: "O status do caso deve ser 'aberto' ou 'solucionado'."
 *       404:
 *         description: Caso ou agente não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     caso_nao_encontrado:
 *                       value: "Caso não encontrado."
 *                     agente_nao_encontrado:
 *                       value: "Agente não encontrado com o agente_id fornecido."
 */

/**
 * @swagger
 * /casos/{id}:
 *   delete:
 *     summary: Remove um caso
 *     tags: [Casos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do caso
 *     responses:
 *       204:
 *         description: Caso removido com sucesso
 *       404:
 *         description: Caso não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Caso não encontrado."
 */

router.get('/', casosController.getAllCasos);
router.get('/:id', casosController.getCasoById);
router.post('/', casosController.createCaso);
router.put('/:id', casosController.updateCaso);
router.delete('/:id', casosController.deleteCaso);
router.patch('/:id', casosController.updateCaso);

module.exports = router;
