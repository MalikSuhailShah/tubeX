import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Menu, Search, Upload, UserCircle, Twitter } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleSidebar } from "../features/ui/uiSlice";
import { setUser } from "../features/auth/authSlice";
import { logoutUser } from "../api/auth.api";
import { getApiError } from "../api/client";

export default function Header() {
  const [query, setQuery] = useState("");
  const user = useSelector((state) => state.auth.user);// basically provide  logged  user  if not null
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function submitSearch(event) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  async function handleLogout() {
    try {
      await logoutUser();
    } catch (error) {
      // Even if the server request fails, remove the local session.
      console.warn(getApiError(error));
    } finally {
      dispatch(setUser(null));
      localStorage.removeItem("tubeX_accessToken");
      localStorage.removeItem("tubeX_refreshToken");
      navigate("/login", { replace: true });
    }
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950/90 px-3 backdrop-blur-xl sm:px-5">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="rounded-full p-2 text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
          aria-label="Toggle sidebar"
        >
          <Menu size={21} />
        </button>

        <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-white">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600 text-xs">▶</span>
          <span className="hidden sm:inline">TubeX</span>
        </Link>

      </div>

      <form onSubmit={submitSearch} className="mx-3 flex max-w-xl flex-1">
        <div className="flex w-full overflow-hidden rounded-full border border-zinc-700 bg-zinc-900 focus-within:border-zinc-500">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search"
            className="min-w-0 flex-1 bg-transparent px-4 py-2 text-sm text-white outline-none placeholder:text-zinc-500"
          />
          <button className="flex w-12 items-center justify-center border-l border-zinc-700 text-zinc-300 hover:bg-zinc-800" aria-label="Search">
            <Search size={19} />
          </button>
        </div>
      </form>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <Link to="/tweets" className="hidden rounded-full p-2 text-zinc-300 hover:bg-zinc-800 hover:text-white sm:block" title="Tweets">
          <Twitter size={20} />
        </Link>


        {
        user && ( // if logged in user present then show upload button 
          <Link to="/upload" className="rounded-full p-2 text-zinc-300 hover:bg-zinc-800 hover:text-white" title="Upload">
            <Upload size={20} />
          </Link>
        )}

        {user ? (
          <div className="flex items-center gap-1">

            <Link to="/profile" className="rounded-full p-1 text-zinc-300 hover:bg-zinc-800 hover:text-white" title="Profile">

              {user.avatar ? (
                <img src={user.avatar} alt={user.username} className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <UserCircle size={27} />
              )}

            </Link>

            <button onClick={handleLogout} className="rounded-full p-2 text-zinc-300 hover:bg-zinc-800 hover:text-white" title="Logout">
              <LogOut size={19} />
            </button>
            
          </div>
        ) : (
          <Link to="/login" className="rounded-full border border-zinc-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800">
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
