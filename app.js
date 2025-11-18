require("dotenv").config();
const express = require("express");
const app = express();
const PORT = 8081;
const { clienteRoutes } = require("./src/routes/clienteRoutes");

app.use(express.json());

app.use("/", clienteRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
