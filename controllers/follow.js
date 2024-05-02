//importar modelo
const Follow = require('../models/follow');
const User = require('../models/user');

//acciones de prueba
const pruebaFollow = (req, res) => {
    return res.status(200).send({
        mensaje:"Mensaje enviado desde: controllers/follow.js"
    })
}

// accion de guardar un follow (accion seguir)
    const save = async (req, res) => {
        // conseguir datos por body
        const params = req.body;

        // sacar el id del usuario identificado
        const identity = req.user;

        // crear un objeto con modelo follow 
        let userToFollow = new Follow({
            user: identity.id,
            followed: params.followed
        });

        try {
            //guardar objeto en la base de datos
            const followStored = await userToFollow.save();

            if(!followStored){
                return res.status(500).send({
                    status:"error",
                    message:"No se ha podido seguir al usuario"

                })
            }

            return res.status(200).send({
                status:"success",
                identity: req.user,
                follow: followStored
            })
            
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: "error", message: "Error al seguir"});
        }

    }

//accion de borrar un follow (dejar de seguir)

//accion de listado de usuarios que estoy siguiendo

//accion de listado de usuarios que me siguen

//exportar acciones
module.exports = {
    pruebaFollow, 
    save
}