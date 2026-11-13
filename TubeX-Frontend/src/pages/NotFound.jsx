import { Link } from "react-router-dom";
export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-sm text-zinc-600">404</p>
      <h1 className="mt-2 text-3xl font-bold">Page not found</h1>
      <Link
        to="/"
        className="mt-5 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black"
      >
        Go home
      </Link>
    </div>
  );
}
