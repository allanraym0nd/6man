import Redis from 'ioredis'
import dotenv from 'dotenv';

dotenv.config()

class RedisClient {
    constructor(){
        this.client = null // stores the ioredis client instance
        this.isConnected = false // tracks the connection status 
    }

    async connect() {
        try{
            this.client = new Redis({
                host: process.env.REDIS_HOST || 'localhost',
                port: process.env.REDIS_PORT || 6379,
                password: process.env.REDIS_PASSWORD,
                db:0,
                retryDelayOnFailover:100,
                maxRetriesPerRequest:3,

                connectTimeout:10000,
                commandTimeout:5000,
                lazyrequest: true,
                keepAlive:30000,

            })

            // event listeners

            this.client.on('connect', () => {
                console.log('Redis connected')
                this.isConnected = true

            })
            this.client.on('error', (err) => {
                console.log('Redis error', err)
                this.isConnected = false

            })

               this.client.on('close', () => {
                console.log('Redis connection closed');
                this.isConnected = false;
            });

            await this.client.ping();

        }catch(error) {
            console.error('Redis connection failed', error)
            this.client= null;

        }
    }

    async get(key) { 
        if(!this.isConnected) return null

        try {
            const result = await this.client.get(key) // (key-value db)
            return result ? JSON.parse(result) : null; 

        }catch(error){ 
              console.error('Redis get error:', error);
              return null
        }
    }

    async set(key,value, ttl=3600) {
        if (!this.isConnected) return false;
        try{
            await this.client.setex(key, ttl, JSON.stringify(value)) // stores data. "set this key w a value"
            return true; 
        }catch(error){
             console.error('Redis set error:', error);
             return false;
        }
    }

    async delete(key) {
        if(!this.isConnected) return false; 
        try {
            await this.client.del(key)
            return true; 
        }catch(error) {
            console.error('Redis delete error:', error);
        }
    }

    async incrementRateLimit(key, window=900){ // this is a different key refers to a unique string used to identify and track a single client's actions
         if (!this.isConnected) return {count:0 , ttl: 0}

         try{ 
            const multi = this.client.multi() // multi begins a redis transaction. -> ensures no race conditions when multiple requests hit at the same time.
            multi.incr(key)
            multi.expire(key,window)
            const results = await multi.exec()

             const count = results[0][1];
             const ttl = await this.client.ttl(key)

               return { count, ttl };

          }catch(error){ 

             console.error('Rate limit error:', error);
             return {count:0, ttl:0}

         }
    }

    async disconnect(){
        if(this.client){
            await this.client.quit()
             this.isConnected = false;
        }

    }
}

   const redisClient = new RedisClient()

export default redisClient;