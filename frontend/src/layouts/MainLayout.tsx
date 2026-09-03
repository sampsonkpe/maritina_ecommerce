import { Outlet, useLocation } from "react-router-dom";

import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

export default function MainLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar key={location.pathname} />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}