import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
  {
    videoFile: {
       url: {
        type: String,
      },
      public_id: { //Think of it like an ID card for your image inside Cloudinary.
        type: String,
      }, //cloudinary url
     
    },
    thumbnail: {
      url: {
        type: String,
      },
      public_id: { //Think of it like an ID card for your image inside Cloudinary.
        type: String,
      }, // cloudinary url
     
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);
