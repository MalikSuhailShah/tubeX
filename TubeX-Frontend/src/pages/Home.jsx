import { useEffect, useState } from "react";
import { getVideos } from "../api/video.api";
import VideoCard from "../components/VideoCard";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true)
    async function load() {
      try {
        const result = await getVideos({
          page: 1,
          limit: 24,
          sortBy: "createdAt",
          sortType: -1,
        });
        setVideos(result.data.videos || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Unable to load videos");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">

      <div className="mb-6">
        
        <h1 className="text-2xl font-bold text-white">Recommended</h1>

        <p className="mt-1 text-sm text-zinc-500">
          Latest published videos from TubeX.
        </p>

      </div>

      <ErrorMessage message={error} />
      
      {loading ? (
        <Loading label="Loading videos..." />
      ) : videos.length === 0 ? (
        <EmptyState
          title="No videos found"
          description="Publish your first video from the Upload page."
        />
      ) : (
        <div className="grid grid-cols-1 gap-x-4 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
