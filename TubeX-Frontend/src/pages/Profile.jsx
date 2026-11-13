import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getCurrentUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
} from "../api/auth.api";
import { setUser } from "../features/auth/authSlice";
import { getApiError } from "../api/client";

export default function Profile() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function sync() {
      try {
        const result = await getCurrentUser();
        dispatch(setUser(result.data));
        setForm({ fullName: result.data.fullName, email: result.data.email });
      } catch {
        /* Existing Redux user can still render the page. */
      }
    }
    sync();
  }, [dispatch]);

  async function saveAccount(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const result = await updateAccountDetails(form);
      dispatch(setUser(result.data));
      setMessage("Account details updated.");
    } catch (err) {
      setError(getApiError(err));
    }
  }

  async function fileChange(type, file) {
    if (!file) return;
    setError("");
    setMessage("");
    try {
      const result =
        type === "avatar"
          ? await updateAvatar(file)
          : await updateCoverImage(file);
      dispatch(setUser(result.data));
      setMessage(`${type === "avatar" ? "Avatar" : "Cover image"} updated.`);
    } catch (err) {
      setError(getApiError(err));
    }
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold">Your profile</h1>
      <div className="mt-6 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">

        <div className="h-40 bg-zinc-800">
          {(typeof user.coverImage === "string"
            ? user.coverImage
            : user.coverImage?.url) && (
            <img
              src={
                typeof user.coverImage === "string"
                  ? user.coverImage
                  : user.coverImage?.url
              }
              alt=""
              className="h-full w-full object-cover"
            />
          )}
        </div>

        <div className="px-6 pb-7">
          <img
            src={user.avatar}
            alt={user.username}
            className="-mt-10 h-20 w-20 rounded-full border-4 border-zinc-900 object-cover"
          />

          <h2 className="mt-3 text-xl font-bold">{user.fullName}</h2>

          <p className="text-sm text-zinc-500">@{user.username}</p>

          <p className="mt-1 text-xs text-zinc-600">{user.email}</p>
          
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={saveAccount}
          className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
        >
          <h2 className="font-semibold">Account details</h2>

          <Field
            label="Full name"
            value={form.fullName}
            onChange={(v) => setForm({ ...form, fullName: v })}
          />

          <Field
            label="Email"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })} // state modifier
          />

          <button className="mt-4 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black">
            Save changes
          </button>

        </form>

        <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">

          <h2 className="font-semibold">Images</h2>

          <File
            label="Change avatar"
            accept="image/*"
            onChange={(file) => fileChange("avatar", file)} // filechange is a function
          />

          <File
            label="Change cover image"
            accept="image/*"
            onChange={(file) => fileChange("cover", file)}
          />

        </div>
      </div>

      {message && (
        <p className="mt-4 rounded-xl bg-emerald-950/40 p-3 text-sm text-emerald-300">
          {message}
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-xl bg-red-950/40 p-3 text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );

}
function Field({ label, value, onChange }) {
  return (
    <label className="mt-4 block">
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

function File({ label, accept, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-zinc-400">{label}</span>
      <input
        type="file"
        accept={accept}
        onChange={(e) => onChange(e.target.files?.[0])}
        className="w-full rounded-xl border border-dashed border-zinc-700 bg-zinc-950 p-3 text-sm text-zinc-400 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-800 file:px-3 file:py-2 file:text-white"
      />
    </label>
  );
}
