const Publication = require('../models/publication');


//acciones de prueba
const pruebaPublication = (req, res) => {
    return res.status(200).send({
        mensaje:"Mensaje enviado desde: controllers/publication.js"
    })
}

// Guardar publicacion
const save = async (req, res) => {
    //Recoger datos del body
    const params = req.body;

    //Si no me llegan, dar respuesta negativa 
    if(!params.text){
        return res.status(400).send({
            status:"error",
            message:"Debes enviar el texto de la publicacion"
        })
    };

    try {
        //Crear y rellenar el objeto del modelo 
        let newPublication = new Publication(params);
        newPublication.user = req.user.id;
    
        //Guardar objeto en bbdd
        const publicationStored = await newPublication.save()
            if(!publicationStored){
                return res.status(400).send({
                    status:"error",
                    message:"No se ha guardado la publicacion"
                })
            }
        
            return res.status(200).send({
                status:"success",
                message:"Publicacion guardada",
                publicationStored
            })
        
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al guardar la publicacion"
        });
    }

}

// sacar una publicacion

// eliminar publicaciones

// Listar todas las publicaciones 

// Listar publicaciones de un usuario

// subir ficheros

// devolver archivos multimedia imagenes

//exportar acciones
module.exports = {
    pruebaPublication,
    save
}