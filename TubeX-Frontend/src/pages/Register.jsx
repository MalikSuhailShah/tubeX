import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth.api";
import { getApiError } from "../api/client";

export default function Register() {
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });

  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  function change(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    if (!avatar) return setError("Avatar image is required by the backend.");

    setLoading(true);
    setError("");

    try { //Regular JSON is not the appropriate format for uploading files.
      const data = new FormData();// FormData creates data suitable for registration

      Object.entries(form).forEach(([key, value]) => data.append(key, value));// think about when we register over postman , how we entered data

      data.append("avatar", avatar);

      if (coverImage) data.append("coverImage", coverImage);

      await registerUser(data);

      navigate("/login", { replace: true });

    } 
    catch (err) {
      setError(getApiError(err));
    } 
    finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
      <form
        onSubmit={submit}
        className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900/70 p-7"
      >
        <Link to="/" className="text-sm font-semibold text-red-500">
          ▶ TubeX
        </Link>

        <h1 className="mt-7 text-2xl font-bold text-white">
          Create your account
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          Your backend requires an avatar during registration.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">

          <Field
            label="Full name"
            value={form.fullName}
            onChange={(v) => change("fullName", v)}
          />

          <Field
            label="Username"
            value={form.username}
            onChange={(v) => change("username", v)}
          />

          <Field
            label="Email"
            type="email"
            value={form.email}
            onChange={(v) => change("email", v)}
          />

          <Field
            label="Password"
            type="password"
            value={form.password}
            onChange={(v) => change("password", v)}
          />

        </div>

        <FileField label="Avatar *" onChange={setAvatar} />

        <FileField label="Cover image (optional)" onChange={setCoverImage} />

        {error && (
          <p className="mt-4 rounded-lg bg-red-950/50 p-3 text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          disabled={loading}
          className="mt-5 w-full rounded-xl bg-white px-4 py-3 font-semibold text-black disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>

        <p className="mt-5 text-center text-sm text-zinc-500">
          Already registered?{" "}
          <Link to="/login" className="text-white hover:underline">
            Sign in
          </Link>
        </p>

      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-zinc-400">{label}</span>
      <input
        required
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-zinc-500"
      />
    </label>
  );
}

function FileField({ label, onChange }) {
  return (
    <label className="mt-4 block">
      <span className="mb-2 block text-sm text-zinc-400">{label}</span>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        className="block w-full rounded-xl border border-dashed border-zinc-700 bg-zinc-950 p-3 text-sm text-zinc-400 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-800 file:px-3 file:py-2 file:text-white"
      />
    </label>
  );
}
