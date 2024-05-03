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
const unfollow = async (req, res) => {

    //recoger id de usuario identificado
    const userId = req.user.id;

    //recoger el id del usuario que sigo y quiero dar unfollow
    const followedId = req.params.id;

    //find de las coincidencias y hacer remove
    try {
        let removedFollow = await Follow.findOneAndDelete({
            "user": userId,
            "followed": followedId
        })

        if(removedFollow){
            return res.status(200).send({
                status:"success",
                message:"Se ha dejado de seguir al usuario correctamente",
            })
        }else{
            return res.status(404).send({
                status:"error",
                message:"No se encontro ningun seguimiento para eliminar"
            })
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "Error al dejar de seguir"});
    }
}

//accion de listado de usuarios que estoy siguiendo

//accion de listado de usuarios que me siguen

//exportar acciones
module.exports = {
    pruebaFollow, 
    save,
    unfollow
}