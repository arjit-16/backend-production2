import mongoose from "mongoose";
import "dotenv/config";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.MONGODB_NAME}`)
        console.log(`DB connection established succesfully! ${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.log(error, "DB Connection failed");
        
    }
}

export default connectDB;