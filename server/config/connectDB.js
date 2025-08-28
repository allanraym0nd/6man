import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const connectDb  = async() => {
    try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sixthman', {
        maxPoolSize: 10, // Maximum number of connections in the pool
        minPoolSize:2, // Minimum number of connections in the pool
        serverSelectionTimeouts:5000, // How long to try selecting a server
        socketTimeoutMS:45000, // How long a socket stays open with no activity
        connectTimeoutMS:10000, // How long to wait for initial connection
        bufferMaxEntries:0, // Disable mongoose buffering
        bufferCommands: false, // Disable mongoose buffering completely
        maxIdleTime:30000, // Close connections after 30 seconds of inactivity
        heartbeatFrequencyMS:10000, // Check server health every 10 seconds
    })

    console.log(`MongoDB connected: ${conn.connection.host}`)
    console.log(`Database: ${conn.connection.name}`)

    // connection event listeners
    mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err)
    })

    mongoose.connection.on('disconnect', () => {
        console.log('MongoDB disconnected. Attempting to reconnect...');
    })

    mongoose.connnection.on('reconnected', () => {
        console.log('MongoDB reconnected successfully');
    })

    mongoose.connection.on('close', () => {
        console.log('MongoDB connection closed');
    })

    const graceFullShutdown = async(signal) => {
        console.log(`Received ${signal}. Closing MongoDB connection...`);
        try {
            await mongoose.connection.close()
            console.log('MongoDB connection closed through app termination');
            process.exit(0)
        } catch(err) {
            console.error('Error closing MongoDB connection:', err);
            process.exit(1)
        }
    }

    //listen for termination signals
    process.on('SIGNT', () => graceFullShutdown('SIGNT'))
    process.on('SIGTERM', () => graceFullShutdown('SIGTERM')) // 'SIGTERM used by process managers and deployment platforms (like Docker, Kubernetes) to gracefully shut down an application.
    process.on('SIGUSR2', () => graceFullShutdown('SIGUSR2')) //  used by development tools like Nodemon to signal that the application is about to restart // avoid resource contention

    return conn; 


    }catch(error){
    console.error("Database connection failed", error.message)
        
    if(error.name === 'MongoServerSelectionError'){
        console.error('Could not connect to MongoDB server. Check if MongoDB is running.');
    } else if(error.name = 'MongoParseError'){
        console.error('Invalid MongoDB connection string.');
    }

    process.exit(1)
    }
}  

    // Function to disconnect (useful for testing)
    const disconnectDB = async() => {
        try{
            await mongoose.connection.close()
            console.log("MongoDB connection closed manually")
        }catch(error) {
            console.log("Error closing MongoDb connection", error)

        }
    }

//  This function provides a way to quickly inspect the current status of the database connection without triggering a new connection attempt.

    const checkDBHealth = async() => {
        const state = mongoose.connection.readyState;
        const states = {
            0: 'disconnected',
            1:'connected',
            2:'connecting',
            3:'disconnecting',
        }

        return {
            status: states[state] || 'unknown',
            host:mongoose.connection.host,
            name: mongoose.connection.name,
            collections: Object.keys(mongoose.connection.collections)
        }
    }

export{connectDb, disconnectDB, checkDBHealth}


// function App() {
//    const [count, setCount] = useState(0)
     
   //    setInterval(() => {

    //    setCount(count + 1)

      // }) 
// }