const jwt = require('jsonwebtoken')
const User = require('../../../models/user')
const services = require("../_services/user/index");
const error  = require("../_error/error");

/*
    POST /api/auth/register
    {
        username,
        password
    }
*/

exports.register = async (req, res) => {
    let response = {};
    try {
        const isAdminExit = await services.get({ "username": req.decoded.username });
        const adminCount = await services.getAll();
        if ((isAdminExit && isAdminExit.admin === true) || (adminCount.length == 0)) {
            // create a new user if does not exist
            response = await services.register(req.body);

        }
        else if (!isAdminExit) {
            response = {
                message: 'token expired',
                status: 'Log Out',
                timestamp: new Date().getTime(),
                "code": 401
            };
        }
        else {
            response = {
                message: 'does not have authorization to create new user',
                status: 'authorization Failed',
                timestamp: new Date().getTime(),
                "code": 403
            };
        }
    }
    catch (error) {
        response = error;
    }
    const code = response.code ? response.code : 500;
    delete response['code'];
    res.status(code).send(response);
}

/*
    POST /api/auth/login
    {
        username,
        password
    }
*/

exports.login = async(req, res) => {
    let response = {};
    try {
        response = await services.login(req.body,req.app.get('jwt-secret'));
    }
    catch (ex) {
        response = error.prepareErrorObject(ex);
    }
    const code = response.code ? response.code : 500;
    delete response['code'];
    res.status(code).send(response);
}

/*
    POST /api/auth/changepassword
    {
        username,
        password
    }
*/
exports.changepassword = async(req, res) => {
    let response = {};
    try {
        data = req.body;
        response = await services.changepassword(data);
    }
    catch (ex) {
        response = error.prepareErrorObject(ex);
    }
    const code = response.code ? response.code : 500;
    delete response['code'];
    res.status(code).send(response);
}

/*
    GET /api/auth/check
*/

exports.check = (req, res) => {
    res.json({
        success: true,
        info: req.decoded
    })
}