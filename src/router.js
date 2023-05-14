const router = require('express').Router()
const jwt = require('./utils/jwt.js')
const db = require('./database/db.json')

router.post('/login', async (req, res)=>{
    try{

        
        let {email, password} = req.body
        let query = db.users.find(x=>x.email == email && x.password == password)
        
        if (!query){
            return res.json({success:false})
        }
        const token = await jwt.sign({subject:query.id.toString()})
        return res.json({
            success:true, 
            token,
            user:{
                email:query.email,
                id:query.id
            }
        })
    }
    catch(E){
        console.log(E)
        return res.json({success:false})
    }
    
})

router.get('/status', async (req, res)=>{
    try{
        let {email, id, is_authenticated} = req.user

        return res.json({
            id,
            email,
            is_authenticated
        })

    }
    catch(E){
        return res.json({success:false})
    }
    
})

module.exports = router