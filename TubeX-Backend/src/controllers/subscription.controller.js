import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.models.js";
import { Subscription } from "../models/subscription.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params; // channelId identifies the channel that the logged-in user wants to subscribe to or unsubscribe from.

  if (!channelId) {
    throw new ApiError(400, "Channel Id not found!!");
  }
  if (!mongoose.isValidObjectId(channelId)) {
    throw new ApiError(400, "Channel Id not valid");
  }

  const channel = await User.findById(channelId);

  if (!channel) {
    throw new ApiError(404, "Channel Not found");
  }

  //checking fror self subscription

  if (channel._id.equals(req.user._id)) {
    throw new ApiError(400, "You cannot subscribe to yourself!!");
  }

  //check  for subscription status

  const subscription = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });

  if (subscription) {
    await Subscription.deleteOne({
      subscriber: req.user._id,
      channel: channelId,
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          isSubscribed: false, // So isSubscribed is typically an API response field
        },
        "Channel unsubscribed successfully"
      )
    );
  } else {
    await Subscription.create({
      subscriber: req.user._id,
      channel: channelId,
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          isSubscribed: true,
        },
        "Channel subscribed successfully"
      )
    );
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;// basically channelId is userId

  if (!channelId) {
    throw new ApiError(400, "Channel Id not found!!");
  }

  if (!mongoose.isValidObjectId(channelId)) {
    throw new ApiError(400, "Channel Id is not valid!!");
  }

  const channel = await User.findById(channelId);

  if (!channel) {
    throw new ApiError(404, "Channel Not found!!");
  }

  const subscription = await Subscription.find({
    channel: channelId,
  }).populate(
    "subscriber",
    "username fullName avatar"
  );

 

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscription,
        "User subscribers fetched successfully"
      )
    );
});

// controller to return channel list to which user has subscribed
const getUserSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params; // subscriberId is also an userId

  if(!subscriberId){
    throw new ApiError(400, "subscriberId not found!!")
  }

  if(!mongoose.isValidObjectId(subscriberId)){
    throw new ApiError(400, "subscriberId is not valid!!")
  }

  const channelsSubscribed = await Subscription.find({  // this will return an array and empty array is a truthy value
    subscriber:subscriberId  // checking whether the user is listed as subscriber in this documents
  }).populate(
    "channel",
    "username fullName avatar"
  )

  return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            channelsSubscribed,
            "Channel that user have subscribed fetched succesfully "
          )
        )
});

export { toggleSubscription, getUserChannelSubscribers, getUserSubscribedChannels };
