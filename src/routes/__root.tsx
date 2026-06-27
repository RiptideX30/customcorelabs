import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="p-2 flex gap-2">
        <Link to="/" className="&.active:font-bold">
          Home
        </Link>
        <Link to="/showcases" className="&.active:font-bold">
          Showcases
        </Link>
        <Link to="/comparison" className="&.active:font-bold">
          Comparison
        </Link>
      </div>
      <hr />
      <Outlet />
    </>
  ),
});
