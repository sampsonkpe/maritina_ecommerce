import { Link } from "react-router-dom";

export default function NavBar() {
  return (
    <nav className="border-b">
      <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
        <Link
          to="/"
          className="text-xl font-bold"
        >
          KAHWƐ by Maritina Foods
        </Link>

        <div className="flex gap-6">
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/login">Login</Link>
        </div>
      </div>
    </nav>
  );
}