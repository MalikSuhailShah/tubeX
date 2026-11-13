import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPlaylist, removeVideoFromPlaylist } from "../api/playlist.api";
import VideoCard from "../components/VideoCard";
import Loading from "../components/Loading";

export default function PlaylistDetail() {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getPlaylist(playlistId)
      .then((result) => setPlaylist(result.data))
      .catch((err) =>
        setError(err?.response?.data?.message || "Unable to load playlist"),
      );
  }, [playlistId]);

  async function remove(videoId) {
    try {
      const result = await removeVideoFromPlaylist(videoId, playlistId);
      setPlaylist(result.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to remove video");
    }
  }

  if (!playlist && !error) return <Loading />;
  if (error) return <div className="p-8 text-red-300">{error}</div>;
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-zinc-500 hover:text-white"
      >
        ← Back
      </button>

      <h1 className="mt-4 text-2xl font-bold">{playlist.name}</h1>

      <p className="mt-1 text-zinc-500">{playlist.description}</p>


      <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {(playlist.videos || []).map((video) => (
          <div key={video._id || video} className="relative">
            
            {typeof video === "object" ? (
              <VideoCard video={video} />
            ) : (
              <div className="rounded-xl border border-zinc-800 p-4 text-sm text-zinc-500">
                Video {video}
              </div>
            )}

            {typeof video === "object" && (
              <button
                onClick={() => remove(video._id)}
                className="mt-2 rounded-lg bg-zinc-800 px-3 py-2 text-xs text-zinc-300 hover:bg-red-950"
              >
                Remove
              </button>
            )}

          </div>
        ))}
      </div>
      {!playlist.videos?.length && (
        <p className="mt-8 text-zinc-500">This playlist is empty.</p>
      )}
    </div>
  );
}
