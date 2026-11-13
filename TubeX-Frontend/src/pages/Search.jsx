import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getVideos } from "../api/video.api";
import VideoCard from "../components/VideoCard";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";

export default function Search() {
  const [params] = useSearchParams();//useSearchParams() is a React Router hook used to read query parameters from the URL.
  const query = params.get("q") || "";//Give me the value of the URL parameter named q.
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const result = await getVideos({ page: 1, limit: 50, query });
        setVideos(result.data.videos || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Search failed");
      } finally {
        setLoading(false);
      }
    }
    if (query.trim()) load();
    else {
      setVideos([]);
      setLoading(false);
    }
  }, [query]);

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-white">Search results</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Showing results for “{query}”.
      </p>
      <div className="mt-6">
        <ErrorMessage message={error} />
      </div>
      {loading ? (
        <Loading label="Searching..." />
      ) : videos.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No results"
            description="Try another search term."
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
