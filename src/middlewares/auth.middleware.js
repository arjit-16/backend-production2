import jwt from "jsonwebtoken";

const authenticateJWT = async(req, res, next) => {
    try {
        const token = req.cookies.accessToken || req.headers["Authorization"].split(" ")[1];

        if (!token) {
            res.status(401).json({message: "Unauthorised request"})
        }

        const verifiedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Attach user information to request object
        req.user = verifiedToken;

        next();

    } catch (error) {
        console.log(error);
        res.status(403).json({message: "Forbidden"})
        
    }
}

export {authenticateJWT}