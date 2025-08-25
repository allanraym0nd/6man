const errorHandler = (err,req,res,next) =>{

    let error ={...err}
    error.message = err.message

    console.error(err.stack) // shows exactly which file and line of code caused the error. helpful for server side debugging

    if(err.name === "CastError"){
        const message = "Resource not found"
        error = {message, statusCode: 404}

    }

    if(err.code === 11000){
        let message = " Duplicate field value"

        if(err.keyValue){
            const field = Object.keys(err.keyValue[0])
            const value= err.keyValue[field]
            message =  `${field} ${value}' already exists`
        }

        error = {message, statusCode:404}
    }

    if(err.name === "Validation error"){
   const message = Object.values(err.errors).map(error => error.message).join(',')   
    error = {message, statusCode:400}   
    }

    if(err.name === "JsonWebTokenError"){
        const message = "Invalid token"
        error = {message, statusCode:401}

    }

    if(err.name ==="TokenExpiredError"){
        const message = "Token Expired"
        error = {message, statusCode:401}
    }

    if(err.status === 429){
        const message = "Too many requests"
        error = {message, statusCode:429

        }
    }
    res.status(error.message || 500).json({
        success:false,
        error:{
            message: error.message || 'Server Error',
            ...(process.env.NODE_ENV === 'development' && {stack: err.stack}) 
        }

    })



}

export default errorHandler;