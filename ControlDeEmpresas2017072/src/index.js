'use strict'

const mongoose = require('mongoose');
const app = require('./app')
var bcrypt = require('bcrypt-nodejs');
var User = require('./models/user');

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/ControlDeEmpresasDb' , {useNewUrlParser: true}).then(()=>{
    console.log('Se encuentra conenctado a la base de datos Control De Empresas');

    app.set('port', process.env.PORT || 3000);
    app.listen(app.get('port'), ()=>{
        console.log(`El servidor esta corriendo en el puerto: '${app.get('port')}'`);
    })
}).catch(err => console.log(err));


/*----------USUARIO ADMIN POR DEFAULT----------*/
var user = new User();

function crearUsuarioAdmin(){
    
    user.nombre = 'admin';
    user.usuario = 'admin';
    user.email = 'admin';
    user.password = 'admin';
    user.rol = 'admin';
    user.image = null;

    bcrypt.hash('admin', null, null, (err, hash) => {
        user.password = hash;
        
        user.save();

    })                    
}

    User.find({email: 'admin'}).exec((err, users) => {
        if(users && users.length >= 1){
        }else{
            crearUsuarioAdmin();
        }
    });

   

