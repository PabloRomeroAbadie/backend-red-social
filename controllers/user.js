//importar dependencias y modulos
const bcrypt = require('bcrypt');
//importar modelos
const User = require('../models/user');
//importar servicios
const jwt = require('../services/jwt')


//acciones de prueba
const pruebaUser = (req, res) => {
    return res.status(200).send({
        mensaje: "Mensaje enviado desde: controllers/user.js",
        usuario: req.user
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

        if (existingUser) {
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

const login = async (req, res) => {
    //recoger parametros body
    let params = req.body;

    if (!params.email || !params.password) {
        return res.status(400).send({
            status: "error",
            mensaje: "faltan datos por enviar"
        })
    }

    try {
        //buscar en la bd si existe
        let user = await User.findOne({ email: params.email }) //.select({ "password": 0 })

        if (!user) return res.status(404).send({ status: "error", mensaje: "No existe el usuario" });

        //comprobar su contraseña
        const pwd = bcrypt.compareSync(params.password, user.password )

        if(!pwd) return res.status(400).send({status:"error",mensaje:"No te has identificado correctamente"});

        //Conseguir token
        const token = jwt.createToken(user);

        //devolver datos del usuario
        return res.status(200).send({
            status: "success",
            mensaje: "Te has identificado correctamente",
            user: {
                id: user._id,
                name: user.name,
                nick: user.nick
            },
            token
        })
    } catch (error) {
        console.log(error);
    }

}


//exportar acciones
module.exports = {
    pruebaUser,
    register,
    login
}