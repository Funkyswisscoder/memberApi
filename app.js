const express = require('express')
const morgan = require('morgan')
const mysql = require('mysql')
const config = require('./config')
const {success, error} = require('functions')
const bodyParser = require('body-parser')



const db = mysql.createConnection({
    host     : 'localhost',
    port     : '8889',
    user     : 'root',
    password : 'root',
    database : 'Members'
});


db.connect(function(err) {
    if (err) {
        console.error('error connecting: ' + err.message);


    }else{

        console.log('Connected as id ' + db.threadId);   
        
        const app = express()
            
        let MembersRouter = express.Router()

        app.use((morgan('dev')))
        app.use(bodyParser.json()); 
        app.use(bodyParser.urlencoded({ extended: true })); 



        MembersRouter.route('/:id')

        //récupère un membre avec son id en param

            .get((req,res) =>{

                //voir si ID existe

                db.query('SELECT * FROM Members WHERE id = ?', [req.params.id], (err, result) => {
                    if(err){
                        res.json(error(err.message))
                    }else{

                        if(result[0] != undefined){

                            res.json(success(result[0]))   

                        }else{

                            res.json(error('wrong ID'))

                        }


                    }
                })


            })


        //modifie un membre par id
            .put((req,res) =>{

                if(req.body.name){

                    db.query('SELECT * FROM Members WHERE id = ?', [req.params.id], (err, result) => {
                        if(err){
                            res.json(error(err.message))
                        }else{
    
                            if(result[0] != undefined){
    
                                db.query('SELECT * FROM Members WHERE name = ? AND id != ?', [req.body.name, req.params.id], (err,result) =>{

                                    if(err){
                                        res.json(error(err.message))
                                    }else{

                                        if(result[0] != undefined){
                                            res.json(error('same name'))
                                        }else {


                                            db.query('UPDATE Members SET name = ? WHERE id = ?', [req.body.name, req.params.id], (err,result) =>{

                                                if(err){
                                                    res.json(error(err.message))
                                                }else{

                                                    res.json(success(true))

                                                }
                                            })
                                        }
                                    }
                                })

                            }else{
    
                                res.json(error('wrong ID'))
    
                            }
                        }
                    })

                }else{
                    res.json(error('no name value'))
                }
            })


        //supprime un membre par id
            .delete((req,res) =>{

                db.query('SELECT * FROM Members WHERE id = ?', [req.params.id], (err, result) => {
                    if(err){
                        res.json(error(err.message))
                    }else{

                        if(result[0] != undefined){

                            db.query('DELETE FROM Members WHERE id = ?', [req.params.id], (err, result) =>{
                                if(err){
                                    res.json(error(err.message))
                                }else{
                                    res.json(success(true))
                                }
                            }) 

                        }else{

                            res.json(error('wrong ID'))

                        }


                    }
                })

            })


        MembersRouter.route('/')

        //récupère tous les membres

            .get((req,res)=>{
                if(req.query.max != undefined && req.query.max > 0){

                    db.query('SELECT * FROM Members LIMIT 0, ?', [req.query.max], (err,result)=>{
                        if(err){
                            res.json(error(err.message))

                        }else{
                            res.json(success(result))    
                        }
                    })

                }else if(req.query.max != undefined){

                    res.json(error('Wrong max value'))   

                }else {

                    db.query('SELECT * FROM Members', (err,result)=>{
                        if(err){
                            res.json(error(err.message))

                        }else{
                            res.json(success(result))    
                        }
                    })
     
                }

            })

            //ajoute un membre


            .post((req,res)=>{
                if(req.body.name){

                    db.query('SELECT * FROM Members WHERE name= ?', [req.body.name], (err,result)=>{
                        if(err){
                            res.json(error(err.message))
                        }else{
                            
                            if(result[0] != undefined){
                                res.json(error('name already taken'))
                            } else{

                                db.query('INSERT INTO Members(name) VALUES(?)', [req.body.name], (err,result) =>{
                                    if(err){
                                        res.json(error(err.message))
                                    } else{


                                        db.query('SELECT * FROM Members WHERE name = ?', [req.body.name], (err,result) =>{
                                           
                                            if(err){

                                                res.json(error(err.message))

                                            }else{
                                                res.json(success({
                                                    id: result[0].id,
                                                    name: result[0].name
                                                }))                                                
                                            }



                                        })



                                    }
                                })


                            }




                        }
                    })

                }else{
                    res.json(error('no name value'))
                }
            })



        app.use(config.rootAPI + 'members', MembersRouter)


        .listen(config.port, () => {
            console.log('started on port 8080')
        })


    }


});





