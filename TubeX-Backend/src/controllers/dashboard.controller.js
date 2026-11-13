import mongoose from "mongoose"
import {Video} from "../models/video.models.js"
import {Subscription} from "../models/subscription.models.js"
import {Like} from "../models/like.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const userId = req.user._id


    if(!userId){
        throw new ApiError(400, "user Id not found!!")
    }

    if(!mongoose.isValidObjectId(userId)){
        throw new ApiError(400, "user Id i is not valid!!")
    }


    const videos = await Video.find({
        owner:userId
    })

    const totalVideos = videos.length

    const totalViews = videos.reduce(
        (total, video) => total + video.views,0
    )

    const totalSubcribers = await Subscription.countDocuments({
        channel:userId
    })

    const videoIds = videos.map(video=>video._id)

    const totalLikes =await Like.countDocuments({
        video:{$in:videoIds}
    })

    return res.status(200).json(
        new ApiResponse(
            200,{
                totalVideos,
                totalViews,
                totalSubcribers,
                totalLikes
            },
            "Channel Stats fetched successfully"
        )
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    const userId = req.user._id
    if(!userId){
        throw new ApiError(400, "User Id not found!!")
    }

    if(!mongoose.isValidObjectId(userId)){
        throw new ApiError(400, "User Id is not valid!!")
    }

    const videos = await Video.find({
        owner:userId
    }).sort({
        createdAt:-1
    })

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                videos
            },
            "All Videos fetched Successfully"
        )
    )

})

export {
    getChannelStats, 
    getChannelVideos
    }