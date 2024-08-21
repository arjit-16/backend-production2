//Multer is specifically designed to parse multipart/form-data requests, 
//which are used when uploading files through forms. 
//Express middleware can intercept and process incoming requests before they reach your route handlers. 
//Multer processes these file uploads and makes the file data available in req.file or req.files.
//Multer itself handles file uploads and storage only on the local server

import multer from "multer";

//// Set up disk storage configuration
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null,"./public/temp")
    },
    filename: function(req, file, cb){
        cb(null, file.originalname)
    }
})

const upload = multer({ storage: storage })


export {upload}