const { pedidoModel } = require("../models/pedidoModel"); //importa o modelo de pedido
const { clienteModel } = require("../models/clienteModel"); //importa o modelo de cliente

const pedidoController = {

    listarPedidos: async (req, res) => {
        try {
            const pedidos = await pedidoModel.buscarTodos(); //busca todos os pedidos no banco de dados
            res.status(200).json(pedidos);

        } catch (error) {
            console.error("ERRO ao listar pedidos:", error);
            res.status(500).json({ erro: "ERRO interno ao listar pedidos!" }); //retorna erro 500 em caso de falha no servidor
        }
    },

    criarPedido: async (req, res) => { //cria um novo pedido
        try {
            const { 
                idCliente,
                dataPedido,
                tipoEntrega,
                distanciaKm,
                pesoCarga,
                valorKm,
                valorKg
            } = req.body; //pega os dados do corpo da requisição

            if ( //valida os campos obrigatórios
                !idCliente || !dataPedido || !tipoEntrega ||
                distanciaKm == undefined || pesoCarga == undefined ||
                valorKm == undefined || valorKg == undefined
            ) {
                return res.status(400).json({ erro: "Campos obrigatórios não preenchidos!" }); //retorna erro 400 em caso de campos obrigatórios não preenchidos
            }

            if (idCliente.length !== 36) {
                return res.status(400).json({ erro: "ID do cliente inválido!" }); //valida o idCliente
            }

            const cliente = await clienteModel.buscarUm(idCliente); //busca o cliente pelo idCliente

            if (!cliente || cliente.length !== 1) {
                return res.status(404).json({ erro: "Cliente não encontrado!" }); //retorna erro 404 se o cliente não for encontrado
            }

            await pedidoModel.inserirPedido( //insere o novo pedido no banco de dados
                idCliente,
                dataPedido,
                tipoEntrega,
                distanciaKm,
                pesoCarga,
                valorKm,
                valorKg
            );

            res.status(201).json({ mensagem: "Pedido cadastrado com sucesso!" }); //retorna sucesso 201 em caso de criação bem-sucedida

        } catch (error) {
            console.error("ERRO ao cadastrar pedido:", error);
            res.status(500).json({ erro: "ERRO interno ao cadastrar pedido!" }); //retorna erro 500 em caso de falha no servidor  
        }
    },

    atualizarPedido: async (req, res) => {
        try {
            const { idPedido } = req.params; //pega o idPedido dos parâmetros da rota
            const { //pega os dados do corpo da requisição
                idCliente,
                dataPedido,
                tipoEntrega,
                distanciaKm,
                pesoCarga,
                valorKm,
                valorKg
            } = req.body; //pega os dados do corpo da requisição

            if (idPedido.length !== 36) {
                return res.status(400).json({ erro: "ID do pedido inválido!" }); //valida o idPedido
            }

            const pedido = await pedidoModel.buscarUm(idPedido); //busca o pedido pelo idPedido

            if (!pedido || pedido.length !== 1) {
                return res.status(404).json({ erro: "Pedido não encontrado!" }); //retorna erro 404 se o pedido não for encontrado
            } 

            if (idCliente) {
                if (idCliente.length !== 36) {
                    return res.status(400).json({ erro: "ID do cliente inválido!" }); //valida o idCliente
                }

                const cliente = await clienteModel.buscarUm(idCliente); //busca o cliente pelo idCliente
                if (!cliente || cliente.length !== 1) {
                    return res.status(404).json({ erro: "Cliente não encontrado!" }); //retorna erro 404 se o cliente não for encontrado
                }
            }

            const pedidoAtual = pedido[0]; //pega o pedido atual

            await pedidoModel.atualizarPedido( //atualiza o pedido no banco de dados
                idPedido,
                idCliente ?? pedidoAtual.idCliente,
                dataPedido ?? pedidoAtual.dataPedido,
                tipoEntrega ?? pedidoAtual.tipoEntrega,
                distanciaKm ?? pedidoAtual.distanciaKm,
                pesoCarga ?? pedidoAtual.pesoCarga,
                valorKm ?? pedidoAtual.valorKm,
                valorKg ?? pedidoAtual.valorKg
            ); //atualiza o pedido no banco de dados

            res.status(200).json({ mensagem: "Pedido atualizado com sucesso!" }); //retorna sucesso 200 em caso de atualização bem-sucedida

        } catch (error) {
            console.error("ERRO ao atualizar pedido:", error);
            res.status(500).json({ erro: "Erro interno ao atualizar pedido!" }); //retorna erro 500 em caso de falha no servidor
        }
    },

    deletarPedido: async (req, res) => { //deleta um pedido
        try {
            const { idPedido } = req.params;

            if (idPedido.length !== 36) { //valida o idPedido
                return res.status(400).json({ erro: "ID do pedido inválido!" }); //retorna erro 400 em caso de idPedido inválido
            }

            const pedido = await pedidoModel.buscarUm(idPedido); //busca o pedido pelo idPedido

            if (!pedido || pedido.length !== 1) {
                return res.status(404).json({ erro: "Pedido não encontrado!" }); //retorna erro 404 se o pedido não for encontrado
            }

            await pedidoModel.deletarPedido(idPedido);

            res.status(200).json({ mensagem: "Pedido deletado com sucesso!" }); //retorna sucesso 200 em caso de deleção bem-sucedida

        } catch (error) {
            console.error("ERRO ao deletar pedido:", error);
            res.status(500).json({ erro: "Erro interno ao deletar pedido!" }); //retorna erro 500 em caso de falha no servidor
        }
    }
};

module.exports = { pedidoController }; //exporta o pedidoController