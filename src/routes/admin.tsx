import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowUpRight,
  RefreshCw,
  Clock,
  PackageSearch,
  PlusCircle,
  Loader2,
  Send,
  CheckCircle,
} from "lucide-react";
import cclLogo from "@/assets/ccl-logo.jpg";
import BuildStatusBadge from "@/components/BuildStatusBadge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { type Build, type BuildStatus } from "@/lib/build-tracker.tsx";
import { getTrackForServices } from "@/lib/service-tracks";
import { NEW_BUILDS, SERVICE_REPAIR, PERFORMANCE_TUNING } from "@/lib/form-utils";
import { trackerUrl } from "@/lib/tracker-api";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

type BuildSummary = {
  trackingCode: string;
  customerName: string;
  services: string[];
  status: BuildStatus;
  timeline: { status: string; timestamp: string }[];
  createdAt: string;
};

const ADMIN_KEY_STORAGE = "ccl_admin_key";

const allServices = [
  ...(Array.isArray(NEW_BUILDS) ? NEW_BUILDS : []),
  ...(Array.isArray(SERVICE_REPAIR) ? SERVICE_REPAIR : []),
  ...(Array.isArray(PERFORMANCE_TUNING) ? PERFORMANCE_TUNING : []),
];

const getCorrectedStatus = (build: BuildSummary): BuildSummary => {
  return build;
};

