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

//WE CAN DIRECTLY USE THIS BELOW METHOD INSTEAD OF SEGREGATING THE ROUTES 
//app.post("/api/v2/register",upload.fields([{name: "avatar"},{name: "coverImage"}]),registerUser);

//HERE WE USE THE PRODUCTION BASED STANDARD PRACTICE WHERE WE SEPARATE ROUTES AND USE THAT app.use() IN app.js FILE
// import router from "./routes/user.route.js";
// app.use("/api/v2",router)