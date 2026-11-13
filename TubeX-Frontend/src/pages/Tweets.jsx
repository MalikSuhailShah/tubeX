import { useEffect, useState } from "react";
import { Heart, Pencil, Send, Trash2 } from "lucide-react";
import { useSelector } from "react-redux";
import {
  createTweet,
  deleteTweet,
  getUserTweets,
  updateTweet,
} from "../api/tweet.api";
import { toggleTweetLike } from "../api/like.api";

export default function Tweets() {
  const user = useSelector((state) => state.auth.user);
  const [tweets, setTweets] = useState([]);
  const [content, setContent] = useState("");
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      const result = await getUserTweets(user._id);
      setTweets(result.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load tweets");
    }
  }

  useEffect(() => {
    if (user) load();
  }, [user]);


  async function submit(e) {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      const result = await createTweet(content);
      setTweets((t) => [result.data, ...t]);
      setContent("");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to create tweet");
    }
  }

  async function remove(id) {
    try {
      await deleteTweet(id);
      setTweets((t) => t.filter((x) => x._id !== id));
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to delete tweet");
    }
  }

  async function save(id, value) {
    try {
      const result = await updateTweet(id, value);
      setTweets((t) => t.map((x) => (x._id === id ? result.data : x)));
      setEditing(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to update tweet");
    }
  }

  async function like(id) {
    try {
      await toggleTweetLike(id);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to like tweet");
    }
  }


  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold">Tweets</h1>
      <form
        onSubmit={submit}
        className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
      >
        <textarea // provide box for multi line input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share something..."
          rows={3}
          className="w-full resize-none bg-transparent text-sm outline-none"
        />
        <div className="mt-3 flex justify-end">
          <button className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black">
            <Send size={15} /> Post
          </button>
        </div>
      </form>

      {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

      <div className="mt-6 space-y-3">
        {tweets.map((tweet) => (
          <article
            key={tweet._id}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
          >
            <div className="flex gap-3">

              <div className="h-10 w-10 rounded-full bg-zinc-800" >
                <img
                src="user.avatar"
                />
              </div>  {/* //avatar placeholder */}

              <div className="min-w-0 flex-1">

                <p className="font-semibold">@{user.username}</p>

                {editing === tweet._id ? (
                  <div className="mt-2 flex gap-2">
                    <input
                      defaultValue={tweet.content}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        save(tweet._id, e.currentTarget.value) //When the user presses a key inside the input, check whether it was Enter. If it was, save the tweet using the tweet ID and the current input value.
                      }
                      className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none"
                    />
                    <button
                      onClick={(e) =>
                        save(tweet._id, e.currentTarget.previousSibling.value)
                      }
                      className="text-xs"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-300">
                    {tweet.content}
                  </p>
                )}
                <div className="mt-4 flex gap-4 text-zinc-500">
                  <button
                    onClick={() => like(tweet._id)}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    <Heart size={16} /> Like
                  </button>

                  <button onClick={() => setEditing(tweet._id)}>
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={() => remove(tweet._id)}
                    className="hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>

                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
