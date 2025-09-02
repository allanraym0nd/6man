import rateLimit from 'express-rate-limit'

const generalRateLimit = rateLimit({
    windowMs: 15*60*1000,
    max:100,
    message:{
        error:"Too many requests from this IP, Try again in 15 Minutes"
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false // Disable the `X-RateLimit-*` headers
});

const authRateLimit = rateLimit({
    windowsMs: 15*60*1000,
    max:5,
    message: {
        error:"Too many authentication attempts, Try again in 15 mins"
    },
    skipSuccessfulRequests:true // dont count succesfull requests
    
});

const predictionRateLimit = rateLimit({
    windowsMs: 60*1000,
    max:10,
    message:{
        error: "Too many predictions created, please slow down"
    },
    keyGenerator: (req) => {
        return req.user?.id || req.ip //Rate limit by user ID if authenticated
    }
});

const statsRateLimit = rateLimit({
    windowsMs: 15*60*1000,
    max:50,
    message: {
        error: "Too many stats requests, please try again later"
    }
})

const passwordResetRateLimit = rateLimit({
    windowMs: 60*60*1000,
    max:3,
    message: {
        error:"Too many password reset attempts, please try again after 1 hour"
    }

})

const createRedisRateLimit = (redisClient) => { // the redisClient object is the connection to the database
    return rateLimit({
        store: {
            incr: async(key) => {
                const result= await redisClient.incrementRateLimit(`rate_limit:${key}`,900)
                return result.count ; 

            },
            decrement : () => {},
            resetKey: async(key) => {
                await redisClient.delete(`rate_limit:${key}`)
            }    
        },
        windowMs:15*60*1000,
        max:100
    });

}

const adaptiveRateLimit = redisClient.isConnected 
    ? createRedisRateLimit 
    : generalRateLimit

export {
    generalRateLimit,
    authRateLimit,
    predictionRateLimit,
    statsRateLimit,
    passwordResetRateLimit,
    createRedisRateLimit,
    adaptiveRateLimit,
    createRedisRateLimit as redisRateLimit

}





