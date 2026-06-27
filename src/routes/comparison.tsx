import { createFileRoute, Outlet, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/comparison")({
  component: ComparisonLayout,
});

function ComparisonLayout() {
  return (
    <div className="bg-background text-foreground">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8 py-4">
        <Link to="/comparison" className="text-primary hover:underline">
          &larr; Back to Comparison
        </Link>
      </div>
      <Outlet />
    </div>
  );
}
