import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

// const generateAccessAndRefreshTokens = async (userId) => {
//   try {
//     const user = await User.findById(userId);
//     const accessToken = user.generateAccessToken();
//     const refreshToken = user.generateRefreshToken();

//     user.refreshToken = refreshToken;
//     await user.save({ validateBeforeSave: false }); // do not validate all the other credentials

//     return { accessToken, refreshToken };
//   } catch (error) {
//     throw new ApiError(
//       500,
//       "Something went wrong while generating refresh and access tokens"
//     );
//   }
// };

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();

    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({
      validateBeforeSave: false,
    });

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    console.error("TOKEN GENERATION ERROR:", error);
    throw error;
  }
};
const registerUser = asyncHandler(async (req, res) => {
  /*  **Algorithm for registration
                                                                                                    fullname, username, email, password, =>get user detail from frontend
                                                                                                    validation -not empty
                                                                                                    check if already exists:username , email
                                                                                                    check for images, check for avatar
                                                                                                    upload them for cloudinary, avatar
                                                                                                    create user object - create entry in db 
                                                                                                    remove password and refresh token field from response
                                                                                                    check for user creation
                                                                                                    return response
                                                                                                */
  //   res.status(200).json({
  //     message: "ok",
  //   });

  const { email, fullName, username, password } = req.body;
  //console.log("Req.Body", req.body)

  if (
    [fullName, email, password, username].some((field) => field?.trim() === "") //Check whether any of fullName, email, password, or username is empty or contains only spaces.
  ) {
    throw new ApiError(400, "All fields are required"); //some sends each element into field
  }

  const userExisted = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (userExisted) {
    throw new ApiError(409, "User With Email or username already exists");
  }

  //... accessing local path for avatar and coverImage

  //console.log(req.files)

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverLocalPath = req.files?.coverImage[0]?.path

  let coverLocalPath; // const variable can not declared without a value initialisation

  if (
    req.files &&
    Array.isArray(req.files.coverImage) && //This checks whether coverImage is an array.
    req.files.coverImage.length > 0 //This checks whether the array contains at least one file.
  ) {
    coverLocalPath = req.files.coverImage[0].url;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar Image is required !!");
  }

  // uploading the avatar and coverImage on cloudinary

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar Image is required 2 !!");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password  -refreshToken" // basically remove password and refresh token from response
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }
  //console.log("Response", res)
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered succesfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // algorithm
  /* 
        req body -> data
        email / username
        find the user
        validate the password
        Access and refresh token
        send cookie and response
    */

  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "username or email is required!!");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  console.log(user);

  if (!user) {
    throw new ApiError(404, "User Does not exist");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(404, "Invalid user credentials!!");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  // User = object that is created using moongoose and can directly communicate with database
  // user =  user logging in

  const loggedInUser = await User.findById(user._id).select(
    //.select() controls which fields are returned.
    "-password  -refreshToken"
  );

  const options = {
    // this enables that cookies can be handled over server only
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User Logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // we have to end the session and remove the refresh token
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      //new: true,
      returnDocument: "after", // new version of mongoose and returns the updated values
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out Successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized Access request ");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      // basically checking whether the refresh token is valid or not
      throw new ApiError(401, "Refresh Token is Expired");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken,
          },
          "Access Token Refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(400, error?.message || "Invalid refresh Token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid Old Password");
  }
  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changed Successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User Fetched Successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName || !email) {
    throw new ApiError(400, "All Fields are required!!");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName: fullName,
        email: email,
      },
    },
    {
      new: true, // updated values will be returned
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully!!"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const AvatarLocalPath = req.file?.path;

  if (!AvatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(AvatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading Avatar");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar image udated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "coverImage file is missing");
  }

  const oldPublicId = req.user?.coverImage?.public_id;

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  console.log("New cover Image uploaded");

  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading coverImage");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: {
          url: coverImage.url,
          public_id: coverImage.public_id,
        },
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  //deleting old cover image
  if (oldPublicId) {
    const deleted = await deleteFromCloudinary(oldPublicId);
    if (deleted?.result !== "ok") {
      console.warn("Old cover image was not deleted:", deleted);
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "cover image updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "username is missing");
  }

  const channel = await User.aggregate([
    //pipelines
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions", // name of subscription model saved in database in lowercase and plural form
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions", //Go to the subscriptions collection and search for matching documents.
        localField: "_id", //Take the _id from the document I'm currently looking at.(i.e at user collection)
        foreignField: "subscriber", //Which subscription documents have subscriber user having _id  equal to the user's _id
        as: "subscribedTo", //Put all the matching subscription documents into a new field called subscribedTo(basically follower).
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          //Has the currently logged-in user subscribed to this channel
          $cond: {
            if: {
              $in: [
                req.user?._id, // id of the user currently logged in
                "$subscribers.subscriber", //Give me the subscriber value from every object inside subscribers. and check whether the logged in user present in subscriber value
              ],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "channel does not exists");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User Channel Fetched Successfully")
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch History fetched successfully"
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  updateAccountDetails,
  getCurrentUser,
  updateUserAvatar,
  updateUserCoverImage,
  changeCurrentPassword,
  getUserChannelProfile,
  getWatchHistory,
};
