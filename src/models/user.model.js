import mongoose from "mongoose";
import bcrypt from "bcrypt";       //A library helps to hash passwords
import jwt from "jsonwebtoken";    //A library through which tokens generate

const userSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true   // this makes the field searchable(database searching)
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        avatar: {
            type: String,
            required: true
        },
        coverImage: {
            type: String
        },
        watchHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, "Password is required"]
        },
        refreshToken: {
            type: String
        }
    },
    { timestamps: true })


// hashing of password before saving into database    
userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    }
    return next();
})

//checking if user password is correct by comparing 
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

//generation of access and refresh tokens
//a jwt by default is not encrypted. While encoded with base64, 
//from a security perspective it's just plain text and should not contain sensitive (secret) information. 
//The only protection the signature provides is that when the server receives it back, 
//it can make sure by checking the signature that the information in the jwt was not altered on the client.

userSchema.methods.generateAccessToken = function (){       //Instance Method (userSchema.methods.generateAccessToken): Directly tied to the Mongoose document, ideal when you want to operate on the data of the specific instance of the model.
     jwt.sign(
        {
            _id: this._id,
            email: this.email,
            userName: this.userName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function (){
    jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)
