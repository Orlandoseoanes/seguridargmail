const express = require("express");
const router = express.Router();
const Message = require("../app/models/Message");

router.post("/Enviarmensaje", async (req, res) => {
    try {
        const { sender, receiver, content } = req.body;

        // Validación de la entrada
        if (!sender || typeof sender !== 'string' || !sender.trim()) {
            return res.status(400).json({
                success: false,
                message: "El campo 'sender' es obligatorio y debe ser un string no vacío"
            });
        }

        if (!receiver || typeof receiver !== 'string' || !receiver.trim()) {
            return res.status(400).json({
                success: false,
                message: "El campo 'receiver' es obligatorio y debe ser un string no vacío"
            });
        }

        if (!content || typeof content !== 'string' || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: "El campo 'content' es obligatorio y debe ser un string no vacío"
            });
        }

        // Validar longitud máxima de los campos
        if (content.length > 5000) {
            return res.status(400).json({
                success: false,
                message: "El contenido del mensaje excede el límite permitido"
            });
        }

        // Crear el nuevo mensaje
        const newMessage = new Message({
            sender: sender.trim(),
            receiver: receiver.trim(),
            content: content.trim(),
            state: "sent"
        });

        // Guardar el mensaje
        const savedMessage = await newMessage.save();

        res.status(201).json({
            success: true,
            message: "Mensaje enviado correctamente",
            data: {
                messageId: savedMessage._id,
                timestamp: savedMessage.timestamp,
                state: savedMessage.state
            }
        });

    } catch (error) {
        console.error("Error al enviar el mensaje:", error);
        res.status(500).json({
            success: false,
            message: "Error al enviar el mensaje",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
        });
    }
});

router.get("/conversacion/:user1/:user2", async (req, res) => {
    try {
        const { user1, user2 } = req.params;

        if (!user1 || !user2) {
            return res.status(400).json({
                success: false,
                message: "Se requieren ambos IDs de usuario"
            });
        }

        // Buscar mensajes entre los dos usuarios
        const messages = await Message.find({
            $or: [
                { sender: user1, receiver: user2 },
            ]
        }).sort({ timestamp: 1 }); // Ordenar por fecha ascendente para mostrar la conversación en orden

        // Desencriptar los mensajes
        const decryptedMessages = messages.map(message => {
            try {
                return {
                    id: message._id,
                    sender: message.sender,
                    receiver: message.receiver,
                    content: message.decryptContent(),
                    state: message.state,
                    timestamp: message.timestamp
                };
            } catch (error) {
                console.error(`Error al desencriptar mensaje ${message._id}:`, error);
                return {
                    id: message._id,
                    sender: message.sender,
                    receiver: message.receiver,
                    content: "[Error al desencriptar el mensaje]",
                    state: message.state,
                    timestamp: message.timestamp
                };
            }
        });

        res.status(200).json({
            success: true,
            message: "Conversación recuperada exitosamente",
            data: {
                count: decryptedMessages.length,
                messages: decryptedMessages
            }
        });

    } catch (error) {
        console.error("Error al obtener la conversación:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener la conversación",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
        });
    }
});

router.get("/Allmensages/:user", async (req, res) => {
    try {
        const { user } = req.params;

        if (!user || typeof user !== 'string' || !user.trim()) {
            return res.status(400).json({
                success: false,
                message: "Se requiere un ID de usuario válido"
            });
        }

        // Buscar mensajes recibidos por el usuario, ordenados por fecha descendente
        const messages = await Message.find({ receiver: user.trim(), state: "sent" })
            .sort({ timestamp: -1 });

        // Desencriptar los mensajes
        const decryptedMessages = messages.map(message => {
            try {
                return {
                    id: message._id,
                    sender: message.sender,
                    receiver: message.receiver,
                    content: message.decryptContent(),
                    state: message.state,
                    timestamp: message.timestamp
                };
            } catch (error) {
                console.error(`Error al desencriptar mensaje ${message._id}:`, error);
                return {
                    id: message._id,
                    sender: message.sender,
                    receiver: message.receiver,
                    content: "[Error al desencriptar el mensaje]",
                    state: message.state,
                    timestamp: message.timestamp
                };
            }
        });

        res.status(200).json({
            success: true,
            message: "Mensajes recuperados exitosamente",
            data: {
                count: decryptedMessages.length,
                messages: decryptedMessages
            }
        });

    } catch (error) {
        console.error("Error al obtener los mensajes:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener los mensajes",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
        });
    }
});


module.exports = router;