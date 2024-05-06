//importar modelo
const Follow = require('../models/follow');
const User = require('../models/user');

//importar dependencias
const mongoosePaginate = require('mongoose-paginate');

//importar servicio
const followService = require('../services/followService')

//acciones de prueba
const pruebaFollow = (req, res) => {
    return res.status(200).send({
        mensaje: "Mensaje enviado desde: controllers/follow.js"
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

        if (!followStored) {
            return res.status(500).send({
                status: "error",
                message: "No se ha podido seguir al usuario"

            })
        }

        return res.status(200).send({
            status: "success",
            identity: req.user,
            follow: followStored
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "Error al seguir" });
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

        if (removedFollow) {
            return res.status(200).send({
                status: "success",
                message: "Se ha dejado de seguir al usuario correctamente",
            })
        } else {
            return res.status(404).send({
                status: "error",
                message: "No se encontro ningun seguimiento para eliminar"
            })
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "Error al dejar de seguir" });
    }
}

//accion de listado de usuarios que cualquier usuario esta siguiendo (siguiendo)
const following = async (req, res) => {

    //sacar el id del usuario identificado
    let userId = req.user.id;

    //comprobar si me llega el id por parametro en url
    if (req.params.id) userId = req.params.id

    //comprobar si me llega la pagina, si no la pagina 1
    let page = 1;

    if (req.params.page) page = req.params.page

    //indicar cuantos usuarios por pagina quiero mostrar
    const itemPerPage = 5;

    try {
        //find a follow, popular los datos de los usuarios y paginar con moongose paginate
        const options = {
            page: page, // Número de página que deseas obtener
            limit: itemPerPage, // Cantidad de elementos por página
            populate: [{ path: 'user', select: '-password -role -__v' }, { path: 'followed', select: '-password -role -__v' }]
        };

        const query = await Follow.paginate({ user: userId }, options);
        
        //listado de usuarios de trinity, y soy pablo
        //sacar array de ids de los usuarios que me siguen y los que sigo como pablo (usuario identificado en ese momento)
        let followUserIds = await followService.followUserIds(req.user.id)
  

        return res.status(200).send({
            status: "success",
            message: "Listado de usuarios que estoy siguiendo",
            follows: query.docs,
            total: query.totalDocs,
            pages: query.totalPages,
            user_following: followUserIds.following,
            user_follow_me: followUserIds.followers
        })

    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al obtener los usuarios seguidos",
        });
    }
    
}



//accion de listado de usuarios que siguen a cualquier otro usuario (mis seguidores)
const followers = (req, res) => {
    return res.status(200).send({
        status: "success",
        message: "Listado de usuarios que me siguen"
    })
}

//exportar acciones
module.exports = {
    pruebaFollow,
    save,
    unfollow,
    following,
    followers
}