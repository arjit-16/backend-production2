import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { changeUserCurrentPassword, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from "./controllers/user.controller.js";
import { upload } from "./middlewares/multer.middleware.js";
import { authenticateJWT } from "./middlewares/auth.middleware.js";

const app = express();

//some important configuration settings through express middleware function app.use()

app.use(cors({
    origin: process.env.CORS_ORIGIN
}));
//middleware to parse json bodies
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// routes
// import router from "./routes/user.route.js";
// app.use("/api/v2", router)

app.post("/api/v2/users/register", upload.fields([{ name: "avatar" }, { name: "coverImage" }]), registerUser);
app.post("/api/v2/users/login", loginUser);
app.post("/api/v2/users/logout", authenticateJWT, logoutUser);
app.post("/api/v2/users/refresh-token", refreshAccessToken);
app.post("/api/v2/users/changeUserCurrentPassword", authenticateJWT, changeUserCurrentPassword);
app.post("/api/v2/users/updateAccountDetails", authenticateJWT, updateAccountDetails);
app.post("/api/v2/users/updateUserAvatar", upload.single('avatar'), authenticateJWT, updateUserAvatar);
app.post("/api/v2/users/updateUserCoverImage", upload.single('coverImage'), authenticateJWT, updateUserCoverImage);



export { app }