const app = require("./app/app"); // Asegúrate de que app.js exporta tanto app como server
const conexionDb = require("./app/conexion");
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
