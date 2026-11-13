export default function Loading({ label = "Loading..." }) {//Its purpose is to show a loading indicator while some data or operation is being processed.
  return (
    <div className="flex min-h-40 items-center justify-center text-zinc-400">
      <div className="flex items-center gap-3">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-700 border-t-red-500" />
        <span>{label}</span>
      </div>
    </div>
  );
}
