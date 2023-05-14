const db = require('./database/db.json')
const jwt = require('./utils/jwt.js')
module.exports = async function (req, res, next){

    try{

        let { authorization } = req.headers

        req.user = {
            is_authenticated:false
        }
        if (!authorization){
            return next()
        }

        authorization = authorization.split(' ')[1]
        let result = await jwt.verify(authorization)
        if (result){
            let {sub} = result
            let query = db.users.find(x=>x.id == sub)
            if (query){
                req.user = query
                req.user.is_authenticated = true
            }
        }
        next()
    }
    catch(E){
        next()
    }

}