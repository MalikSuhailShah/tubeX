import { useEffect, useState } from "react";
import {
  BarChart3,
  Eye,
  Heart,
  Video,
  Trash2,
  Globe,
  Lock,
} from "lucide-react";
import { getChannelStats, getChannelVideos } from "../api/dashboard.api";
import { deleteVideo, togglePublish } from "../api/video.api";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

export default function Studio() {
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState("");

  async function load() {
    try {
      const [statsResult, videoResult] = await Promise.all([
        getChannelStats(),
        getChannelVideos(),
      ]);

      setStats(statsResult.data);
      setVideos(videoResult.data.videos || []);
      
    } 
    catch (err) {
      setError(err?.response?.data?.message || "Unable to load studio");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(videoId) {
    if (!window.confirm("Delete this video?")) return;// pop for confirm
    try {
      await deleteVideo(videoId);
      setVideos((v) => v.filter((item) => item._id !== videoId));
      await load();
    } 
    catch (err) {
      setError(err?.response?.data?.message || "Unable to delete video");
    }
  }

  async function toggle(videoId) {
    try {
      const result = await togglePublish(videoId);

      setVideos((items) =>
        items.map((item) =>
          item._id === videoId
            ? { ...item, isPublished: result.data.isPublished }
            : item,
        ),
      );
    }
     catch (err) {
      setError(
        err?.response?.data?.message || "Unable to change publish status",
      );
    }
  }

  if (!stats && !error) return <Loading label="Loading studio..." />;

  const cards = [
    ["Videos", stats?.totalVideos ?? 0, Video],
    ["Views", stats?.totalViews ?? 0, Eye],
    ["Subscribers", stats?.totalSubcribers ?? 0, BarChart3],
    ["Likes", stats?.totalLikes ?? 0, Heart],
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6">

      <h1 className="text-2xl font-bold">Channel studio</h1>

      <p className="mt-1 text-sm text-zinc-500">
        Dashboard data comes directly from your protected backend routes.
      </p>

      <ErrorMessage message={error} />

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(([label, value, Icon]) => (
          <div
            key={label}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
          >
            <Icon size={20} className="text-zinc-500" />
            <p className="mt-5 text-2xl font-bold">{value}</p>
            <p className="text-sm text-zinc-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
        <div className="border-b border-zinc-800 p-5">
          <h2 className="font-semibold">Your videos</h2>
        </div>
        <div className="divide-y divide-zinc-800">
          {videos.map((video) => (
            <div key={video._id} className="flex items-center gap-4 p-4">
              <img
                src={
                  typeof video.thumbnail === "string"
                    ? video.thumbnail
                    : video.thumbnail?.url
                }
                alt=""
                className="h-20 w-32 rounded-lg bg-zinc-800 object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{video.title}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {video.views} views ·{" "}
                  {video.isPublished ? "Published" : "Private"}
                </p>
              </div>
              
              <button
                onClick={() => toggle(video._id)}
                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                title="Toggle publish"
              >
                {video.isPublished ? <Globe size={18} /> : <Lock size={18} />}
              </button>

              <button
                onClick={() => remove(video._id)}
                className="rounded-lg p-2 text-zinc-400 hover:bg-red-950 hover:text-red-300"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          {videos.length === 0 && (
            <p className="p-6 text-sm text-zinc-500">No videos yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
