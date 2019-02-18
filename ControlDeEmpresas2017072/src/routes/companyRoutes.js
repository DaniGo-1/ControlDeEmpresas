'use strict'

var express = require('express');
var companyController = require('../controllers/companyController');
var md_auth = require('../middleware/autheticated');

var multiparty = require('connect-multiparty');
var md_subir = multiparty({uploadDir: './src/uploads/companies'});

let api = express.Router();

api.post('/ingresar-company',md_auth.ensureAuth, companyController.ingresarEmpresas);
api.put('/editar-empresa/:id',md_auth.ensureAuth, companyController.editarEmpresas);
api.delete('/eliminar-empresa/:id',md_auth.ensureAuth, companyController.eliminarEmpresa);
api.get('/buscar-empresa', md_auth.ensureAuth, companyController.buscarEmpresa);
api.get('/listar-empresas', md_auth.ensureAuth,companyController.listarEmpresas);
api.post('/subir-imagen-company/:id', [md_auth.ensureAuth , md_subir], companyController.subirImagenCompany);
api.get('/obtener-imagen-company/:nombreImagenCompany', companyController.obtenerImagenCompany);

module.exports = api;