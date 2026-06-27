import { createFileRoute, Outlet, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/comparison")({
  component: ComparisonLayout,
});

function ComparisonLayout() {
  return (
    <div>
      <Link to="/comparison" className="&.active:font-bold">
        Back
      </Link>
      <Outlet />
    </div>
  );
}
