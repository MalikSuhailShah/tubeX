import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { publishVideo } from "../api/video.api";
import { getApiError } from "../api/client";

export default function Upload() {
  const [form, setForm] = useState({ title: "", description: "" });
  const [video, setVideo] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();

    if (!video || !thumbnail)
      return setError("Both video and thumbnail files are required.");

    setLoading(true);
    setError("");

    try {
      await publishVideo({ ...form, video, thumbnail });
      navigate("/studio");
    } 
    catch (err) {
      setError(getApiError(err));
    } 
    finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold">Upload video</h1>
      <p className="mt-1 text-sm text-zinc-500">
        This form matches POST /api/v1/videos.
      </p>
      <form
        onSubmit={submit}
        className="mt-7 space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-7"
      >
        <Field
          label="Title"
          value={form.title}
          onChange={(v) => setForm((f) => ({ ...f, title: v }))}
        />

        <label className="block">
          <span className="mb-2 block text-sm text-zinc-400">Description</span>
        
          <textarea
            required
            rows={6}
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-zinc-500"
          />
          
        </label>

        <FileField label="Video file" accept="video/*" onChange={setVideo} />

        <FileField label="Thumbnail" accept="image/*" onChange={setThumbnail} />

        {error && (
          <p className="rounded-xl bg-red-950/50 p-3 text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          disabled={loading}
          className="rounded-xl bg-white px-5 py-3 font-semibold text-black disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Publish video"}
        </button>

      </form>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-zinc-400">{label}</span>
      <input
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-zinc-500"
      />
    </label>
  );
}
function FileField({ label, accept, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-zinc-400">{label}</span>
      <input
        required
        type="file"
        accept={accept}
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        className="w-full rounded-xl border border-dashed border-zinc-700 bg-zinc-950 p-3 text-sm text-zinc-400 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-800 file:px-3 file:py-2 file:text-white"
      />
    </label>
  );
}
