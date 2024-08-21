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
     return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            userName: this.userName,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function (){
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


//The .model() function makes a copy of schema. 
//Make sure that you've added everything you want to schema, 
//including hooks, before calling .model()!

export const User = mongoose.model("User", userSchema)

//In Mongoose, a "document" generally means an instance of a model. 
//You should not have to create an instance of the Document class without going through a model.


//SOME KNOWLEDGE ABOUT MONGOOSE

/*

1. Schema
A Schema is a blueprint for the structure of documents within a MongoDB collection. 
It defines the fields, their types, default values, and validation rules. 
Schemas in Mongoose are used to create models and enforce the structure of the documents.

In SQL databases, a Table is similar to a Schema in Mongoose. 
It defines the structure of the data by specifying columns, their data types, 
and any constraints such as primary keys or unique constraints.


2. Model
A Model is a compiled version of the schema. 
It is a constructor function that allows you to interact with the database, 
perform CRUD operations, and query the database. 
Models are created from schemas and are used to create and manage documents.

A Model in SQL terms corresponds to an ORM (Object-Relational Mapping) model. 
An ORM model provides an abstraction layer that allows you to interact with the 
database using programming languages rather than SQL queries directly. 
It maps to a specific table in the database and provides methods to perform operations 
such as create, read, update, and delete.


3. Document
A Document is an instance of a model. 
It represents a single record in the MongoDB collection that follows the schema defined by the model. 
Documents are the objects that you work with in your application and are used to interact with the database.

A Record in SQL terms corresponds to a Document in MongoDB. 
It represents a single entry in a table. 
Each record has values for the columns defined in the table schema.


Summary of SQL Concepts:
Table (Schema): Defines the structure of data in a database, similar to Mongoose's schema.
Model (ORM Model): Provides an interface to interact with a specific table using an ORM, similar to Mongoose's model.
Record (Document): Represents a single row in a table, equivalent to a document in MongoDB.

*/


/* An instance of a model is called a document. 

//Creating them and saving to the database is easy.

CONSTRUCTING DOCUMENTS

const Tank = mongoose.model('Tank', yourSchema);

const small = new Tank({ size: 'small' });
await small.save();

// or

await Tank.create({ size: 'small' });

// or, for inserting large batches of documents
await Tank.insertMany([{ size: 'small' }]);


QUERYING
Finding documents is easy with Mongoose, which supports the rich query syntax of MongoDB. 
Documents can be retrieved using a model's find, findById, findOne, or where static functions.

await Tank.find({ size: 'small' }).where('createdDate').gt(oneYearAgo).exec();


DELETING
Models have static deleteOne() and deleteMany() functions for removing all documents matching the given filter.

await Tank.deleteOne({ size: 'large' });


UPDATING
Each model has its own update method for modifying documents in the database without returning them to your application.

// Updated at most one doc, `res.nModified` contains the number
// of docs that MongoDB updated
await Tank.updateOne({ size: 'large' }, { name: 'T-90' });

*/
