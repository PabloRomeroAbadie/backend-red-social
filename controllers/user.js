
//acciones de prueba
const pruebaUser = (req, res) => {
    return res.status(200).send({
        mensaje:"Mensaje enviado desde: controllers/user.js"
    })
}

//exportar acciones
module.exports = {
    pruebaUser
}