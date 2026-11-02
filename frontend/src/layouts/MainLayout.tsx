import { Outlet } from "react-router-dom";

import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}