function CreateBuildDialog({
  adminKey,
  onBuildCreated,
}: {
  adminKey: string;
  onBuildCreated: (newBuild: BuildSummary) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [newBuild, setNewBuild] = useState<{ trackingCode: string } | null>(null);

  const reset = () => {
    setCustomerName("");
    setSelectedServices([]);
    setIsCreating(false);
    setError("");
    setNewBuild(null);
  };

  const handleCreateBuild = async () => {
    setIsCreating(true);
    setError("");
    setNewBuild(null);
    try {
      const res = await fetch(trackerUrl("/api/track"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({
          customerName,
          services: selectedServices,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setNewBuild({ trackingCode: data.data.trackingCode });
        onBuildCreated(data.data);
      } else {
        setError(data.error || "Failed to create build.");
      }
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) setTimeout(reset, 500);
      }}
    >
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground hover:opacity-90">
          <PlusCircle className="h-3.5 w-3.5" />
          Create New Build
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Build</DialogTitle>
          <DialogDescription>
            Enter customer details to create a new build and tracking code.
          </DialogDescription>
        </DialogHeader>

        {newBuild ? (
          <div className="py-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="font-semibold text-lg">Build Created!</h3>
            <p className="mono text-primary text-2xl my-2">{newBuild.trackingCode}</p>
            <p className="text-sm text-slate-mute">A new tracking code has been generated.</p>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right text-sm">
                Name
              </label>
              <input
                id="name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="col-span-3 w-full rounded-lg border hairline-strong px-3 py-2 text-[14px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="col-span-4">
              <label className="text-sm font-medium">Services</label>
              <div className="mt-2 grid grid-cols-2 gap-2 h-48 overflow-y-auto">
                {allServices.map((service) => (
                  <div key={service.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`create-${service.id}`}
                      checked={selectedServices.includes(service.title)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedServices((prev) => [...prev, service.title]);
                        } else {
                          setSelectedServices((prev) => prev.filter((s) => s !== service.title));
                        }
                      }}
                    />
                    <label htmlFor={`create-${service.id}`} className="text-sm">
                      {service.title}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            {error && <p className="col-span-4 text-center text-sm text-red-600">{error}</p>}
          </div>
        )}

        <DialogFooter>
          {newBuild ? (
            <button
              onClick={() => setIsOpen(false)}
              className="w-full rounded-md bg-primary px-4 py-2.5 text-[14px] font-medium text-primary-foreground hover:opacity-90"
            >
              Done
            </button>
          ) : (
            <button
              onClick={handleCreateBuild}
              disabled={isCreating || !customerName}
              className="w-full rounded-md bg-primary px-4 py-2.5 text-[14px] font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Send className="h-4 w-4" />
                  Create Build
                </span>
              )}
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AdminPage() {
  const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem(ADMIN_KEY_STORAGE) || "");
  const [authenticated, setAuthenticated] = useState(false);
  const [builds, setBuilds] = useState<BuildSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updatingCode, setUpdatingCode] = useState<string | null>(null);

  const fetchBuilds = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(trackerUrl("/api/admin/builds"), {
        headers: { "x-admin-key": adminKey },
      });
      const data = await res.json();
      if (data.ok && Array.isArray(data.data)) {
        const validBuilds = data.data.filter((b: unknown): b is Build => {
          return (
            !!b &&
            typeof b === "object" &&
            "trackingCode" in b &&
            typeof b.trackingCode === "string" &&
            "customerName" in b &&
            typeof b.customerName === "string" &&
            "createdAt" in b &&
            typeof b.createdAt === "string" &&
            "status" in b &&
            typeof b.status === "string" &&
            "services" in b &&
            Array.isArray(b.services) &&
            "timeline" in b &&
            Array.isArray(b.timeline)
          );
        });
        setBuilds(validBuilds.map(getCorrectedStatus));
        setAuthenticated(true);
      } else {
        setError(data.error || "Unauthorized");
        setAuthenticated(false);
        sessionStorage.removeItem(ADMIN_KEY_STORAGE);
      }
    } catch {
      setError("Unable to connect to build tracker.");
    } finally {
      setLoading(false);
    }
  }, [adminKey]);

  useEffect(() => {
    if (adminKey) {
      sessionStorage.setItem(ADMIN_KEY_STORAGE, adminKey);
      fetchBuilds();
    }
  }, [adminKey, fetchBuilds]);

  const advanceBuild = useCallback(
    async (code: string) => {
      setUpdatingCode(code);
      try {
        const res = await fetch(trackerUrl(`/api/track/${code}/advance`), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-key": adminKey,
          },
        });
        const data = await res.json();
        if (data.ok && data.data) {
          const correctedBuild = getCorrectedStatus(data.data);
          setBuilds((prevBuilds) =>
            prevBuilds.map((build) => (build.trackingCode === code ? correctedBuild : build)),
          );
        }
      } catch (error) {
        console.error("Failed to advance build:", error);
      } finally {
        setUpdatingCode(null);
      }
    },
    [adminKey],
  );

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-background text-foreground antialiased flex items-center justify-center">
        <div className="max-w-sm w-full px-5">
          <div className="text-center mb-8">
            <img src={cclLogo} alt="CCL Logo" className="h-12 w-12 rounded-md mx-auto mb-4" />
            <h1 className="text-[24px] font-semibold tracking-tight">Admin Access</h1>
            <p className="text-[13px] text-slate-mute mt-1">
              Enter your admin key to manage builds.
            </p>
          </div>
          <div className="rounded-xl border hairline-strong bg-background p-6 shadow-[var(--shadow-elegant)]">
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Admin key"
              className="w-full rounded-lg border hairline-strong px-4 py-3 text-[14px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              autoFocus
            />
            {error && <p className="mt-2 text-[12px] text-red-600">{error}</p>}
            <button
              onClick={fetchBuilds}
              disabled={!adminKey || loading}
              className="mt-4 w-full rounded-md bg-primary px-4 py-2.5 text-[14px] font-medium text-primary-foreground hover:opacity-90 disabled:opacity-40"
            >
              {loading ? "Verifying..." : "Access Dashboard"}
            </button>
          </div>
          <div className="mt-6 text-center">
            <Link to="/" className="text-[13px] text-primary hover:underline">
              Back to homepage
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground antialiased">
      {/* Admin Header */}
      <header className="border-b hairline bg-foreground/5">
        <div className="mx-auto max-w-[1280px] px-5 md:px-8">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2">
                <img src={cclLogo} alt="CCL" className="h-7 w-7 rounded-md" />
                <span className="text-[13px] font-semibold">Admin</span>
              </Link>
              <span className="text-slate-mute text-[12px]">Build Tracker Dashboard</span>
            </div>
            <div className="flex items-center gap-2">
              <CreateBuildDialog
                adminKey={adminKey}
                onBuildCreated={(newBuild) => {
                  const correctedBuild = getCorrectedStatus(newBuild);
                  setBuilds((prev) =>
                    [correctedBuild, ...prev].sort(
                      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
                    ),
                  );
                }}
              />
              <button
                onClick={fetchBuilds}
                className="inline-flex items-center gap-1.5 rounded-md border hairline-strong bg-background px-3 py-1.5 text-[12px] font-medium hover:border-primary hover:text-primary transition-colors"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="py-8">
        <div className="mx-auto max-w-[1280px] px-5 md:px-8">
          {loading && builds.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-block h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              <p className="mt-4 text-[14px] text-slate-mute">Loading builds...</p>
            </div>
          ) : builds.length === 0 ? (
            <div className="text-center py-20">
              <PackageSearch className="h-12 w-12 text-slate-mute mx-auto mb-4" />
              <h2 className="text-[20px] font-semibold">No active builds</h2>
              <p className="text-[14px] text-slate-mute mt-1">
                Use the "Create New Build" button to manually create a build.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-[24px] font-semibold tracking-tight">Active Builds</h1>
                <span className="mono text-[11px] uppercase tracking-[0.12em] text-slate-mute">
                  {builds.length} build{builds.length !== 1 ? "s" : ""}
                </span>
              </div>

              {builds.map((build) => {
                const track = getTrackForServices(build.services);
                if (!track || !Array.isArray(track)) {
                  return null;
                }

                const currentStepIndex = (build.timeline || []).length - 1;
                const nextStep = track[currentStepIndex + 1];

                return (
                  <div
                    key={build.trackingCode}
                    className="rounded-xl border hairline-strong bg-background p-5 shadow-[var(--shadow-elegant)] hover:border-primary/30 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link
                            to={`/track/${build.trackingCode}`}
                            className="mono text-[13px] font-semibold text-primary hover:underline"
                          >
                            {build.trackingCode}
                          </Link>
                          <BuildStatusBadge status={build.status} />
                        </div>
                        <p className="text-[15px] font-medium text-foreground">
                          {build.customerName}
                        </p>
                        {build.services && build.services.length > 0 && (
                          <p className="mt-0.5 text-[12.5px] text-slate-mute truncate max-w-md">
                            {build.services.join(", ")}
                          </p>
                        )}
                        <p className="mt-4 text-[11px] text-slate-mute flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(build.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {nextStep && build.status !== "completed" && (
                          <button
                            onClick={() => advanceBuild(build.trackingCode)}
                            disabled={updatingCode === build.trackingCode}
                            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[12px] font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
                          >
                            {updatingCode === build.trackingCode ? (
                              <span className="inline-block h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            ) : (
                              <>
                                Advance to "{nextStep}"
                                <ArrowUpRight className="h-3 w-3" />
                              </>
                            )}
                          </button>
                        )}
                        {build.status === "completed" && (
                          <span className="text-[12px] text-slate-mute italic">Complete</span>
                        )}
                        <Link
                          to={`/track/${build.trackingCode}`}
                          className="text-[12px] text-primary hover:underline shrink-nowrap"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
