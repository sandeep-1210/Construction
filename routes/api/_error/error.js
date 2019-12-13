
exports.prepareErrorObject = function (err) {    
    let statusCode = err.statusCode ? err.statusCode : 500;    
    return  {
        "error": {           
            "errorMessage": err.message,
            "errorText": "something went wrong",
            "timestamp": new Date().getTime()
        },
        code : statusCode
    }
}