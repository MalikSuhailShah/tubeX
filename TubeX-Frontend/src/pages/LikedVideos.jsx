import { useEffect, useState } from "react";
import { getLikedVideos } from "../api/like.api";
import VideoCard from "../components/VideoCard";


//Your liked-video API apparently returns Like documents, not directly video documents thats why map is used to fetch videos from like document
export default function LikedVideos() {
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    getLikedVideos()
      .then((result) =>
        setVideos(
          (result.data.LikedVideos || [])
            .map((item) => item.video)
            .filter(Boolean),//This removes invalid/falsy values.
        ),
      )
      .catch((err) =>
        setError(err?.response?.data?.message || "Unable to load liked videos"),
      );
  }, []);
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">Liked videos</h1>
      {error && <p className="mt-4 text-red-300">{error}</p>}
      {videos.length ? (
        <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      ) : (
        !error && (
          <p className="mt-4 text-zinc-500">
            You haven't liked any videos yet.
          </p>
        )
      )}
    </div>
  );
}
