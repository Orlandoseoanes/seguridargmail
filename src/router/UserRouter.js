const express = require("express");
const router = express.Router();
const User = require("../app/models/Users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Mejor práctica: mover la clave secreta a variables de entorno
const JWT_SECRET = process.env.JWT_SECRET || "esta_es_la_key";

// Registro de usuario
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validar que se proporcionaron todos los campos
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios",
      });
    }


    // Crear nuevo usuario
    const user = new User({ username, email, password });
    await user.save();

    // Generar token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "24h",
    });

    // Enviar respuesta
    res.status(201).json({
      message: "Usuario registrado exitosamente",
      user: user.toPublicJSON(),
      token,
    });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(400).json({
      message: "Error al registrar usuario",
      error: error.message,
    });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar campos
    if (!email || !password) {
      return res.status(400).json({
        message: "Email y contraseña son requeridos",
      });
    }

    // Buscar usuario y seleccionar la contraseña
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Credenciales inválidas",
      });
    }

    // Verificar contraseña
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Credenciales inválidas",
      });
    }

    // Generar token
    const token = jwt.sign(
      { userId: user._id, email: user.email, user: user.username },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login exitoso",
      token,
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({
      message: "Error al iniciar sesión",
      error: error.message,
    });
  }
});



//buscar usuario
router.get("/encontrarusuario/:user", async (req, res) => {
try{
    const userfinder = await User.findOne({ username: req.params.user });

    if(!userfinder){
        return res.status(404).json({
            message: "Usuario no encontrado",
            });
    }else{
        return res.status(200).json({
            message: "Usuario encontrado",
            user:{
                user:userfinder.username,
                email:userfinder.email
            }
        })
    }


}catch(error){
    console.error("Error en encontrar usuario:", error);
}
});




module.exports = router;
