const { pedidoModel } = require("../models/pedidoModel"); 
const { clienteModel } = require("../models/clienteModel");

const pedidoController = {

    listarPedidos: async (req, res) => { 
        try {
            const pedidos = await pedidoModel.buscarTodos(); 
            res.status(200).json(pedidos); 

        } catch (error) {
            console.error("ERRO ao listar pedidos:", error);
            res.status(500).json({ erro: "ERRO interno ao listar pedidos!" });
        }
    },

    criarPedido: async (req, res) => { // Registrar um novo pedido

        try {

            const { // Dados recebidos no corpo da requisição
                idCliente,
                dataPedido,
                tipoEntrega,
                distanciaKM,
                pesoCarga,
                valorKM,
                valorKG
            } = req.body;

            // -----------------------------
            //       VALIDAÇÕES
            // -----------------------------
            if (
                idCliente == undefined || dataPedido == undefined || 
                tipoEntrega == undefined || distanciaKM == undefined ||
                pesoCarga == undefined || valorKM == undefined || valorKG == undefined
            ) { // Verifica se algum campo obrigatório está indefinido
                return res.status(400).json({ erro: "Campos obrigatórios não foram preenchidos" });
            }

            if (isNaN(distanciaKM) || isNaN(pesoCarga) || isNaN(valorKM) || isNaN(valorKG)) { // Verifica se os campos numéricos são válidos
                return res.status(400).json({ erro: "Campos preenchidos com valores inválidos" });
            }

            if (idCliente.length != 36) { // Verifica se o ID do cliente tem o formato correto (36 caracteres)
                return res.status(400).json({ erro: "Id do Cliente inválido" });
            }

            const data = new Date(dataPedido); // Converte a data do pedido para o formato Date
            if (isNaN(data.getTime())) {
                return res.status(400).json({ erro: "Data do pedido inválida" });
            }

            const cliente = await clienteModel.buscarUm(idCliente); // Busca o cliente no banco de dados pelo ID

            if (!cliente || cliente.length != 1) { // Verifica se o cliente existe
                return res.status(404).json({ erro: "Cliente não encontrado" });
            }

            // -----------------------------
            //          CÁLCULOS
            // -----------------------------
            let valorDistancia = distanciaKM * valorKM; // Cálculo do valor baseado na distância
            let valorPeso = pesoCarga * valorKG; // Cálculo do valor baseado no peso

            let valorBaseEntrega = valorDistancia + valorPeso; // Valor base da entrega

            let acrescimo = 0; // Inicializa o acréscimo
            let desconto = 0; // Inicializa o desconto
            let taxaExtra = 0;  // Inicializa a taxa extra

            let valorFinal = valorBaseEntrega;

            // URGENTE = acrescimo 20%
            if (tipoEntrega.toLowerCase() === "urgente") {
                acrescimo = valorBaseEntrega * 0.20;
                valorFinal += acrescimo;
            }

            // PESO > 50kg → taxa extra fixa de 15
            if (pesoCarga > 50) {
                taxaExtra = 15;
                valorFinal += taxaExtra;
            }

            // VALOR FINAL > 500 → desconto 10%
            if (valorFinal > 500) {
                desconto = valorFinal * 0.10;
                valorFinal -= desconto;
            }

            const statusEntrega = "calculado";

            // -----------------------------
            //   REGISTRO NO BANCO
            // -----------------------------
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
            //      RETORNO AO CLIENTE
            // -----------------------------
            res.status(201).json({ // Retorna sucesso ao cliente
                message: "Pedido cadastrado com sucesso!",
                calculo: {
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
            console.error("Erro ao cadastrar pedido:", error); 
            res.status(500).json({ message: "Erro interno no servidor ao cadastrar pedido!" });
        }

    },

    atualizarPedido: async (req, res) => {
        try {
            const { idPedido } = req.params;  // ID do pedido recebido nos parâmetros da requisição
            const { 
                idCliente,
                dataPedido,
                tipoEntrega,
                distanciaKM,
                pesoCarga,
                valorKM,
                valorKG,
                statusEntrega
            } = req.body; // Dados recebidos no corpo da requisição

            if (idPedido.length !== 36) { // Verifica se o ID do pedido tem o formato correto (36 caracteres)
                return res.status(400).json({ erro: "ID do pedido inválido!" });
            }

            const pedido = await pedidoModel.buscarUm(idPedido); // Busca o pedido no banco de dados pelo ID

            if (!pedido || pedido.length !== 1) { // Verifica se o pedido existe
                return res.status(404).json({ erro: "Pedido não encontrado!" });
            }

            if (idCliente) {
                if (idCliente.length !== 36) { // Verifica se o ID do cliente tem o formato correto (36 caracteres)
                    return res.status(400).json({ erro: "ID do cliente inválido!" });
                }

                const cliente = await clienteModel.buscarUm(idCliente); // Busca o cliente no banco de dados pelo ID
                if (!cliente || cliente.length !== 1) { // Verifica se o cliente existe
                    return res.status(404).json({ erro: "Cliente não encontrado!" });
                }
            }

            const pedidoAtual = pedido[0]; // Dados atuais do pedido

            const idClienteAtualizado = idCliente ?? pedidoAtual.idCliente; 
            const dataPedidoAtualizado = dataPedido ?? pedidoAtual.dataPedido; 
            const tipoEntregaAtualizado = tipoEntrega ?? pedidoAtual.tipoEntrega;
            const distanciaKMAtualizado = distanciaKM ?? pedidoAtual.distanciaKM;// Mantém o valor atual se não for fornecido
            const pesoCargaAtualizado = pesoCarga ?? pedidoAtual.pesoCarga;
            const valorKMAtualizado = valorKM ?? pedidoAtual.valorKM;
            const valorKGAtualizado = valorKG ?? pedidoAtual.valorKG;
            const statusEntregaAtualizado = statusEntrega ?? pedidoAtual.statusEntrega;

            let valorDistancia = distanciaKMAtualizado * valorKMAtualizado; // Cálculo do valor baseado na distância
            let valorPeso = pesoCargaAtualizado * valorKGAtualizado; // Cálculo do valor baseado no peso

            let valorBaseEntrega = valorDistancia + valorPeso;

            let acrescimo = 0; // Inicializa o acréscimo
            let desconto = 0; // Inicializa o desconto
            let taxaExtra = 0; //   Inicializa a taxa extra

            let valorFinal = valorBaseEntrega;

            if (tipoEntregaAtualizado.toLowerCase() === "urgente") { // URGENTE = acrescimo 20%
                acrescimo = valorBaseEntrega * 0.20;
                valorFinal += acrescimo;
            }

            if (pesoCargaAtualizado > 50) { // PESO > 50kg → taxa extra fixa de 15
                taxaExtra = 15;
                valorFinal += taxaExtra;
            }

            if (valorFinal > 500) { // VALOR FINAL > 500 → desconto 10%
                desconto = valorFinal * 0.10;
                valorFinal -= desconto;
            }

            await pedidoModel.atualizarPedido( // Atualiza o pedido no banco de dados
                idPedido,
                idClienteAtualizado,
                dataPedidoAtualizado,
                tipoEntregaAtualizado,
                distanciaKMAtualizado,
                pesoCargaAtualizado,
                valorKMAtualizado,
                valorKGAtualizado,
                valorPeso,
                desconto,
                acrescimo,
                taxaExtra,
                valorFinal,
                statusEntregaAtualizado,
                valorDistancia
            );

            res.status(200).json({ mensagem: "Pedido e Entrega atualizados com sucesso!" });

        } catch (error) {
            console.error("ERRO ao atualizar pedido:", error);
            res.status(500).json({ erro: "Erro interno ao atualizar pedido!" });
        }
    },

    deletarPedido: async (req, res) => {
        try {
            const { idPedido } = req.params;

            if (idPedido.length !== 36) { // Verifica se o ID do pedido tem o formato correto (36 caracteres)
                return res.status(400).json({ erro: "ID do pedido inválido!" });
            }

            const pedido = await pedidoModel.buscarUm(idPedido); // Busca o pedido no banco de dados pelo ID

            if (!pedido || pedido.length !== 1) { // Verifica se o pedido existe
                return res.status(404).json({ erro: "Pedido não encontrado!" });
            }

            await pedidoModel.deletarPedido(idPedido); // Deleta o pedido do banco de dados

            res.status(200).json({ mensagem: "Pedido e Entrega deletados com sucesso!" });

        } catch (error) {
            console.error("ERRO ao deletar pedido:", error); // Log do erro no console
            res.status(500).json({ erro: "Erro interno ao deletar pedido!" });
        }
    }
}


module.exports = { pedidoController };