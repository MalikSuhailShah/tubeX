import { useState } from "react";
import { changePassword } from "../api/auth.api";
import { getApiError } from "../api/client";

export default function Settings() {
  const [form, setForm] = useState({ oldPassword: "", newPassword: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await changePassword(form);
      setMessage("Password changed successfully.");
      setForm({ oldPassword: "", newPassword: "" });

    } 
    catch (err) {
      setError(getApiError(err));
    }
  }
  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-2xl font-bold">Settings</h1>
      <form
        onSubmit={submit}
        className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
      >
        <h2 className="font-semibold">Change password</h2>
        <Field
          label="Current password"
          type="password"
          value={form.oldPassword}
          onChange={(v) => setForm({ ...form, oldPassword: v })}
        />
        <Field
          label="New password"
          type="password"
          value={form.newPassword}
          onChange={(v) => setForm({ ...form, newPassword: v })}
        />

        <button className="mt-5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black">
          Change password
        </button>

      </form>

      {message && <p className="mt-4 text-emerald-300">{message}</p>}
      {error && <p className="mt-4 text-red-300">{error}</p>}
      
    </div>
  );
}
function Field({ label, type, value, onChange }) {
  return (
    <label className="mt-4 block">
      <span className="mb-2 block text-sm text-zinc-400">{label}</span>
      <input
        required
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 outline-none focus:border-zinc-500"
      />
    </label>
  );
}
