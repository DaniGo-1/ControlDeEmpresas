'use strict'

var Company = require('../models/company');
var ignoreCase = require('ignore-case');
var includes = require('includes');
var path = require('path');
var fs = require('fs');


/*----------Ingresar Empresas----------*/

function ingresarEmpresas(req, res){
    let company = new Company();    
    let params = req.body;

    if((ignoreCase.equals(req.user.rol , 'admin')) === false ){
        return res.status(500).send({message: 'No tiene los permisos del administrador para agregar empresas'});
    }else{  

        if(params.nombre && params.email && params.telefono && params.direccion){
            company.nombre = params.nombre;
            company.email = params.email;
            company.telefono = params.telefono;
            company.direccion = params.direccion
            company.image = null

            Company.find({
                $or:[
                    {nombre : company.nombre},
                    {email : company.email},
                    {telefono : company.telefono},
                    {direccion : company.direccion}
                ]
            }).exec((err, companies) => {

                if(err) return res.status(500).send({message : 'Error en la peticion'});

                if(companies && companies.length >= 1){
                    return res.status(500).send({message : 'Datos de esta empresa ya existe en el sistema'});
                }else{
                    company.save((err , companyGuardada) => {
                        if(err) return res.status(500).send({message : 'Error al guardar!'})

                        companyGuardada 
                        ? res.status(200).send({company: companyGuardada})
                        : res.status(404).send({message : 'No se ha podido ingresar la empresa'});
                    });
                }
            });

        }else{
            res.status(200).send({message: 'Ingrese todos los campos'});
        }
    }
}

/*----------- Modificar Empresas ----------*/

function editarEmpresas(req, res){
    let params = req.body;
    let companyId = req.params.id;

    if(req.user.sub === false){
        return res.status(500).send({message : 'No tiene los permisos para editar esta empresa'});
    }

    if((ignoreCase.equals(req.user.rol , 'admin')) === false ){
        return res.status(500).send({message: 'No tiene los permisos del administrador para editar empresas'});
    }else{  
        Company.findByIdAndUpdate(companyId,params,{new : true},(err, empresaActualizada)=>{
            if(err) return res.status(500).send({message : 'Error en la peticion'});

            if(!empresaActualizada) return res.status(404).send({message : 'No se ha podido actualizar la empresa'});

            res.status(200).send({company : empresaActualizada});
        });
    }
   
}

/*---------------Eliminar Empresas-------------------*/

function eliminarEmpresa(req, res){
    let companyId = req.params.id;

    if(req.user.sub === false){
        res.status(500).send({message : 'No tiene los permisos para editar esta empresa'})
    }
   
    if((ignoreCase.equals(req.user.rol, 'admin')) === false){
        return res.status(500).send({message: 'No tiene los permisos del administrador para eliminar empresas'});
    }else{   
        Company.findByIdAndDelete(companyId,(err, empresaEliminada)=>{
            if(err) return res.status(500).send({message: "error en la peticion 'Puede que el ID no exista'"});
        
            if(!empresaEliminada) return res.status(404).send({message: 'No se ha podido eliminar la empresa'});
        
            return res.status(200).send({message : 'Empresa eliminada'})
        });
    } 

    
}

/* ---------------- Elimina los diacriticos --------------------  */

var normalize = function eliminarDiacriticosEs(texto) {
    return texto
           .normalize('NFD')
           .replace(/([^n\u0300-\u036f]|n(?!\u0303(?![\u0300-\u036f])))[\u0300-\u036f]+/gi,"$1")
           .normalize();
}


/**-------------- Buscador De Empresas ------------------- **/

function buscarEmpresa(req, res){
    let name = req.body.nombre;

    if(req.user.sub === false){
        res.status(500).send({message : 'No tiene los permisos para buscar esta empresa'})
    }

    Company.find().exec((err, empresas)=>{
        
        if(err) return res.status(500).send({message: 'Error en la peticion'});
   
        let empresasEncontradas = [];
        let x = name.length;

        for(let i = 0; i < empresas.length; i++){
            if(normalize(empresas[i].nombre.toLowerCase().substring(0,x)).includes(normalize(name.toLowerCase(),0))){
                empresasEncontradas[i] = empresas[i];              
            }
        }

        if(empresas.length === 0) return res.status(404).send({message: 'No hay empresas con ese nombre'});

        if(empresasEncontradas.length === 0){
            res.status(404).send({message : 'No existen empresas con ese nombre'});
        }else{
            let y = 0;
            let coincidenciaDeEmpresas = [];
                for(let e = 0;e < empresasEncontradas.length; e++){
                    if(empresasEncontradas[e] != null){
                        coincidenciaDeEmpresas[y] = empresasEncontradas[e];
                        y++;
                    }
                }
            return res.status(200).send({company : coincidenciaDeEmpresas}); 
        } 
    });
}

/*-------------------- Listar Empresas ---------------------*/

function listarEmpresas(req, res){

    Company.find().exec((err, empresasRegistradas) => {
        if(err) return res.status(500).send({message : 'Error en la peticion'});

        if(!empresasRegistradas) return res.status(404).send({message : 'No se han encontrado empresas! :('})

        return res.status(200).send({companies : empresasRegistradas});
    });

}

/*---------------Subir imagen company------------------- */

function subirImagenCompany(req, res){
    var companyId = req.params.id;


    if((ignoreCase.equals(req.user.rol, 'admin')) === false){
        return res.status(500).send({message: 'No tiene los permisos del administrador para eliminar empresas'});
    }else{  
        if(req.files){

            var file_path = req.files.image.path;
            var file_split = file_path.split('\\');
            var file_name = file_split[3];
            var ext_split = file_name.split('\.');
            var file_ext = ext_split[1];

            if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){

                Company.findByIdAndUpdate(companyId, {image: file_name}, {new: true}, (err , companyActualizada) => {
                    if(err) return res.status(500).send({message: 'No se ha podido actualizar la empresa'});

                    if(!companyActualizada) return res.status(404).send({message: 'error en los datos de la empresa, no se pudo actualizar'});

                    return res.status(200).send({companay : companyActualizada});
                })

            }else{
                return removeFilesOfUpload(res, file_path, 'extension no valida');
            }
        }
    }
}

function removeFilesOfUpload(res, file_path, message){
    fs.unlink(file_path, (err) => {
        return res.status(200).send({message: message});
    })
}

function obtenerImagenCompany(req, res){
    var image_file = req.params.nombreImagenCompany;
    var path_file = './src/uploads/companies/' + image_file;

    fs.exists(path_file , (exists) =>{
        if(exists){
            res.sendFile(path.resolve(path_file));
        }else{
            res.status(200).send({message : 'No existe la imagen'});
        }
    })

}

module.exports = {
    ingresarEmpresas,
    editarEmpresas,
    eliminarEmpresa,
    buscarEmpresa,
    listarEmpresas,
    subirImagenCompany,
    obtenerImagenCompany
};