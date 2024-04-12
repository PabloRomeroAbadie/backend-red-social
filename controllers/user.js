//importar dependencias y modulos
const bcrypt = require('bcrypt');
const User = require('../models/user');
const { param } = require('../routes/user');

//acciones de prueba
const pruebaUser = (req, res) => {
    return res.status(200).send({
        mensaje: "Mensaje enviado desde: controllers/user.js"
    })
}

//registro de usuarios
const register = async (req, res) => {
    // recoger datos de la petición
    let params = req.body;

    // comprobar que me llegan bien (+ validación)
    if (!params.name || !params.email || !params.password || !params.nick) {
        return res.status(400).json({
            status: "error",
            mensaje: "Faltan datos por enviar"
        });
    }
    console.log(params);

    try {
        // control de usuarios duplicados 
        let existingUser = await User.findOne({ $or: [{ email: params.email }, { nick: params.nick }] });

        if(existingUser) {
            return res.status(200).send({
                status: "success",
                mensaje: "El usuario ya existe"
            });
        }

        // cifrar la contraseña 
        let pwd = await bcrypt.hash(params.password, 10)
        params.password = pwd;

        // crear objeto de usuario
        let user_to_save = new User(params);

        // Guardar usuario en la base de datos 
        await user_to_save.save();


        // devolver resultado
        return res.status(200).json({
            status: "success",
            mensaje: "Usuario registrado correctamente",
            user_to_save
        });


    } catch (error) {
        return res.status(500).json({ status: "error", mensaje: "Error en la consulta de usuarios" });
    }
}


//exportar acciones
module.exports = {
    pruebaUser,
    register
}