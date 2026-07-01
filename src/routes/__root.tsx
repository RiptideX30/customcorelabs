import { createRootRoute, Outlet } from '@tanstack/react-router';
import * as React from 'react';

// Conditionally import and lazy-load the devtools
const TanStackRouterDevtools =
  process.env.NODE_ENV === 'production'
    ? () => null // Render nothing in production
    : React.lazy(() =>
        import('@tanstack/router-devtools').then((res) => ({
          default: res.TanStackRouterDevtools,
        })),
      );

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <React.Suspense fallback={null}>
        <TanStackRouterDevtools />
      </React.Suspense>
    </>
  ),
});
