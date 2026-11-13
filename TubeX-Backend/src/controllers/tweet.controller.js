import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
  const {content} = req.body;

  if(!content || content.trim()===""){
    throw new ApiError(400, "Content Not found")
  }

  const tweet = await Tweet.create(
    {
      content:content.trim(),
      owner:req.user._id,
    }
  )

  if(!tweet) {
    throw new ApiError(400, "Something went wrong while creating tweet")
  }

    return res
           .status(200)
           .json(new ApiResponse(
             200,
             tweet,
             "Tweet created Successfully"
           ))
  
  
})


const getUserTweet = asyncHandler( async(req, res)=>{
  const {userId} = req.params;

  const tweets = await Tweet.find({
    owner:userId
  }).sort({creates:-1})

  return res
         .status(200)
         .json(new ApiResponse(200, tweets, "User tweets fetched Successfully"))

  //  createdAt = 1 →sort in ascending → oldest → newest
  // createdAt = -1 →sort in descending → newest → oldest  
})


const updateTweet = asyncHandler(async (req, res) => {
  const {tweetId} = req.params
  const {content} = req.body

  if (!mongoose.isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid Tweet ID!!");
}
  if(!content || content.trim()===""){
    throw new ApiError(400, "Tweet content is required!!")
  }

  /* const tweet = await Tweet.findByIdAndUpdate(
  //   {
          _id:tweetId,
          owner:req.user_id
  //   },
  //   {
  //     $set:{
  //       content:content.trim()
  //     }
  //   },
  //   {
  //     new:true,
  //     runValidators:true
  //   }
   )
*/
  const tweet = await Tweet.findById(tweetId)

  if(!tweet){
    throw new ApiError(404, "Tweet not Found!!")
  }


  if(!tweet.owner.equals(req.user._id)){
    throw new ApiError(404, "You are not authorised to modify tweet!!")
  }

  tweet.content = content.trim()

  await tweet.save()
  
  return res
         .status(200)
         .json(
           new ApiResponse(
             200,
             tweet,
             "Tweet updated successfully"
           )
         )
})


const  deleteTweet = asyncHandler(async (req, res) => {
  const {tweetId} = req.params

  if(!tweetId){
    throw new ApiError(400, "Tweet Id not found!!")
  }
  if (!mongoose.isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid Tweet ID!!");
}
  // const tweet = await Tweet.findOneAndDelete({
  //   _id:tweetId,
  //   owner:req.user._id
  // })

  const tweet = await Tweet.findById(tweetId)
  

  if(!tweet ){
    throw new ApiError(
      404,
      "Tweet Not found"
    )
  }

  if(!(tweet.owner.equals(req.user._id))){
    throw new ApiError(403, "You Are not Authorised to delete the Tweet!!")
  }

  await tweet.deleteOne();
  
  return res
         .status(200)
         .json(
           new ApiResponse(200, tweet, "Tweet deleted Successfully")
         )
})


export {
    deleteTweet,
    updateTweet,
    getUserTweet,
    createTweet,


}