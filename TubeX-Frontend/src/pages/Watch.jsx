import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Eye, Heart, ListPlus, ThumbsUp } from "lucide-react";
import { getVideo } from "../api/video.api";
import { toggleVideoLike } from "../api/like.api";
import { toggleSubscription } from "../api/subscription.api";
import { getUserPlaylists, addVideoToPlaylist } from "../api/playlist.api";
import { useSelector } from "react-redux";
import CommentSection from "../components/CommentSection";
import VideoCard from "../components/VideoCard";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

function media(value) {
  return typeof value === "string" ? value : value?.url || "";
}

export default function Watch() {
  const { videoId } = useParams();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);

  const [video, setVideo] = useState(null);
  const [related, setRelated] = useState([]); //Get other videos for the "Related Videos" section.
  const [liked, setLiked] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [showPlaylists, setShowPlaylists] = useState(false);//React state variable that controls whether the user's playlists should be displayed on the screen.
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const result = await getVideo(videoId);
        setVideo(result.data);

        const relatedResult = await import("../api/video.api").then(
          ({ getVideos }) => getVideos({ page: 1, limit: 8 }),
        );
        setRelated(
          (relatedResult.data.videos || []).filter(
            // set remaining videos
            (item) => item._id !== videoId,
          ),
        );
      } catch (err) {
        setError(err?.response?.data?.message || "Unable to load video");
      }
    }
    load();
  }, [videoId]);

  async function like() {
    if (!user) return navigate("/login");
    try {
      const result = await toggleVideoLike(videoId);
      setLiked(result.data.isLiked);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to like video");
    }
  }

  async function subscribe() {
    if (!user) return navigate("/login");
    if (!video?.owner) return;
    try {
      const ownerId =
        typeof video.owner === "string" ? video.owner : video.owner._id;
      const result = await toggleSubscription(ownerId); // ownerId is basically channel Id
      setSubscribed(result.data.isSubscribed);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to update subscription");
    }
  }

  async function loadPlaylists() {
    if (!user) return navigate("/login");
    try {
      const result = await getUserPlaylists(user._id);
      setPlaylists(result.data || []);
      setShowPlaylists(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load playlists");
    }
  }

  async function saveToPlaylist(playlistId) {
    try {
      await addVideoToPlaylist(videoId, playlistId);
      setShowPlaylists(false);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Unable to add video to playlist",
      );
    }
  }

  if (error && !video)
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <ErrorMessage message={error} />
      </div>
    );
  if (!video) return <Loading label="Loading video..." />;

  const owner = typeof video.owner === "object" ? video.owner : null;

  const ownerUsername = owner?.username || "";

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section>
          <div className="overflow-hidden rounded-2xl bg-black">
            <video
              src={media(video.videoFile)}
              controls
              className="aspect-video w-full"
              poster={media(video.thumbnail)}
            />
          </div>

          <h1 className="mt-5 text-xl font-bold text-white sm:text-2xl">
            {video.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
            <Eye size={16} /> {video.views || 0} views <span>•</span>{" "}
            {new Date(video.createdAt).toLocaleDateString()}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-y border-zinc-800 py-4">
            <Link
              to={ownerUsername ? `/channel/${ownerUsername}` : "#"}
              className="flex items-center gap-3"
            >
              <div className="h-10 w-10 rounded-full bg-zinc-800" /> {/* avatar place holder */}

              <div>
                <p className="font-semibold text-white">
                  {owner?.fullName || owner?.username || "Creator"}
                </p>
                <p className="text-xs text-zinc-500">View channel</p>
              </div>
            </Link>
            <div className="flex flex-wrap gap-2">

              <button
                onClick={subscribe}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${subscribed ? "bg-zinc-800 text-white" : "bg-white text-black"}`}
              >
                {subscribed ? "Subscribed" : "Subscribe"}
              </button>

              <button
                onClick={like}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm ${liked ? "bg-white text-black" : "bg-zinc-800 text-white"}`}
              >
                <ThumbsUp size={17} /> Like
              </button>

              <button
                onClick={loadPlaylists}
                className="flex items-center gap-2 rounded-full bg-zinc-800 px-4 py-2 text-sm text-white"
              >
                <ListPlus size={17} /> Get Playlist
              </button>

            </div>
          </div>

          {showPlaylists && (
            <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">Save to playlist</h3>

                <button
                  onClick={() => setShowPlaylists(false)}
                  className="text-xs text-zinc-500"
                >
                  Close
                </button>

              </div>
              
              {playlists.length ? (
                playlists.map((playlist) => (
                  <button
                    key={playlist._id}
                    onClick={() => saveToPlaylist(playlist._id)}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-zinc-800"
                  >
                    {playlist.name}
                  </button>
                ))
              ) : (
                <p className="text-sm text-zinc-500">
                  Create a playlist first.
                </p>
              )}
            </div>
          )}

          <p className="mt-5 whitespace-pre-wrap rounded-2xl bg-zinc-900/70 p-4 text-sm leading-6 text-zinc-300">
            {video.description}
          </p>

          <ErrorMessage message={error} />
          <CommentSection videoId={videoId} />
        </section>

        <aside className="space-y-5">
          <h2 className="font-semibold text-white">Up next</h2>
          {related.map((item) => (
            <VideoCard key={item._id} video={item} />
          ))}
        </aside>
      </div>
    </div>
  );
}
