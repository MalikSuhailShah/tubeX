import mongoose, { isValidObjectId, Mongoose } from "mongoose";
import { Playlist } from "../models/playlist.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.models.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    throw new ApiError(400, "Both the fields are required!!");
  }

  //TODO: create playlist

  const playlist = await Playlist.create({
    name: name,
    description: description,
    owner: req.user._id, //Identity should come from authentication, not from data supplied by the client.
  });

  if (!playlist) {
    throw new ApiError(
      400,
      "Something went wrong while creating the playlist!!"
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(201, playlist, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "userId not found!!");
  }

  if (!mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, "user Id is not valid!!");
  }

  const playlists = await Playlist.find({
    owner: userId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, playlists, "User Playlist fetched successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId) {
    throw new ApiError(400, "Play list Id not found!!");
  }

  if (!mongoose.isValidObjectId(playlistId)) {
    throw new ApiError(400, "Playlist id is not valid!!!");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found!!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  // Algorithm:
  // playlistId + videoId
  // -> Validate both IDs
  // -> Check playlist exists
  // -> Check user owns playlist
  // -> Check video exists
  // -> Check video isn't already in playlist
  // -> Add videoId to playlist
  // -> Save playlist
  // -> Return updated playlist

  const { playlistId, videoId } = req.params;

  if (!playlistId || !videoId) {
    throw new ApiError(400, "Both the fields are required!!");
  }

  if (!mongoose.isValidObjectId(playlistId)) {
    throw new ApiError(400, "Playlist Id is not valid!!");
  }

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Video Id is not valid!!");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found!!");
  }

  if (!playlist.owner.equals(req.user._id)) {
    throw new ApiError(403, "You are not authorized to modify this playlist!!");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found!!");
  }

  const videoExistsAlready = playlist.videos.some((id) => id.equals(videoId));

  if (videoExistsAlready) {
    throw new ApiError(400, "Video already exists in playlist!!");
  }

  playlist.videos.push(videoId);

  await playlist.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Video added to playlist successfully")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist

  if (!playlistId || !videoId) {
    throw new ApiError(400, "Both the fields are required!!");
  }

  if (!mongoose.isValidObjectId(playlistId)) {
    throw new ApiError(400, "Playlist Id is not valid!!");
  }

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Video Id is not valid!!");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found!!");
  }

  if (!playlist.owner.equals(req.user._id)) {
    throw new ApiError(403, "You are not authorized to modify this playlist!!");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found!!");
  }

  const videoExistsAlready = playlist.videos.some((id) => id.equals(videoId));

  if (!videoExistsAlready) {
    throw new ApiError(400, "Video does not exist in playlist!!");
  }

  playlist.videos = playlist.videos.filter((id) => !id.equals(videoId));

  await playlist.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        playlist,
        "Video removed from playlist successfully!!"
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist

  if (!playlistId) {
    throw new ApiError(404, "Playlist not found");
  }

  if (!mongoose.isValidObjectId(playlistId)) {
    throw new ApiError(400, "playlistId is not valid!!");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(400, "Playlist not found");
  }

  if (!playlist.owner.equals(req.user._id)) {
    throw new ApiError(403, "You are not authorised to delete playlist!!");
  }

  await Playlist.findByIdAndDelete(playlistId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlist deleted Successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist

  if (!playlistId) {
    throw new ApiError(400, "playlistId not found!!");
  }

  if (!mongoose.isValidObjectId(playlistId)) {
    throw new ApiError(400, "playlistId is not valid!!");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found!!");
  }

  if (!playlist.owner.equals(req.user._id)) {
    throw new ApiError(403, "You are not authorised to Modify playlist!!");
  }

  if (name !== undefined) playlist.name = name;
  if (description != undefined) playlist.description = description;

  await playlist.save();

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist updated successfully"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
