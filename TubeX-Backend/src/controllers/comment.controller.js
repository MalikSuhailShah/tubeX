import mongoose from "mongoose"
import {Comment} from "../models/comment.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.models.js"


const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!videoId){
        throw  new ApiError(400, "videoId not found ")
    }

    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400, "videoId is invalid ")
    }

    const pageNumber = Number(page)
    const limitNumber = Number(limit)

    if(pageNumber<1 || limitNumber<1){
        throw new ApiError(400, "Page and limit must be greater than 1")
    }


    const skip = (pageNumber-1)*limitNumber

    const comments = await Comment.find({
        video:videoId
    })
        .sort({ createdAt:-1 })
        .skip(skip)
        .limit(limitNumber)
    
    const totalComments = await Comment.countDocuments({
        video:videoId
    })


    return res.status(200).json(
        new ApiResponse(
            200,
            {
                comments,
                pagination:{
                    currentPage:pageNumber,
                    limit:limitNumber,
                    totalComments,
                    totalPages:Math.ceil(totalComments/limitNumber)
                }
            },
            "Video Comments Fetched successfully "
        )
    )

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {content}  = req.body
    const {videoId} = req.params
    if(!content){
        throw new ApiError(400, "Content not found ")
    }
    if(!videoId){
        throw new ApiError(400, "VideoId not found")
    }

    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400, "Video Id is not valid ")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video Not Found")
    }

    const comment = await Comment.create({
        content:content,
        owner:req.user._id,
        video:videoId
    })


    return res.status(200).json(
        new ApiResponse(
            200,
            comment,
            "Comment added successfully"
        )
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {content} = req.body
    const { commentId} = req.params

    if(!content){
        throw new ApiError(400, "content not found")
    }
    if(!commentId){
        throw new ApiError(400, "commentId not found")
    }
    if(!mongoose.isValidObjectId(commentId)){
        throw new ApiError(400, "comment Id is not valid")
    }

    const comment = await Comment.findById(commentId)

    if(!comment)
    {
        throw new ApiError(404, "Comment Not Found")
    }

    if(!comment.owner.equals(req.user._id)){
        throw new ApiError(403, "You are not authorised to update the comment")
    }

    comment.content = content;
    await comment.save()

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Comment Updated Successfully"
        )
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params
     if(!commentId){
        throw new ApiError(400, "commentId not found")
    }
    if(!mongoose.isValidObjectId(commentId)){
        throw new ApiError(400, "comment Id is not valid")
    }

    const comment = await Comment.findById(commentId)

    if(!comment)
    {
        throw new ApiError(404, "Comment Not Found")
    }
      if(!comment.owner.equals(req.user._id)){
        throw new ApiError(403, "You are not authorised to delete the comment")
    }

    await Comment.findByIdAndDelete(commentId)

    
    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Comment deleted Successfully"
        )
    )

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }