const config = {
    application: {
        cors: {
            server: [
                {
                    origin: "*", // Reemplaza con la URL de tu aplicación frontend
                    credentials: true
                }
            ]
        }
    }
}

module.exports = config;