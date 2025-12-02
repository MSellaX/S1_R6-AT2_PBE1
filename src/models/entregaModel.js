const { sql, getConnection } = require("../config/db"); //importa a configuração do banco de dados

const entregaModel = {

    buscarTodas: async () => { //busca todas as entregas
        try {
            const pool = await getConnection();

            const querySQL = `
                SELECT * FROM Entregas
            `;

            const result = await pool.request().query(querySQL); //executa a consulta
            return result.recordset;
        } catch (error) {
            console.error("ERRO ao buscar entregas:", error);
            throw error;
        }
    }, 

    buscarUma: async (idEntrega) => {
        try {
            const pool = await getConnection();

            const querySQL = `
                SELECT * FROM Entregas WHERE idEntrega = @idEntrega
            `;

            const result = await pool.request()
                .input("idEntrega", sql.UniqueIdentifier, idEntrega)
                .query(querySQL);
            return result.recordset;
        } catch (error) {
            console.error("ERRO ao buscar entrega:", error);
            throw error;
        }
    },

    registrarEntrega: async (

        idEntrega,
        idPedido,
        nomeProduto,
        valorDistancia,
        valorPeso,
        acrescimo,
        desconto,
        taxaExtra,
        valorFinal,
        statusEntrega
        
    ) => {
        try {
            const pool = await getConnection();
            const querySQL = `
                INSERT INTO Entregas (
                    idEntrega,
                    idPedido,
                    nomeProduto,
                    valorDistancia,
                    valorPeso,
                    acrescimo,
                    desconto,
                    taxaExtra,
                    valorFinal,
                    statusEntrega
                )
                VALUES (
                    @idEntrega,
                    @idPedido,
                    @nomeProduto,
                    @valorDistancia,
                    @valorPeso,
                    @acrescimo,
                    @desconto,
                    @taxaExtra,
                    @valorFinal,
                    @statusEntrega
                )
            `;

            await pool.request()
                .input("idEntrega", sql.UniqueIdentifier, idEntrega) //define o ID da entrega
                .input("idPedido", sql.UniqueIdentifier, idPedido) // define o ID do pedido associado
                .input("nomeProduto", sql.VarChar(100), nomeProduto) // define o nome do produto
                .input("valorDistancia", sql.Decimal(10, 2), valorDistancia) // define o valor calculado pela distância
                .input("valorPeso", sql.Decimal(10, 2), valorPeso) // define o valor calculado pelo peso
                .input("acrescimo", sql.Decimal(10, 2), acrescimo) // define o acréscimo aplicado
                .input("desconto", sql.Decimal(10, 2), desconto) // define o desconto aplicado
                .input("taxaExtra", sql.Decimal(10, 2), taxaExtra) // define a taxa extra aplicada
                .input("valorFinal", sql.Decimal(10, 2), valorFinal) //define o valor final da entrega
                .input("statusEntrega", sql.VarChar(20), statusEntrega) //define o status da entrega
                .query(querySQL); //executa a consulta
        }

        catch (error) {
            console.error("ERRO ao registrar entrega:", error); //log do erro no console
            throw error;
        }
    },

    atualizarStatus: async ( idEntrega, statusEntrega ) => {
        try {
            const pool = await getConnection();
            const querySQL = `
                UPDATE Entregas
                SET statusEntrega = @statusEntrega
                WHERE idEntrega = @idEntrega
            `; //consulta SQL para atualizar o status da entrega

            await pool.request()
                .input("idEntrega", sql.UniqueIdentifier, idEntrega) //define o ID da entrega
                .input("statusEntrega", sql.VarChar(20), statusEntrega) //define o novo status da entrega
                .query(querySQL);
        } catch (error) {
            console.error("ERRO ao atualizar status da entrega:", error); //log do erro no console
            throw error;
        }
    },

    deletarEntrega: async (idEntrega) => {
        try {
            const pool = await getConnection(); //obtem a conexão com o banco de dados
            const querySQL = `
                DELETE FROM Entregas WHERE idEntrega = @idEntrega
            `; //consulta SQL para deletar a entrega pelo ID
            await pool.request()
                .input("idEntrega", sql.UniqueIdentifier, idEntrega) //define o ID da entrega
                .query(querySQL);
        } catch (error) {
            console.error("ERRO ao deletar entrega:", error); //log do erro no console
            throw error;
        }
    }
}

module.exports = { entregaModel };