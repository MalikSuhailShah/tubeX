import { Link } from "react-router-dom";
import { Eye, MoreVertical } from "lucide-react";

function getMediaUrl(value) {
  if (!value) return "";
  return typeof value === "string" ? value : value.url || "";
}

function formatViews(views = 0) {
  return new Intl.NumberFormat("en", { notation: "compact" }).format(views);
}

function formatDate(date) {
  if (!date) return "";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(date));
}

export default function VideoCard({ video }) {
  const thumbnail = getMediaUrl(video.thumbnail);

  return (
    <Link
      to={`/watch/${video._id}`}
      className="group min-w-0 overflow-hidden rounded-2xl border border-transparent bg-zinc-950 transition hover:border-zinc-800"
    >
      <div className="relative aspect-video overflow-hidden rounded-xl bg-zinc-900">{/* thumbnail container */}
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={video.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-600">No thumbnail</div>
        )}

        {video.duration > 0 && (
          <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs text-white">
            {Math.floor(video.duration / 60)}:{String(Math.floor(video.duration % 60)).padStart(2, "0")}
          </span>
        )}
      </div>

      <div className="flex gap-3 px-1 py-3">
        <div className="mt-0.5 h-9 w-9 shrink-0 rounded-full bg-zinc-800" />
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-zinc-100">{video.title}</h3>
          <p className="mt-1 truncate text-xs text-zinc-500">{video.owner?.fullName || video.owner?.username || "TubeX creator"}</p>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
            <Eye size={13} />
            <span>{formatViews(video.views)} views</span>
            <span>•</span>
            <span>{formatDate(video.createdAt)}</span>
          </div>
        </div>
         <MoreVertical size={18} className="mt-1 shrink-0 text-zinc-600" />{/* //MoreVertical = visual button/icon for "More options". */}
      </div>
    </Link>
  );
}
