export default function EmptyState({ title, description }) { //. Its purpose is to show a nice message when there is nothing to display.
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 px-6 py-14 text-center">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      {description && <p className="mt-2 text-sm text-zinc-500">{description}</p>}
    </div>
  );
}
