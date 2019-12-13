const userModel = require('../../../../models/user');
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const config = require('../../../../config')

exports.get = async function (query) {
    return await userModel.findOne(query);
}

exports.getAll = async function () {
    return await userModel.find().limit(2);
}

exports.register = async function (obj) {
    try {
        const { username, password } = obj
        let newUser = null
        const create = async (user) => {
            if (user) {
                throw new Error('username exists')
            } else {
                return await userModel.create(obj);
            }
        }     
        
        // count the number of the user
        const count = async (user) => {
            newUser = user
            return await userModel.count({}).exec()
        }
        // assign admin if count is 1
        const assign = async (count) => {
            if (count === 1) {
                return await newUser.assignAdmin()
            } else {
                // if not, return a promise that returns false
                return await Promise.resolve(false)
            }
        }
        // respond to the client
        const respond = (isAdmin) => {
            const result = {
                message: 'user registered successfully',
                timestamp: new Date().getTime(),
                admin: isAdmin ? true : false,
                "code": 200
            };
            return result;
        }
        // run when there is an error (username exists)
        const onError = (error) => {
            return {
                message: error.message,
                timestamp: new Date().getTime(),
                "code": 409
            };
        }
        // check username duplication
        return await userModel.findOneByUsername(username)
            .then(create)
            .then(count)
            .then(assign)
            .then(respond)
            .catch(onError)

    }
    catch (ex) {
        throw ex;
    }

}

exports.login = async function (body, jwtSecret) {
    try {
        const { username, password } = body
        const secret = jwtSecret;
        // check the user info & generate the jwt
        const check = async (user) => {
            if (!user) {
                // user does not exist
                throw new Error('login failed')
            } else {
                // user exists, check the password
                if (user.verify(password)) {
                    // create a promise that generates jwt asynchronously
                    const p = new Promise((resolve, reject) => {
                        jwt.sign(
                            {
                                _id: user._id,
                                username: user.username,
                                admin: user.admin
                            },
                            secret,
                            {
                                expiresIn: '7d',
                                issuer: 'velopert.com',
                                subject: 'userInfo'
                            }, (err, token) => {
                                if (err) reject(err)
                                resolve(token)
                            })
                    })
                    return await p
                } else {
                    throw new Error('login failed')
                }
            }
        }

        // respond the token 
        const respond = (token) => {
            const result = {
                message: 'logged in successfully',
                timestamp: new Date().getTime(),
                "code": 200,
                token
            };
            return result;
        }

        // error occured
        const onError = (error) => {
            return {
                message: error.message,
                timestamp: new Date().getTime(),
                "code": 403
            };
        }

        // find the user
        return await userModel.findOneByUsername(username)
            .then(check)
            .then(respond)
            .catch(onError)

    }
    catch (ex) {
        throw ex;
    }
}

exports.changepassword = async function (data) {
    // respond to the client
    const respond = (isAdmin) => {
        const result = {
            message: 'password updated successfully',
            timestamp: new Date().getTime(),
            "code": 200
        };
        return result;
    }

    const encrypted = crypto.createHmac('sha1', config.secret)
        .update(data.password)
        .digest('base64')
    data.password = encrypted;
    return await userModel.updateOne({ "username": data.username }, { $set: { "password": data.password } }).then(respond);
}