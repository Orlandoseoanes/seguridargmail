const express = require("express");
const cors = require("cors");
require('dotenv').config();
const conectarDB=require("../app/conexion")
const app = express();

// Configurar middleware
app.use(cors());

conectarDB();

app.get('/',(req,res)=>{
  res.send('express')
})
app.use(express.json());

const userRouter=require('../router/UserRouter')
app.use('/api/users', userRouter);

const MessageRouter=require("../router/MessageRouter")
app.use('/api/message',MessageRouter)



module.exports =  app ;