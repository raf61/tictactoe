const jwt = require('jsonwebtoken')
const secret = '02c75751c71x13xz-73cc1m-202cc34n75qc48n6v548n9wtfcf4m6f2d2dCC428Mmc48m4c84c8mc8mc4cc--12mcmc5744444c32c892y482'

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