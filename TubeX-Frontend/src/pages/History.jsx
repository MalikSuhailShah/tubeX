import { useEffect, useState } from "react";
import { getWatchHistory } from "../api/auth.api";
import VideoCard from "../components/VideoCard";
import Loading from "../components/Loading";

export default function History() {
  const [videos, setVideos] = useState([]); // videos array of watched videos
  const [error, setError] = useState("");

  useEffect(() => {
    getWatchHistory()
      .then((result) => setVideos(result.data || []))
      .catch((err) =>
        setError(err?.response?.data?.message || "Unable to load history"),
      );
  }, []);

  if (error) return <div className="p-8 text-red-300">{error}</div>;

  if (!videos.length) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Watch history</h1>
        <p className="mt-3 text-zinc-500">No videos in your history.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Watch history</h1>
      <div className="grid grid-cols-1 gap-x-4 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {videos.map((video) => (
          <VideoCard key={video._id} video={video} />
        ))}
      </div>
    </div>
  );
}
