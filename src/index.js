import connectDB from "./db/connection.js";
import { app } from "./app.js";


connectDB()        //async await return promise which is then handle through then and catch  //Each time when an async function is called, it returns a new Promise which will be resolved with the value returned by the async function, or rejected with an exception uncaught within the async function.
.then(() => {
    app.listen(process.env.PORT, ()=>{
        console.log(`Server is listening at port ${process.env.PORT}`);
    })
})
.catch((error) => {
    console.log(error, "Server is not connected");
})
