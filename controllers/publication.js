//acciones de prueba
const pruebaPublication = (req, res) => {
    return res.status(200).send({
        mensaje:"Mensaje enviado desde: controllers/publication.js"
    })
}

//exportar acciones
module.exports = {
    pruebaPublication
}