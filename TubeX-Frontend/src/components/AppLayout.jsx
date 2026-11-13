import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Header />
      <Sidebar />
      <main className={sidebarOpen ? "ml-64 min-h-[calc(100vh-4rem)]" : "min-h-[calc(100vh-4rem)]"}>
        <Outlet />
      </main>
    </div>
  );
}
