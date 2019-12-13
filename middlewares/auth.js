const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
    // read the token from header or url 
    let token = req.headers['x-access-token'] || req.query.token || req.headers["authorization"];
    
    // token does not exist
    if(!token) {
        return res.status(403).json({
            success: false,
            message: 'not logged in'
        })
    }

    // create a promise that decodes the token
    token = req.headers['authorization'].substring(7, req.headers['authorization'].length);
    const p = new Promise(
        (resolve, reject) => {
            jwt.verify(token, req.app.get('jwt-secret'), (err, decoded) => {
                if(err) reject(err)
                resolve(decoded)
            })
        }
    )

    // if it has failed to verify, it will return an error message
    const onError = (error) => {
        res.status(403).json({
            success: false,
            message: error.message
        })
    }

    // process the promise to next()
    p.then((decoded)=>{
        req.decoded = decoded
        next()
    }).catch(onError)
}

module.exports = authMiddleware