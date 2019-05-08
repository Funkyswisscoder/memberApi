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

                    

                }else{
                    res.json(error('no name value'))
                }


                let index = getIndex(req.params.id)

                if(typeof(index) == 'string'){
                    res.json(error(index))
                }else{

                    let same = false

                    for(let i = 0; i < members.length; i++){
                        if(req.body.name == members[i].name && req.params.id != members[i].id){
                            same = true
                            break

                        }
                    }


                    if(same){
                        res.json(error('same name'))
                    }else{
                        members[index].name = req.body.name;
                        res.json(success(true))
                    }


                }




            })


        //supprime un membre par id
            .delete((req,res) =>{
                let index = getIndex(req.params.id)

                if(typeof(index) == 'string'){
                    res.json(error(index))
                }else{
                    
                    members.splice(index,1)

                    res.json(success(members))


                }
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


function getIndex(id){
    for(let i = 0; i < members.length; i++){
        if(members[i].id == id)
        return i
    }
    return 'wrong id'
}

function createId(){
    return members[members.length-1].id+1
}        



