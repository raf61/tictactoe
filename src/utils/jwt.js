const jwt = require('jsonwebtoken')
const secret = process.env.JWT_SECRET

module.exports = {
    sign({subject}){
        return new Promise((resolve, reject)=>{
            jwt.sign({}, secret, {expiresIn:60*60*24, subject}, (err, token)=>{
                if (err){
                    resolve(null)
                }else{
                    resolve(token)
                }
            })
        })
    },
    verify(token){
        return new Promise((resolve, reject)=>{
            jwt.verify(token, secret, (err, obj)=>{
                if (err){
                    resolve(null)
                }else{
                    resolve(obj)
                }
            })
        })
    }
}