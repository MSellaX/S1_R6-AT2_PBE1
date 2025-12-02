require("dotenv").config();

const express = require("express");
const app = express();

const { clienteRoutes } = require("./src/routes/clienteRoutes"); // Importa as rotas de clientes
const { pedidoRoutes } = require("./src/routes/pedidoRoutes");// Importa as rotas de pedidos
const { entregaRoutes } = require("./src/routes/entregaRoutes"); // Importa as rotas de entregas

const PORT = process.env.PORT || 8081; // Define a porta do servidor

app.use(express.json()); // Middleware para parsear JSON

app.use('/', clienteRoutes); // Usa as rotas de clientes
app.use('/', pedidoRoutes);// Usa as rotas de pedidos
app.use('/', entregaRoutes); // Usa as rotas de entregas



app.listen(PORT, () => { // Inicia o servidor
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
