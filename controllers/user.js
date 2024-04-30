//importar dependencias y modulos
const bcrypt = require('bcrypt');
const mongoosePaginate = require('mongoose-paginate-v2');
const fs = require('fs');
const path = require('path')
//importar modelos
const User = require('../models/user');
//importar servicios
const jwt = require('../services/jwt');
const user = require('../models/user');


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
        const pwd = bcrypt.compareSync(params.password, user.password)

        if (!pwd) return res.status(400).send({ status: "error", mensaje: "No te has identificado correctamente" });

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

const profile = async (req, res) => {
    //recibir el parametro del id de usuario por la url
    const id = req.params.id;

    //consulta para sacar los datos del usuario
    try {
        const userProfile = await User.findById(id).select({ password: 0, role: 0 });

        if (!userProfile) {
            return res.status(404).send({
                status: "error",
                message: "El usuario no existe o hay un error"
            })
        }

        //devolver el resultado
        //posteriormente devolver informacion de follows (aun no esta hecha)
        return res.status(200).send({
            status: "success",
            user: userProfile
        })

    } catch (error) {
        console.log(error);
    }
}

const list = (req, res) => {
    // Controlar en qué página estamos
    let page = 1;
    if (req.params.page) {
        page = parseInt(req.params.page);
    }

    // Número de elementos por página
    const itemsPerPage = 5;

    // Consultar usuarios con paginación
    User.paginate({}, { page, limit: itemsPerPage, sort: '_id' }, (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({
                status: "error",
                message: "Hubo un error al procesar la solicitud"
            });
        }

        // Devolver resultado
        return res.status(200).json({
            status: "success",
            users: result.docs,
            page: result.page,
            itemsPerPage,
            total: result.totalDocs,
            pages: Math.ceil(result.totalDocs / itemsPerPage)
        });
    });
};

const update = async (req, res) => {
    try {
        // Recoger info del usuario a actualizar
        const userIdentity = req.user;
        let userToUpdate = req.body;

        // Eliminar campos sobrantes
        delete userIdentity.iat;
        delete userIdentity.exp;
        delete userIdentity.role;
        delete userIdentity.image;

        // Comprobar si el usuario ya existe
        const users = await User.find({ $or: [{ email: userToUpdate.email }, { nick: userToUpdate.nick }] });

        let userIsset = false;
        users.forEach(user => {
            if (user && user._id != userIdentity.id) userIsset = true;
        });

        if (userIsset) {
            return res.status(200).send({
                status: "success",
                mensaje: "El usuario ya existe"
            });
        }

        // Cifrar la contraseña 
        if (userToUpdate.password) {
            let pwd = await bcrypt.hash(userToUpdate.password, 10);
            userToUpdate.password = pwd;
        }

        // buscar y actualizar
        let userUpdated = await User.findByIdAndUpdate(userIdentity.id, userToUpdate, { new: true })

        if (!userUpdated) return res.status(500).json({ status: "error", mensaje: "Error al actualizar" })

        //devolver respuesta
        return res.status(200).send({
            status: "success",
            message: "Metodo de actualizar usuario",
            user: userUpdated
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "Error al actualizar" });
    }
};

const upload = async (req, res) => {

    //recoger el fichero de imagen y comprobar que existe 
    if (!req.file) {
        return res.status(404).send({
            status: "error",
            message: "Peticion no incluye la imagen"
        })
    }

    //conseguir el nombre del archivo
    let image = req.file.originalname;

    //sacar extension del archivo
    const imageSplit = image.split("\.");
    const extension = imageSplit[1];

    //comprobar extension
    if (extension != "png" && extension != "jpg" && extension != "jpeg" && extension != "gif") {

        //borrar archivo subido
        const filePath = req.file.path
        const fileDeleted = fs.unlinkSync(filePath);

        //devolver respuesta negativa
        return res.status(400).send({
            status: "error",
            message: "extension del fichero invalida"
        })
    }

    //si si es correcta, guardar imagen en base de datos
    let userUpdated = await User.findOneAndUpdate({ _id: req.user.id }, { image: req.file.filename }, { new: true })

    if (!userUpdated) {
        return res.status(500).send({
            status: "error",
            message: "Error en la subida de avatar"
        })
    }

    //devolver respuesta 
    return res.status(200).send({
        status: "success",
        user: userUpdated,
        file: req.file,
    })
}

const avatar = (req, res) => {

    //sacar el parametro de la url
    const file = req.params.file;

    //montar el path real de la imagen 
    const filePath = "./uploads/avatars/" + file;

    //comprobar que el archivo existe
    fs.stat(filePath, (error, exist) => {
        if (!exist) {
            return res.status(404).send({
                status: "error",
                message: "No existe la imagen"
            })
        }

        //devolver un file
        return res.sendFile(path.resolve(filePath));
    })
}

//exportar acciones
module.exports = {
    pruebaUser,
    register,
    login,
    profile,
    list,
    update,
    upload,
    avatar
}

