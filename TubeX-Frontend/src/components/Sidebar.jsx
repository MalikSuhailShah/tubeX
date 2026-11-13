import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Compass,
  History,
  Home,
  Library,
  ListVideo,
  Settings,
  Upload,
  Users,
  Heart,
  Twitter,
} from "lucide-react";

const links = [
  ["/", "Home", Home],
  ["/search", "Explore", Compass],
  ["/tweets", "Tweets", Twitter],
  ["/studio", "Your videos", ListVideo],
  ["/profile", "Your channel", Users],
  ["/upload", "Upload", Upload],
  ["/liked", "Liked videos", Heart],
];

export default function Sidebar() {
  const open = useSelector((state) => state.ui.sidebarOpen);

  if (!open) return null;

  return (
    <div className="fixed bottom-0 left-0 top-16 z-30 w-64 overflow-y-auto border-r border-zinc-800 bg-zinc-950 px-3 py-4">
      <nav className="space-y-1">
        {links.map(([to, label, Icon]) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-4 rounded-xl px-4 py-3 text-sm transition ${
                isActive
                  ? "bg-zinc-800 font-semibold text-white"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="my-4 border-t border-zinc-800" />
      <p className="px-4 pb-2 text-xs font-semibold uppercase tracking-wider text-zinc-600">
        You
      </p>

      <div className="space-y-1">
        <NavLink
          to="/playlists"
          className="flex items-center gap-4 rounded-xl px-4 py-3 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-white"
        >
          <Library size={20} /> Playlists
        </NavLink>

        <NavLink
          to="/history"
          className="flex items-center gap-4 rounded-xl px-4 py-3 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-white"
        >
          <History size={20} /> History
        </NavLink>

        <NavLink
          to="/settings"
          className="flex items-center gap-4 rounded-xl px-4 py-3 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-white"
        >
          <Settings size={20} /> Settings
        </NavLink>
      </div>
    </div>
  );
}
