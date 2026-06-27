import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Youtube, Book, Layers } from "lucide-react";

export const Route = createRootRoute({
  component: () => (
    <>
      <header className="bg-background z-10 sticky top-0 border-b hairline-b">
        <div className="mx-auto max-w-[1280px] px-5 md:px-8 flex items-center justify-between h-16">
          <Link
            to="/"
            className="font-cal text-xl font-bold tracking-tight flex items-center gap-2"
          >
            <img
              src="/ccl-logo.favicon.jpg"
              alt="CCL Logo"
              className="w-8 h-8 rounded-full"
            />
            <span className="hidden sm:inline">Component Comparison</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              to="/showcases"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-zinc-100 px-5 h-10 text-[15px] font-medium text-zinc-800 hover:bg-zinc-200 transition-all"
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Showcases</span>
            </Link>
            <a
              href="https://www.youtube.com/@CustomCoreLabs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-zinc-100 px-5 h-10 text-[15px] font-medium text-zinc-800 hover:bg-zinc-200 transition-all"
            >
              <Youtube className="w-4 h-4" />
              <span className="hidden sm:inline">YouTube</span>
            </a>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 h-10 text-[15px] font-medium text-primary-foreground shadow-[var(--shadow-glow)] hover:opacity-90 transition-all"
            >
              <Book className="w-4 h-4" />
              <span className="hidden sm:inline">Book a build</span>
            </Link>
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="bg-zinc-100 border-t hairline-strong py-8 md:py-10">
        <div className="mx-auto max-w-[1280px] px-5 md:px-8">
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-mute">
              &copy; {new Date().getFullYear()} Custom Core Labs. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/" className="text-sm text-slate-mute hover:text-primary">
                Home
              </Link>
              <Link
                to="/showcases"
                className="text-sm text-slate-mute hover:text-primary"
              >
                Showcases
              </Link>
              <Link
                to="/comparison"
                className="text-sm text-slate-mute hover:text-primary"
              >
                Comparison
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  ),
});
