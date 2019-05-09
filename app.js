const express = require('express')
const morgan = require('morgan')
const mysql = require('promise-mysql')
const config = require('./assets/config')
const {success, error, checkAndChange} = require('./assets/functions')
const bodyParser = require('body-parser')



mysql.createConnection({
    host     : config.db.host,
    port     : config.db.port,
    user     : config.db.user,
    password : config.db.password,
    database : config.db.database
}).then((db)=>{
    console.log('Connected ');   
        
    const app = express()
        
    let MembersRouter = express.Router()
    let Members = require('./assets/classes/members-class')(db,config)

    app.use((morgan('dev')))
    app.use(bodyParser.json()); 
    app.use(bodyParser.urlencoded({ extended: true })); 



    MembersRouter.route('/:id')

    //récupère un membre avec son id en param

        .get(async (req,res) =>{

            let member = await Members.getById(req.params.id)

            res.json(checkAndChange(member))

        })


    //modifie un membre par id
        .put(async (req,res) =>{

            let updateMember = await Members.update(req.params.id, req.body.name)
            
            res.json(checkAndChange(updateMember))
        })


    //supprime un membre par id
        .delete(async (req,res) =>{

            let deleteMember = await Members.delete(req.params.id)

            res.json(checkAndChange(deleteMember))

        })


    MembersRouter.route('/')

    //récupère tous les membres

        .get(async (req,res)=>{

            let allMembers = await Members.getAll(req.query.max)
            res.json(checkAndChange(allMembers))

        })

        //ajoute un membre


        .post(async (req,res)=>{

            let addMember = await Members.Add(req.body.name)

            res.json(checkAndChange(addMember))

        })



    app.use(config.rootAPI + 'members', MembersRouter)


    .listen(config.port, () => {
        console.log('started on port 8080')
    })

}).catch((err)=>{
    console.log('error during db connexion')
    console.log(err.message)
})








