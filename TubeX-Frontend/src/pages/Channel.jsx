import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { getChannelProfile } from "../api/auth.api";
import { getVideos } from "../api/video.api";
import { toggleSubscription } from "../api/subscription.api";
import VideoCard from "../components/VideoCard";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

export default function Channel() {
  const { username } = useParams();
  const currentUser = useSelector((state) => state.auth.user);
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const profile = await getChannelProfile(username);
        setChannel(profile.data);
        // The video endpoint supports userId, so use the channel _id returned above.
        const channelVideos = await getVideos({
          page: 1,
          limit: 50,
          userId: profile.data._id,
        });
        setVideos(channelVideos.data.videos || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Unable to load channel");
      }
    }
    load();
  }, [username]);

  async function subscribe() {
    try {
      const result = await toggleSubscription(channel._id); // if already subscribed then unsubscribe and vice versa
      setChannel((current) => ({
        ...current,
        isSubscribed: result.data.isSubscribed,
        subscribersCount: Math.max(
          0,
          current.subscribersCount + (result.data.isSubscribed ? 1 : -1),
        ),
      }));
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to update subscription");
    }
  }

  if (error && !channel)
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <ErrorMessage message={error} />
      </div>
    );
  if (!channel) return <Loading label="Loading channel..." />;

  const isOwnChannel = String(currentUser?._id) === String(channel._id);
  const cover =
    typeof channel.coverImage === "string"
      ? channel.coverImage
      : channel.coverImage?.url;

  return (
    <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
      
      <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">

        <div className="h-44 bg-zinc-800 sm:h-64">
          {cover && (
            <img src={cover} alt="" className="h-full w-full object-cover" />
          )}
        </div>

        <div className="px-5 pb-6 sm:px-8">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">

              <img
                src={channel.avatar}
                alt={channel.username}
                className="h-24 w-24 rounded-full border-4 border-zinc-900 bg-zinc-800 object-cover"
              />

              <div className="pb-1">

                <h1 className="text-2xl font-bold text-white">
                  {channel.fullName}
                </h1>
                <p className="text-sm text-zinc-500">@{channel.username}</p>

              </div>

            </div>

            {!isOwnChannel && (
              <button
                onClick={subscribe}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold ${channel.isSubscribed ? "bg-zinc-800 text-white" : "bg-white text-black"}`}
              >
                {channel.isSubscribed ? "Subscribed" : "Subscribe"} 
              </button>
            )}
          </div>

          <div className="mt-6 flex gap-6 text-sm text-zinc-400">
            <span>
              <b className="text-white">{channel.subscribersCount}</b>{" "}
              subscribers
            </span>
            <span>
              <b className="text-white">{channel.channelsSubscribedToCount}</b>{" "}
              subscriptions
            </span>
          </div>
        </div>
      </div>

      <ErrorMessage message={error} />

      <section className="mt-8">
        <h2 className="mb-5 text-xl font-bold">Videos</h2>
        {videos.length ? (
          <div className="grid grid-cols-1 gap-x-4 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        ) : (
          <p className="text-zinc-500">This channel has no published videos.</p>
        )}
      </section>

      <div className="mt-6">
        <Link
          to={`/tweets/${channel._id}`}
          className="text-sm text-zinc-400 hover:text-white"
        >
          View channel tweets →
        </Link>

      </div>

    </div>
  );
}
