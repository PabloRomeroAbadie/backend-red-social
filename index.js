//importar dependencias 
const {connection} = require('./database/connection')
const express = require('express')
const cors = require('cors')

//mensaje bienvenida
console.log("API NODE PARA RED SOCIAL ARRANCADA!");

//conexion a la base de datos
connection();

//crear servidor node
const app = express();
const puerto = 3900;

//configurar cors
app.use(cors());

//convertir los datos del body a objeto js
//este middleware nos va decodificar los datos del body y si llegan con un content type app json, nos lo convierte en objeto json tal cual
app.use(express.json());
//decodificar los datos que nos lleguen en formato urlencoded y convertirlo en un objeto usable por javaScript 
app.use(express.urlencoded({extended:true}));

//cargar conf rutas

//ruta de prueba
app.get("/ruta-prueba", (req, res)=>{

    return res.status(200).send({
        "id":"1",
        "nombre": "Pablo Romero",
        "web": "pabloromeroa.es"
    })

})

//poner al servidor a escuchar peticiones http 
app.listen(puerto, ()=>{
    console.log("Servidor de node corriendo en el puert: "+puerto);
})