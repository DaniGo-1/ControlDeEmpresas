'use strict'

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
var user_routes = require('./routes/userRoutes');
var company_routes = require('./routes/companyRoutes');

app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());

app.use((req, res, next) => {

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Contect-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT,DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');

    next();
});

app.use('/api' , user_routes);
app.use('/api' , company_routes);

module.exports = app;



