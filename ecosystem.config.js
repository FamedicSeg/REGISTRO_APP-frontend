module.exports = {
    apps: [{
        name: "registro-app-frontend",
        script: "serve",
        args: "dist -l 8080 --single",
        cwd: "C:/Users/User/Desktop/PROYECTO_PRODUCCION/REGISTRO_APP frontend",    
        instances: 1,
        exec_mode: "fork",
    }]
}
