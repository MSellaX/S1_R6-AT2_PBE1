const { entregaModel } = require('../models/entregaModel');
const { pedidoModel } = require("../models/pedidoModel");
const { clienteModel } = require('../models/clienteModel');

const entregaController = {

    listarEntregas: async (req, res) => {  
        try {
            const entregas = await entregaModel.buscarTodas(); // Buscar todas as entregas do banco de dados
            res.status(200).json(entregas);// Retornar as entregas em formato JSON

        } catch (error) {
            console.error("ERRO ao listar entregas:", error);
            res.status(500).json({ erro: "ERRO interno ao listar entregas!" }); // Retornar erro 500 em caso de falha
        }
    },

    registrarEntrega: async (req, res) => { // Registrar uma nova entrega
        try {

            const {
                idCliente,
                dataPedido,
                tipoEntrega,
                distanciaKM,
                pesoCarga,
                valorKM,
                valorKG
            } = req.body; // Dados recebidos no corpo da requisição

            // -----------------------------
            //       VALIDAÇÕES
            // -----------------------------
            if (
                idCliente === undefined || dataPedido === undefined ||
                tipoEntrega === undefined || distanciaKM === undefined ||
                pesoCarga === undefined || valorKM === undefined || valorKG === undefined
            ) { // Verifica se algum campo obrigatório está indefinido
                return res.status(400).json({ erro: "Campos obrigatórios não foram preenchidos" }); // Retorna erro 400 se faltar algum campo
            }

            if (isNaN(distanciaKM) || isNaN(pesoCarga) || isNaN(valorKM) || isNaN(valorKG)) { // Verifica se os campos numéricos são válidos
                return res.status(400).json({ erro: "Campos preenchidos com valores inválidos" }); // Retorna erro 400 se algum campo numérico for inválido
            }

            if (idCliente.length !== 36) { // Verifica se o ID do cliente tem o formato correto (36 caracteres)
                return res.status(400).json({ erro: "Id do Cliente inválido" }); // Retorna erro 400 se o ID do cliente for inválido
            }

            const data = new Date(dataPedido); // Converte a data do pedido para o formato Date
            if (isNaN(data.getTime())) { // Verifica se a data é válida
                return res.status(400).json({ erro: "Data do pedido inválida" }); // Retorna erro 400 se a data do pedido for inválida
            }

            const cliente = await clienteModel.buscarUm(idCliente); // Busca o cliente no banco de dados pelo ID

            if (!cliente || cliente.length != 1) { // Verifica se o cliente existe
                return res.status(404).json({ erro: "Cliente não encontrado" });
            }

            // -----------------------------
            //       CÁLCULOS OFICIAIS
            // -----------------------------
            let valorDistancia = distanciaKM * valorKM; // Cálculo do valor baseado na distância
            let valorPeso = pesoCarga * valorKG; // Cálculo do valor baseado no peso

            let valorBaseEntrega = valorDistancia + valorPeso;

            let acrescimo = 0;
            let desconto = 0;
            let taxaExtra = 0;

            let valorFinal = valorBaseEntrega;

            // URGENTE = 20% de acréscimo
            if (tipoEntrega.toLowerCase() === "urgente") {
                acrescimo = valorBaseEntrega * 0.20;
                valorFinal += acrescimo;
            }

            // PESO > 50kg → taxa extra fixa de 15
            if (pesoCarga > 50) {
                taxaExtra = 15;
                valorFinal += taxaExtra;
            }

            // VALOR FINAL > 500 → desconto de 10%
            if (valorFinal > 500) {
                desconto = valorFinal * 0.10;
                valorFinal -= desconto;
            }

            // -----------------------------
            //   REGISTRAR PEDIDO + ENTREGA
            // -----------------------------
            const statusEntrega = "calculado";

            await pedidoModel.inserirPedidos( // Insere o pedido no banco de dados
                idCliente,
                dataPedido,
                tipoEntrega,
                distanciaKM,
                pesoCarga,
                valorKM,
                valorKG,
                valorDistancia,
                valorPeso,
                valorFinal,
                acrescimo,
                desconto,
                taxaExtra,
                statusEntrega
            );

            // -----------------------------
            //   RETORNO AO CLIENTE
            // -----------------------------
            res.status(201).json({
                message: "Entrega registrada com sucesso!",
                calculo: { // Retorna os detalhes do cálculo ao cliente
                    valorDistancia,
                    valorPeso,
                    acrescimo,
                    desconto,
                    taxaExtra,
                    valorFinal,
                    statusEntrega
                }
            });

        } catch (error) {
            console.error("Erro ao registrar entrega:", error); // Log do erro no console para depuração
            res.status(500).json({ message: "Erro interno no servidor ao registrar entrega!" });
        }
    }
}

module.exports = { entregaController }; // Exporta o controlador de entrega para uso em outras partes da aplicação
