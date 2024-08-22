import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const authenticateJWT = async(req, res, next) => {
    try {
        //extract access token either from cookies or headers(Bearer token)
        const token = req.cookies.accessToken || req.headers["Authorization"].split(" ")[1];

        if (!token) {
            res.status(401).json({message: "Unauthorised request"})
        }

        //decoded the token info(payload)
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        //finding the user
       const user = await User.findById(decodedToken._id);

        // Attach user information to request object
        req.user = user;

        next();

    } catch (error) {
        console.log(error);
        res.status(403).json({message: "Forbidden"})
        
    }
}

export {authenticateJWT}