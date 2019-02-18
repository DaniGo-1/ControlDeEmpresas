'use strict'

var express = require('express');
var userController = require('../controllers/userController');
var md_auth = require('../middleware/autheticated');


var multiparty = require('connect-multiparty');
var md_subir = multiparty({uploadDir: './src/uploads/users'});

let api = express.Router();


api.post('/login', userController.login);
api.post('/registrar',md_auth.ensureAuth , userController.registrar);
api.get('/listar-usuario' , userController.listarUsers);
api.put('/editar-usuario/:id', md_auth.ensureAuth, userController.editarUsuario);
api.delete('/eliminar-usuario/:id', md_auth.ensureAuth, userController.eliminarUsuario);
api.post('/subir-imagen-usuario/:id', [md_auth.ensureAuth, md_subir], userController.subirImagenUsuario);
api.get('/obtener-imagen-usuario/:nombreImagenUser', userController.obtenerImagenUsuario);
module.exports = api;