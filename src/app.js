import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "./controllers/user.controller.js";
import { upload } from "./middlewares/multer.middleware.js";
import { authenticateJWT } from "./middlewares/auth.middleware.js";

const app = express();

//some important configuration settings through express middleware function app.use()

app.use(cors({
    origin: process.env.CORS_ORIGIN
}));
//middleware to parse json bodies
app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

// routes
// import router from "./routes/user.route.js";
// app.use("/api/v2", router)

app.post("/api/v2/users/register", upload.fields([{name: "avatar"}, {name: "coverImage"}]),registerUser);
app.post("/api/v2/users/login", loginUser);
app.post("/api/v2/users/logout", authenticateJWT, logoutUser);
app.post("/api/v2/users/refresh-token", refreshAccessToken)

export {app}