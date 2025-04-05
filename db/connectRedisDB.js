import exp from "constants";
import Redis from "ioredis";
let redis;
     const connectRedisDB=async()=>{
        try {
            
            redis=new Redis(
            process.env.REDIS_PORT,
            process.env.REDIS_URI
            )
            console.log(`\n Redis connected !!`);
        } catch (error) {
            console.error(error);
        }
    }

export {connectRedisDB,redis}
