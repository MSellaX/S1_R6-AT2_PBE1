require("dotenv").config();
const express = require("express");
const app = express();
const PORT = 8081;
const { clienteRoutes } = require("./src/routes/clienteRoutes");
const { pedidoRoutes } = require("./src/routes/pedidoRoutes");
const { entregaRoutes } = require("./src/routes/entregaRoutes");

app.use(express.json());

app.use("/", clienteRoutes);
app.use("/", pedidoRoutes);
app.use("/", entregaRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
