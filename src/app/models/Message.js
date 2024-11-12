const mongoose = require('mongoose');
const crypto = require('crypto');

// Constantes de configuración
const ENCRYPTION_CONFIG = {
    iterations: 100000,
    keyLength: 32,
    algorithm: 'aes-256-cbc'
};

const messageSchema = new mongoose.Schema({
    sender: {
        type: String,
        required: [true, 'Sender is required'],
        trim: true,
        maxlength: [100, 'Sender name too long']
    },
    receiver: {
        type: String,
        required: [true, 'Receiver is required'],
        trim: true,
        maxlength: [100, 'Receiver name too long']
    },
    content: {
        type: String,
        required: [true, 'Content is required'],
        maxlength: [5000, 'Message too long']
    },
    state: {
        type: String,
        required: true,
        enum: ['sent', 'delivered', 'read'],
        default: 'sent'
    },
    iv: {
        type: String,
        required: true,
        default: () => crypto.randomBytes(16).toString('hex') // Valor por defecto
    },
    keySalt: {
        type: String,
        required: true,
        default: () => crypto.randomBytes(16).toString('hex') // Valor por defecto
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Función para generar una clave segura
const generateSecureKey = (senderReceiver, salt) => {
    return crypto.pbkdf2Sync(
        senderReceiver,
        salt,
        ENCRYPTION_CONFIG.iterations,
        ENCRYPTION_CONFIG.keyLength,
        'sha256'
    );
};

// Pre-middleware para encriptar el contenido (modificado para ser síncrono)
messageSchema.pre('save', function(next) {
    if (!this.isModified('content')) {
        return next();
    }

    try {
        // Generar clave segura usando el keySalt que ya está establecido
        const key = generateSecureKey(this.sender + this.receiver, this.keySalt);
        
        // Usar el IV que ya está establecido
        const iv = Buffer.from(this.iv, 'hex');

        // Encriptar contenido
        const cipher = crypto.createCipheriv(ENCRYPTION_CONFIG.algorithm, key, iv);
        let encrypted = cipher.update(this.content, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        this.content = encrypted;
        next();
    } catch (error) {
        next(error);
    }
});

// Método para desencriptar el contenido
messageSchema.methods.decryptContent = function() {
    try {
        const key = generateSecureKey(this.sender + this.receiver, this.keySalt);
        const iv = Buffer.from(this.iv, 'hex');
        
        const decipher = crypto.createDecipheriv(ENCRYPTION_CONFIG.algorithm, key, iv);
        let decrypted = decipher.update(this.content, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        throw new Error(`Decryption error: ${error.message}`);
    }
};

// Índices para mejorar el rendimiento de las consultas
messageSchema.index({ sender: 1, timestamp: -1 });
messageSchema.index({ receiver: 1, timestamp: -1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;