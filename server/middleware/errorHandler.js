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
        
    }

}