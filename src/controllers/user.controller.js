import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


const registerUser = async (req, res) => {
    try {
        //Extract user data from request body
        const { userName, fullName, email, password } = req.body;
        //console.log(req.body);
        //console.log(req);


        //check if any fields are empty
        if (userName === "" || fullName === "" || email === "" || password === "") {
            return res.status(400).json({ message: "Please fill all the required fields" })
        }

        //check if the user already exists
        const existedUser = await User.findOne({
            $or: [{ email }, { userName }]
        })
        console.log(existedUser, "def");

        if (existedUser) {
            return res.status(400).json({ message: "User already exists" })
        }


        //files handling(extract files from user submitted data through multer req.files instead of express req.body)
        const avatarLocalPath = req.files.avatar[0].path;
        const coverImageLocalPath = req.files.coverImage[0].path;
        console.log(req.files)
        console.log(avatarLocalPath);
        console.log(coverImageLocalPath);


        if (!avatarLocalPath) {
            return res.status(400).json({ message: "Avatar is required" })
        }


        //upload files on cloudinary
        const avatarOnCloudinary = await uploadOnCloudinary(avatarLocalPath);
        const coverImageOnCloudinary = await uploadOnCloudinary(coverImageLocalPath);

        console.log(avatarOnCloudinary);
        console.log(coverImageOnCloudinary);


        if (!avatarOnCloudinary) {
            return res.status(400).json({ message: "Avatar is required on cloudinary" })
        }


        //create entry in database(document is created here through model User)
        const user = await User.create({
            userName,
            fullName: fullName.toLowerCase(),
            email,
            password,
            avatar: avatarOnCloudinary,
            coverImage: coverImageOnCloudinary || ""
        })
        console.log(user, "userabcd");

        //check whether data entry in db succesfull or not
        const createdUser = await User.findById(user._id);
        console.log(createdUser);


        if (!createdUser) {
            return res.status(500).json({ message: "Something went wrong while registering user" })
        }
    }
    catch (error) {
        res.status(500).json({ message: "An error occured while registering the user" })
        console.log("error in catch block");

    }
}

const loginUser = async (req, res) => {
    try {
        //user info from frontend during login
        const { userName, email, password } = req.body;

        //check whether user exists
        const user = await User.findOne({ $or: [{ email }, { userName }] });

        if (!user) {
            return res.status(400).json({ message: "email or username does not exist" });
        }

        //check whether password is correct
        const isValidPassword = user.isPasswordCorrect(password);

        if (!isValidPassword) {
            return res.status(400).json({ message: "Invalid password" })
        }

        //generate access and refresh token
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save();

        //send response on frontend
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
        console.log(loggedInUser);


        //send cookies
        const options = {
            httpOnly: true,
            secure: true
        }
        res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User Logged In Succesfully"))


    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "something went wrong while logging in" })
    }
}

const logoutUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user._id,
            {
                $set: { refreshToken: null }
            },
            {
                new: true  //will return the new updated info
            }
        )

        if (!user) {
            return res.status(400).json({ message: "Invalid access token" })
        }

        const options = {
            httpOnly: true,
            secure: true
        }
        res.status(201)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(201, {}, "User logged out succesfully"))

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "something went wrong while logging out user" })

    }
}

const refreshAccessToken = async (req, res) => {

    try {
        //extract refresh token from cookies 
        const incomingRefreshToken = req.cookies.accessToken;

        if (!incomingRefreshToken) {
            return res.status(401).json({ message: "Unauthorised token" })
        }

        //decoded the incoming token info(payload)
        const decodedRefreshToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        //finding user based on decoded token info like payload in which id is present
        const user = await User.findById(decodedRefreshToken._id);

        if (!user) {
            return res.status(401).json({ message: "Invalid refresh token" })
        }

        //matches this incoming refresh token with refresh token already present in our database
        if (!(incomingRefreshToken !== user.refreshToken)) {
            return res.status(401).json({ message: "Token has expired" })
        }

        //refreshes or generate new access token along with new refresh token 
        const newAccessToken = await user.generateAccessToken();
        const newRefreshToken = await user.generateAccessToken();

        //saving newly generated refresh token into database
        user.refreshToken = newRefreshToken;
        await user.save();

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
            .status(201)
            .cookie("newAccessToken", newAccessToken, options)
            .cookie("newRefreshToken", newRefreshToken, options)
            .json(new ApiResponse(201, { newAccessToken, newRefreshToken }, "Access token refreshed succesfully"))


    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong while refreshing access token" })
    }
}


//update controllers

const changeUserCurrentPassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        //find user
        const user = await User.findById(req.user._id);

        //password checking
        const isPasswordValid = await user.isPasswordCorrect(oldPassword);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Incorrect password" })
        }

        //save new password in db
        user.password = newPassword;
        await user.save();

        return res.status(200).json(new ApiResponse(200, {}, "Password change succesfully"));


    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong while updating password" })
    }
}

const getCurrentUser = async (req, res) => {
    try {
        return res.status(200).json(new ApiResponse(200, req.user, "User found successfully"));

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong while finding user" })

    }
}

const updateAccountDetails = async (req, res) => {
    try {
        const { email, fullName } = req.body;

        if(!(email || fullName)){
            return res.status(400).json({message: "All fields are required"})
        }

        const user = await User.findByIdAndUpdate(req.user._id,
            {
                $set: {email, fullName}
            },
            {
                new: true  //this will return the updated info
            }
        ).select("-password")

        return res
        .status(200)
        .json(new ApiResponse(200, user, "User Account details updated successfully"))



    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong while updating user details" })

    }
}

//update files(like avatar, coverImage)

const updateUserAvatar = async(req, res) => {
    try {
        const newAvatarLocalPath = req.file.path;

        if (!newAvatarLocalPath) {
            return res.status(400).json({message: "avatar file is missing"});
        }

        //upload new avatar on cloudinary
        const newAvatarOnCloudinary = await uploadOnCloudinary(newAvatarLocalPath);

        // const user = await User.findById(req.user._id);
        // user.avatar = newAvatarLocalPath;
        // await user.save();

        const user = await User.findByIdAndUpdate(req.user._id,
            {
                $set: {avatar: newAvatarOnCloudinary}
            },
            {
                new: true
            }
        ).select("-password")

        return res
        .status(200)
        .json(new ApiResponse(200, user, "avatar uploaded successfully"))

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong while updating user avatar" })

    }
}

const updateUserCoverImage = async(req, res) => {
    try {
        const newCoverImageLocalPath = req.file.path;

        if (!newCoverImageLocalPath) {
            return res.status(400).json({message: "cover image file is missing"});
        }

        //upload new avatar on cloudinary
        const newCoverImageOnCloudinary = await uploadOnCloudinary(newCoverImageLocalPath);

        // const user = await User.findById(req.user._id);
        // user.avatar = newCoverImageLocalPath;
        // await user.save();

        const user = await User.findByIdAndUpdate(req.user._id,
            {
                $set: {coverImage: newCoverImageOnCloudinary}
            },
            {
                new: true
            }
        ).select("-password")

        return res
        .status(200)
        .json(new ApiResponse(200, user, "cover image uploaded successfully"))

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong while updating user cover image" })

    }
}

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeUserCurrentPassword,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
}