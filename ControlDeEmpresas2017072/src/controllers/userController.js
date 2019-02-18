'use strict'

var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');
var jwt = require('../services/jwt');
var path = require('path');
var fs = require('fs');
var ignoreCase = require('ignore-case');


/*----------REGISTRO DE USUARIO----------*/

function registrar(req, res){
    let user = new User();
    let params  = req.body;

    if((ignoreCase.equals(req.user.rol , 'admin')) === false ){
        return res.status(500).send({message: 'No tiene los permisos del administrador'});
    }else{   
        if(params.usuario && params.password && params.email){
            user.usuario = params.usuario;
            user.email = params.email;
            user.password = params.password;
            user.rol = 'user';
            user.image = null;
        
            User.find(
                {$or: 
                    [
                        {email : user.email.toLowerCase()}, 
                        {email : user.email.toUpperCase()},
                        {usuario: user.usuario.toLowerCase()},
                        {usuario: user.usuario.toUpperCase()}
                    ]
                }
            ).exec((err, users) => {
                if(err) return res.status(500).send({message : 'Error en la peticion del usuario'});
    
                if(users && users.length >= 1){
                    return res.status(500).send({message : 'El usuario ya existe en el sistema'});
                }else{
                    bcrypt.hash(params.password, null, null, (err, hash) => {
                        user.password = hash;
                        user.save((err, usuarioGuardado) => {
                            if(err) return res.status(500).send({message : 'Error al guardar!'})
    
                            usuarioGuardado 
                            ? res.status(200).send({user: usuarioGuardado})
                            : res.status(404).send({message : 'No se ha podido registrar el usuario'});
                          
                        })
                    })
                }
            })
    
        }else{
            res.status(200).send({message : 'Ingrese los campos necesarios!'});
        }
    }
    
}

/* LISTAR USUARIOS */

function listarUsers(req , res){

    User.find((err, users) => {
        if(err) return res.status(500).send({message : 'Error de peticion'});

        if(users.length === 0) return res.status(500).send({message : 'No existen usuarios en el sistema!'});

        return res.status(200).send({user : users})
    })


}

/*----------LOGIN DE USUARIO-----------*/ 

function login(req, res){
    let params = req.body;
    let emailEntered = params.email;
    let passwordEntered = params.password;

    User.findOne({email: emailEntered} , (err, user)=>{
        if(err) return res.status(500).send({message : 'Error de peticion'});

        if(user){
            bcrypt.compare(passwordEntered, user.password, (err, check) => {
                if(check){

                    if(params.gettoken){
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        })
                    }else{
                        user.password = undefined;
                        return res.status(200).send({user});
                    }
                
                }else{
                    return res.status(404).send({message : 'El usuario no existe'})
                }
            })
           
        }else{
            return res.status(404).send({message: 'El usuario no se ha podido logear'});
        }
            
    });
};

/*---------UPDATE DE USUARIO----------*/

function editarUsuario(req, res){
    let params = req.body;
    let userId = req.params.id;
    let permitir = 0;

    delete params.password;
   
    if(userId != req.user.sub){

        permitir = 1;

        if((ignoreCase.equals(req.user.rol , 'admin')) === false ){
            return res.status(500).send({message: 'No tiene los permisos del administrador'});
        }else{
            permitir = 0;
        }     
    }

    if(permitir === 0){  

        User.findByIdAndUpdate(userId,params,{new: true},(err, usuarioActualizado) => {
            if(err) return res.status(500).send({message: 'error en la peticion'});
    
            if(!usuarioActualizado) return res.status(404).send({message: 'No se ha podido actualizar el usuario'});
        
            return res.status(200).send({user: usuarioActualizado});
        })
    }
}

/*----------DELETE DE USUARIO----------*/

function eliminarUsuario(req, res){
    var params = req.body;
    var userId = req.params.id;
    var permitir = 0;
    

    if(userId != req.user.sub){
        
        permitir = 1;

        if((ignoreCase.equals(req.user.rol , 'admin')) === false ){
            return res.status(500).send({message: 'No tiene los permisos del administrador'});
        }else{
            permitir = 0;
        }     
    }

    User.findById(userId, (err, usuarios) => {
        if(ignoreCase.equals(usuarios.rol, 'admin')){  
            res.status(500).send({message: 'No es permitido eliminar administradores'});
        }else if(permitir === 0){
            User.findByIdAndDelete(userId, (err, usuarioEliminado) => {
                if(err) return res.status(500).send({message: 'error en la peticion'});
            
                if(!usuarioEliminado) return res.status(404).send({message: 'No se ha podido eliminar el usuario'});
            
                return res.status(200).send({message : 'Usuario Eliminado'})
            })  
        }
    });
    
    
    
}

/**--------------Subir imagen de usuario-------------- */

function subirImagenUsuario(req, res){
    var userId = req.user.sub;

    if(req.files){
        var file_path = req.files.image.path;
        console.log('----------------------------------');
        console.log(file_path);
        console.log('----------------------------------');
        var file_split = file_path.split('\\');
        console.log(file_split);
        console.log('----------------------------------');
        var file_name = file_split[3];
        console.log(file_name);
        console.log('----------------------------------');
        var ext_split = file_name.split('\.');
        console.log(ext_split);
        var file_ext = ext_split[1];
        console.log(file_ext);
        console.log('----------------------------------');

        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){
            User.findByIdAndUpdate(userId, {image: file_name}, {new: true}, (err, usuarioActualizado)=>{
                if(err) return res.status(500).send({message: 'No se ha podido actualizar el usuario'});

                if(!usuarioActualizado) return res.status(404).send({message: 'error en los datos del usuario, no se pudo actualizar'});

                return res.status(202).send({user: usuarioActualizado});
            })
        }else{
            return removeFilesOfUpload(res, file_path, 'extension no valida');
        }
    }
}

function removeFilesOfUpload(res, file_path, message){
    fs.unlink(file_path, (err) => {
        return res.status(200).send({message: message});
    })
}

function obtenerImagenUsuario(req, res){
    var image_file = req.params.nombreImagenUser;
    var path_file = './src/uploads/users/' + image_file;

    fs.exists(path_file,(exists) => {
        if(exists){
            res.sendFile(path.resolve(path_file));
        }else{
            res.status(200).send({message: 'no existe la imagen'})
        }
    })
}


module.exports = {
    registrar, 
    login,
    editarUsuario,
    eliminarUsuario,
    subirImagenUsuario,
    obtenerImagenUsuario,
    listarUsers
};