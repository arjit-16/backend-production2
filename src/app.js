import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

//some important configuration settings through express middleware function app.use()

app.use(cors({
    origin: process.env.CORS_ORIGIN
}));
//middleware to parse json bodies
app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({limit: "16kb"}));
app.use(cookieParser())


export {app}