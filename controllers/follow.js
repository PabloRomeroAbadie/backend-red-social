//acciones de prueba
const pruebaFollow = (req, res) => {
    return res.status(200).send({
        mensaje:"Mensaje enviado desde: controllers/follow.js"
    })
}

//exportar acciones
module.exports = {
    pruebaFollow
}