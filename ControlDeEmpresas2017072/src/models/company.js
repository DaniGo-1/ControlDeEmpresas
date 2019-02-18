'use strict'

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let companySchema = Schema({
    nombre: String,
    email: String,
    telefono: String,
    direccion: String,
    image : String
});

module.exports = mongoose.model('Company', companySchema);