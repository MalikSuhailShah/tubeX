import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  createPlaylist,
  deletePlaylist,
  getUserPlaylists,
} from "../api/playlist.api";
import EmptyState from "../components/EmptyState";

export default function Playlists() {
  const user = useSelector((state) => state.auth.user);
  const [playlists, setPlaylists] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [error, setError] = useState("");

  async function load() {
    try {
      const result = await getUserPlaylists(user._id);
      setPlaylists(result.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load playlists");
    }
  }
  useEffect(() => {
    if (user) load();
  }, [user]);

  async function submit(event) {
    event.preventDefault();
    try {
      const result = await createPlaylist(form);

      setPlaylists((p) => [result.data, ...p]);// use result.data along with the old data of playlist

      setForm({ name: "", description: "" }); // emptying the name and description
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to create playlist");
    }
  }
  async function remove(id) {
    if (!window.confirm("Delete this playlist?")) return; // confirming whether you want to delete the playlist by giving up the pop up
    try {
      await deletePlaylist(id);
      setPlaylists((p) => p.filter((item) => item._id !== id));
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to delete playlist");
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold">Playlists</h1>

      <form
        onSubmit={submit}
        className="mt-6 grid gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:grid-cols-[1fr_1.5fr_auto]"
      >
        <input
          required
          placeholder="Playlist name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm outline-none"
        />
        <input
          required
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm outline-none"
        />
        <button className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black">
          Create
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

      <div className="mt-7 space-y-3">
        {playlists.length ? (
          playlists.map((playlist) => (
              <div
                key={playlist._id}
                className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
              >

                  <div className="flex h-14 w-20 items-center justify-center rounded-xl bg-zinc-800 text-xs text-zinc-500">
                    {playlist.videos?.length || 0} videos
                  </div>

                  <div className="min-w-0 flex-1">
                    
                    <Link
                      to={`/playlists/${playlist._id}`}
                      className="font-semibold hover:underline"
                    >
                      {playlist.name}
                    </Link>

                    <p className="mt-1 truncate text-sm text-zinc-500">
                      {playlist.description}
                    </p>

                  </div>

                  <button
                    onClick={() => remove(playlist._id)}
                    className="text-xs text-zinc-500 hover:text-red-400"
                  >
                    Delete
                  </button>

              </div>
          ))
        ) : (
          <EmptyState
            title="No playlists"
            description="Create one above, then save videos to it."
          />
        )}
      </div>
    </div>
  );
}
