const { query } = require("mssql");
const { sql, getConnection } = require("../config/db") //importa a configuração do banco de dados

const pedidoModel = {

    buscarTodos: async () => { //busca todos os pedidos
        try {
            const pool = await getConnection(); // obtem a conexão com o banco de dados

            const querySQL = ` 
            SELECT 
                P.*, C.nomeCliente
            FROM Pedidos P
            INNER JOIN Clientes C
                ON C.idCliente = P.idCliente
            `; //consulta SQL para buscar todos os pedidos com o nome do cliente

            const result = await pool.request().query(querySQL); //executa a consulta
            return result.recordset;

        } catch (error) {
            console.error("Erro ao buscar pedidos", error); // log do erro no console
            throw error;
        }
    },

    buscarUm: async (idPedido) => {
        try {
            const pool = await getConnection(); // obtem a conexão com o banco de dados

            const querySQL = "SELECT * FROM PEDIDOS WHERE idPedido = @idPedido"; //consulta SQL para buscar o pedido pelo ID

            const result = await pool.request()
                .input("idPedido", sql.UniqueIdentifier, idPedido) // define o ID do pedido
                .query(querySQL);

            return result.recordset; // retorna o pedido encontrado

        } catch (error) {
            console.error("Erro ao buscar pedidos", error);// log do erro no console
            throw error; 
        }
    },

    inserirPedidos: async (
        idCliente, dataPedido, tipoEntrega,
        distanciaKM, pesoCarga, valorKM, valorKG,
        valorDistancia, valorPeso, valorFinal,
        acrescimo, desconto, taxaExtra, statusEntrega
    ) => { // Insere um novo pedido no banco de dados

        const pool = await getConnection();// obtem a conexão com o banco de dados
        const transaction = new sql.Transaction(pool); // Inicia uma nova transação
        await transaction.begin();// Inicia a transação

        try {

            // INSERT PEDIDO
            let querySQL = `
            INSERT INTO Pedidos (
                idCliente, dataPedido, tipoEntrega, distanciaKM, pesoCarga, valorKM, valorKG
            )
            OUTPUT INSERTED.idPedido
            VALUES (
                @idCliente, @dataPedido, @tipoEntrega, @distanciaKM, @pesoCarga, @valorKM, @valorKG
            )
            ` //consulta SQL para inserir o pedido

            const result = await transaction.request()// inicia a requisição da transação
                .input("idCliente", sql.UniqueIdentifier, idCliente)// define o ID do cliente
                .input("dataPedido", sql.DateTime, dataPedido)// define a data do pedido
                .input("tipoEntrega", sql.VarChar(10), tipoEntrega)// define o tipo de entrega
                .input("distanciaKM", sql.Decimal(10, 2), distanciaKM)// define a distância em KM
                .input("pesoCarga", sql.Decimal(10, 2), pesoCarga)// define o peso da carga
                .input("valorKM", sql.Decimal(10, 2), valorKM)// define o valor por KM
                .input("valorKG", sql.Decimal(10, 2), valorKG)// define o valor por KG
                .query(querySQL); //executa a query para inserir o pedido

            const idPedido = result.recordset[0].idPedido;

            // INSERT ENTREGA
            querySQL = `
            INSERT INTO ENTREGAS(
                idPedido, valorDistancia, valorPeso, valorFinal,
                acrescimo, desconto, taxaExtra, statusEntrega
            )
            VALUES (
                @idPedido, @valorDistancia, @valorPeso, @valorFinal,
                @acrescimo, @desconto, @taxaExtra, @statusEntrega
            )
            `; //consulta SQL para inserir a entrega

            await transaction.request()
                .input("idPedido", sql.UniqueIdentifier, idPedido)// define o ID do pedido
                .input("valorDistancia", sql.Decimal(10, 2), valorDistancia) // define o valor calculado pela distância
                .input("valorPeso", sql.Decimal(10, 2), valorPeso)// define o valor calculado pelo peso
                .input("valorFinal", sql.Decimal(10, 2), valorFinal) // define o valor final da entrega
                .input("acrescimo", sql.Decimal(10, 2), acrescimo) // define o acréscimo aplicado
                .input("desconto", sql.Decimal(10, 2), desconto) // define o desconto aplicado
                .input("taxaExtra", sql.Decimal(10, 2), taxaExtra)// define a taxa extra aplicada
                .input("statusEntrega", sql.VarChar(12), statusEntrega)// define o status da entrega
                .query(querySQL);

            await transaction.commit();

        } catch (error) {
            await transaction.rollback();
            console.error("Erro ao inserir pedido", error); // log do erro no console
            throw error;
        }
    },

    atualizarPedido: async ( 
        idPedido, idCliente, dataPedido, tipoEntrega, distanciaKM, pesoCarga, valorKM, valorKG,
        valorPeso, desconto, acrescimo, taxaExtra, valorFinal, statusEntrega, valorDistancia
    ) => {  // Atualiza um pedido existente

        try {
            const pool = await getConnection(); // obtem a conexão com o banco de dados

            let querySQL = `
            UPDATE PEDIDOS
            SET
                idCliente = @idCliente,
                dataPedido = @dataPedido,
                tipoEntrega = @tipoEntrega,
                distanciaKM = @distanciaKM,
                pesoCarga = @pesoCarga,
                valorKM = @valorKM,
                valorKG = @valorKG
            WHERE idPedido = @idPedido
            `; //consulta SQL para atualizar o pedido pelo ID

            await pool.request()
                .input("idPedido", sql.UniqueIdentifier, idPedido)// define o ID do pedido
                .input("idCliente", sql.UniqueIdentifier, idCliente)// define o ID do cliente
                .input("dataPedido", sql.DateTime, dataPedido)// define a data do pedido
                .input("tipoEntrega", sql.VarChar(10), tipoEntrega)// define o tipo de entrega
                .input("distanciaKM", sql.Decimal(10, 2), distanciaKM)// define a distância em KM
                .input("pesoCarga", sql.Decimal(10, 2), pesoCarga)//  define o peso da carga
                .input("valorKM", sql.Decimal(10, 2), valorKM)// define o valor por KM
                .input("valorKG", sql.Decimal(10, 2), valorKG)// define o valor por KG
                .query(querySQL); //executa a query para atualizar o pedido

            querySQL = `
            UPDATE ENTREGAS
            SET
                valorDistancia = @valorDistancia,
                valorPeso = @valorPeso,
                desconto = @desconto,
                acrescimo = @acrescimo,
                taxaExtra = @taxaExtra,
                valorFinal = @valorFinal,
                statusEntrega = @statusEntrega
            WHERE idPedido = @idPedido
            `; //consulta SQL para atualizar a entrega pelo ID do pedido

            await pool.request()
                .input("idPedido", sql.UniqueIdentifier, idPedido)// define o ID do pedido
                .input("valorDistancia", sql.Decimal(10, 2), valorDistancia)// define o valor calculado pela distância
                .input("valorPeso", sql.Decimal(10, 2), valorPeso)// define o valor calculado pelo peso
                .input("desconto", sql.Decimal(10, 2), desconto)// define o desconto aplicado
                .input("acrescimo", sql.Decimal(10, 2), acrescimo)// define o acréscimo aplicado
                .input("taxaExtra", sql.Decimal(10, 2), taxaExtra)// define a taxa extra aplicada
                .input("valorFinal", sql.Decimal(10, 2), valorFinal)// define o valor final da entrega
                .input("statusEntrega", sql.VarChar(12), statusEntrega)// define o status da entrega
                .query(querySQL); //executa a query para atualizar a entrega

        } catch (error) {
            console.error("Erro ao atualizar pedido", error);
            throw error;
        }
    },

    deletarPedido: async (idPedido) => {

        const pool = await getConnection(); // obtem a conexão com o banco de dados
        const transaction = new sql.Transaction(pool); // Inicia uma nova transação
        await transaction.begin(); // Inicia a transação

        try {

            let querySQL = `
                DELETE FROM ENTREGAS
                WHERE idPedido = @idPedido
            `; //consulta SQL para deletar a entrega pelo ID do pedido

            await transaction.request()
                .input("idPedido", sql.UniqueIdentifier, idPedido) //define o ID do pedido
                .query(querySQL);

            querySQL = `
                DELETE FROM PEDIDOS
                WHERE idPedido = @idPedido
            `; //consulta SQL para deletar o pedido pelo ID

            await transaction.request()
                .input("idPedido", sql.UniqueIdentifier, idPedido) //define o ID do pedido
                .query(querySQL);

            await transaction.commit(); // Confirma a transação

        } catch (error) {
            await transaction.rollback(); // Reverte a transação em caso de erro
            console.error("Erro ao deletar Pedido:", error);
            throw error;
        }
    }
}

module.exports = { pedidoModel }