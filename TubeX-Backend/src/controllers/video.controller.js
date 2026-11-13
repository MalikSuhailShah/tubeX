import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { Video } from "../models/video.models.js";

const publishVideo = asyncHandler(async (req, res) => {
  /* 1. take description, title , video, thumbnail from req.body
       2. validate and upload files on cloudinary
       3. create video database object 
       4. validate and return response
    */
  const { description, title } = req.body;

  if ([description, title].some((field) => !field?.trim())) {
    throw new ApiError(400, "Both Description and title are required");
  }

  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  console.log(thumbnailLocalPath)
 

  const videoLocalPath = req.files?.video?.[0]?.path;
   console.log(videoLocalPath)

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "thumbanil is required!!");
  }

  if (!videoLocalPath) {
    throw new ApiError(400, "Video file is required!!");
  }

  const videoUploaded = await uploadOnCloudinary(videoLocalPath);

  if (!videoUploaded) {
    throw new ApiError(400, "Error occurred while uploading the video!!");
  }
  const thumbnailUploaded = await uploadOnCloudinary(thumbnailLocalPath);

  if (!thumbnailUploaded) {
    throw new ApiError(400, "Error occurred while uploading the thumbnail!!");
  }

  const video = await Video.create({
    thumbnail: thumbnailUploaded.url,
    videoFile: videoUploaded.url,
    description,
    title,
    duration: videoUploaded.duration,
    owner: req.user._id,
  });

  if (!video) {
    throw new ApiError(400, "Error while creating database object!!");
  }

  return res
    .status(200)
    .json(new ApiResponse(201, video, "Video published successfully"));
});

const getAllVideos = asyncHandler(async (req, res) => {
  // algorithm :- Request → Build filter → Build sort → Pagination → Query MongoDB → Return response
  // 1. Get query parameters
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  // 2. Convert pagination values to numbers
  const pageNumber = Number(page);
  const limitNumber = Number(limit);

  // 3. Calculate how many documents to skip
  const skip = (pageNumber - 1) * limitNumber; // used basically to show correct videos on every page , without skip we will same videos on every page

  // 4. Base filter
  const filter = {
    isPublished: true,
  };

  // 5. Filter videos by user
  if (userId) {
    filter.owner = userId;
  }

  // 6. Search videos(This block handles the searching operation for videos)
  if (query?.trim()) {
    filter.$or = [
      {
        title: {
          $regex: query, // $regex perfroms pattern/string matching search in database
          $options: "i",
        },
      },
      {
        description: {
          $regex: query,
          $options: "i",
        },
      },
    ];
  }

  // 7. Create sorting object
  const sort = {};

  if (sortBy) {
    sort[sortBy] = sortType === "asc" ? 1 : -1; // if it provided how to sortby the videos
  } else {
    sort.createdAt = -1; // sortby the videos on the basis of at what relative time they have created
  }

  // 8. Get videos from database
  const videos = await Video.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limitNumber);

  // 9. Get total number of matching videos
  const totalVideos = await Video.countDocuments(filter);

  // 10. Calculate total pages
  const totalPages = Math.ceil(totalVideos / limitNumber);

  // 11. Send response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videos,
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalVideos,
          limit: limitNumber,
        },
      },
      "Videos fetched successfully"
    )
  );
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Video id is not found !!");
  }

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Video not found for the given id!!");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(400, "Video not found!!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video Fetched Successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    const {title, description} = req.body
   
    
  if (!videoId) {
    throw new ApiError(400, "Video id is not found !!");
  }

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Video not found for the given id!!");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(400, "Video not found!!");
  }

if (video.owner.toString() !== req.user._id.toString()) { // only the owner can update the video details
    throw new ApiError(
        403,
        "You are not authorized to update this video"
    );
}

  if(title) video.title= title
  if(description)  video.description = description


  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if(thumbnailLocalPath){
    const uploadThumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if  (!uploadThumbnail){
      throw new ApiError(500, "Error occurred while uploading the thumbnail!!")
    }

    video.thumbnail= uploadThumbnail.url
  }


  await video.save()

  return res
         .status(200)
         .json(
          new ApiResponse(
            200,
            video,
            "Video updated successfully"
          )
        )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if(!videoId){
      throw new ApiError(
        400,
        "Video Id not found!!"
      )
    }

    if(!mongoose.isValidObjectId(videoId)){
      throw new ApiError(
        400,
        "Video Id is not valid!!"
      )
    }

    // find the video in database

    const video = await Video.findById(videoId)

    if(!video){
      throw new ApiError(
        404,
        "Invalid Video ID!!"
      )
    }

    if(video.owner.toString()!==req.user.id.toString()){
      throw new ApiError(
        403,
        "You are not authorized to delete the video!!"
      )
    }

    // deleting from the cloudinary
    await deleteFromCloudinary(video.videoFile.public_id)
    await deleteFromCloudinary(video.thumbnail.public_id)

    const videoDeleted= await Video.findByIdAndDelete(videoId)
    
    if(!videoDeleted){
      throw new ApiError(
        500,
        "Error Occurred while deleting the video!!"
      )
    }

    return res  
           .status(200)
           .json(
            new ApiResponse(
              200,
              {},
              "Video deleted successfully"
            )
           )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
          const {videoId} = req.params

          if(!videoId){
            throw new ApiError(
              400,
              "Video Id not found!!"
            )
          }

          if(!mongoose.isValidObjectId(videoId))
          {
            throw new ApiError(
              400,
              "Invalid Video ID!!"
            )
          }

          const video = await Video.findById(videoId)

          if(!video){
            throw new ApiError(
              404,
              "Video not found!!"
            )
          }

          if(video.owner.toString()!== req.user._id.toString()){
            throw new ApiError(
              403,
              "You are not authorized to update the toggle status!!"
            )
          }

          video.isPublished = !video.isPublished

          await video.save()


          return res
                 .status(200)
                 .json(
                  new ApiResponse(
                    200,
                    {
                      isPublished:video.isPublished
                    },
                    "Publish Status is toggled Successfully"
                  )
                 )
})


export
      { 
          publishVideo, 
          getAllVideos,
          getVideoById,
          updateVideo,
          deleteVideo,
          togglePublishStatus
        };
