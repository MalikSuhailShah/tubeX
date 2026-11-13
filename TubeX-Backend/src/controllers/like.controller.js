import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.models.js"
import { Tweet } from "../models/tweet.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.models.js"
import {Comment} from "../models/comment.models.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params

    if(!videoId){
        throw new ApiError(400, "Video Id not found!!")
    }

    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400, "Video Id invalid!!")
    }


    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video not found!!")
    }

    const videoLiked= await Like.findOne(
        {
            video:videoId,
            likedBy:req.user._id
        }
    )

    if(videoLiked){
        await Like.findByIdAndDelete(videoLiked._id)
       return res.status(200).json(
        new ApiResponse(
            200,
            {isLiked:false},
            "Video Unliked Successfully"
        )
       )
    }
    else{
        await Like.create({
            video:videoId,
            likedBy:req.user._id
        })

          return res.status(200).json(
        new ApiResponse(
            200,
            {isLiked:true},
            "Video liked Successfully"
        )
       )
    }
   
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    if(!commentId){
        throw new ApiError(400, "CommentId not found!!")
    }

    if(!mongoose.isValidObjectId(commentId)){
        throw new ApiError(400, "Comment Id is  not valid!!")
    }

    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(404, "Comment Not found!!")
    }

    const commentLiked = await Like.findOne({
        comment:commentId,
        likedBy:req.user._id
    })

    if(commentLiked){
        //delete Comment Like
        await Like.findByIdAndDelete(commentLiked._id)

        return res.status(200).json(
            new ApiResponse(
                200,
                {isLiked:false},
                "Comment Unliked Successfully"
            )
        )
    }
    else{
        // create comment Like
        await Like.create({
            comment:commentId,
           likedBy:req.user._id
        })

        return res.status(200).json(
            new ApiResponse(
                200,
                 {isLiked:true},
            "comment liked successfully"
            )
        )

    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    

    if(!tweetId){
        throw new ApiError(400, "Tweet Id not found!!")
    }

    if(!mongoose.isValidObjectId(tweetId)){
        throw new ApiError(400, "Tweet Id is  not valid!!")
    }

    const tweet = await Tweet.findById(tweetId)

    if(!tweet){
        throw new ApiError(404, "Tweet Not found!!")
    }

    const tweetLiked = await Like.findOne({
        tweet:tweetId,
        likedBy:req.user._id
    })

    if(tweetLiked){
        //delete tweet Like
        await Like.findByIdAndDelete(tweetLiked._id)

        return res.status(200).json(
            new ApiResponse(
                200,
                {isLiked:false},
                "Tweet Unliked Successfully"
            )
        )
    }
    else{
        // create tweet Like
        await Like.create({
            tweet:tweetId,
           likedBy:req.user._id
        })

        return res.status(200).json(
            new ApiResponse(
                200,
                {isLiked:true},
                "Tweet liked successfully"
            )
        )

    }

}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const LikedVideos = await Like.find({
        likedBy:req.user._id,
        video:{$ne:null}// selecting video only not comment or tweet
    }).populate({
       path: "video",
       select: "title description videoFile thumbnail duration"
    })

    return res.status(200).json(
         new ApiResponse(
            200,
            {LikedVideos},
            "Videos liked by user fetched Successfully"
        )
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}