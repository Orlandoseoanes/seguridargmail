const mongoose = require("mongoose");

const uri = "mongodb+srv://SeoanesDB:Admin123@dbprueba.4mspl.mongodb.net/?retryWrites=true&w=majority&appName=DBprueba";

async function conectarDB() {
  try {
    // Conectar a MongoDB usando Mongoose
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('====================================');
    console.log(uri);
    console.log('====================================');
    console.log("Conectado exitosamente a MongoDB!");
  } catch (err) {
    console.error("Error conectando a MongoDB:", err);
    throw err;
  }
}

conectarDB().catch(console.dir);

module.exports = conectarDB;
