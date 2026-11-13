import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginUser } from "../api/auth.api";
import { setUser } from "../features/auth/authSlice";
import { getApiError } from "../api/client";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      // The backend accepts either `username` or `email`.
      const looksLikeEmail = identifier.includes("@"); // checking whether input is email or username , email contains @
      const result = await loginUser({
        ...(looksLikeEmail ? { email: identifier } : { username: identifier }),
        password,
      });

      dispatch(setUser(result.data.user));
      localStorage.setItem("tubeX_accessToken", result.data.accessToken);
      localStorage.setItem("tubeX_refreshToken", result.data.refreshToken);
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue to TubeX.">
      <form onSubmit={submit} className="space-y-4">
        <Field
          label="Username or email"
          value={identifier}
          onChange={setIdentifier}
          placeholder="malik or you@example.com"
        />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
        />
        {error && (
          <p className="rounded-lg bg-red-950/50 p-3 text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          disabled={loading}
          className="w-full rounded-xl bg-white px-4 py-3 font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

      </form>
      <p className="mt-5 text-center text-sm text-zinc-500">
        Don't have an account?{" "}
        <Link to="/register" className="text-white hover:underline">
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-zinc-400">{label}</span>
      <input
        required
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-zinc-500"
      />
    </label>
  );
}

function AuthShell({ title, subtitle, children }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900/70 p-7 shadow-2xl">
        <Link to="/" className="text-sm font-semibold text-red-500">
          ▶ TubeX
        </Link>
        <h1 className="mt-8 text-2xl font-bold text-white">{title}</h1>
        <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
        <div className="mt-7">{children}</div>
      </div>
    </div>
  );
}
