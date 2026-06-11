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
  XCircle,
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
import { type BuildStatus, BUILD_STATUSES, STATUS_LABELS } from "@/lib/build-tracker";
import { trackerUrl } from "@/lib/tracker-api";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

type BuildSummary = {
  trackingCode: string;
  customerName: string;
  services: string[];
  status: BuildStatus;
  createdAt: string;
};

type BuildSummaryWithEstimates = BuildSummary & {
  partsValue?: string;
  estimateSubtotal?: string;
  taxAmount?: string;
  totalWithTax?: string;
};

const ADMIN_KEY_STORAGE = "ccl_admin_key";

function CreateBuildDialog({
  adminKey,
  onBuildCreated,
}: {
  adminKey: string;
  onBuildCreated: (newBuild: BuildSummary) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [services, setServices] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [newBuild, setNewBuild] = useState<{ trackingCode: string; emailSent: boolean } | null>(
    null,
  );

  const reset = () => {
    setCustomerName("");
    setCustomerEmail("");
    setServices("");
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
          customerEmail,
          services: services.split(",").map((s) => s.trim()),
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setNewBuild({ trackingCode: data.data.trackingCode, emailSent: false });
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
            <h3 className="font-semibold text-lg">Build Created!</h3>
            <p className="mono text-primary text-2xl my-4">{newBuild.trackingCode}</p>
            <div className="flex items-center justify-center gap-2">
              {newBuild.emailSent ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm text-slate-mute">
                {newBuild.emailSent
                  ? "Tracking code sent to customer."
                  : "Failed to send tracking code email."}
              </span>
            </div>
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
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="email" className="text-right text-sm">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="col-span-3 w-full rounded-lg border hairline-strong px-3 py-2 text-[14px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="services" className="text-right text-sm">
                Services
              </label>
              <input
                id="services"
                value={services}
                onChange={(e) => setServices(e.target.value)}
                placeholder="e.g., PC Build, OS Install"
                className="col-span-3 w-full rounded-lg border hairline-strong px-3 py-2 text-[14px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
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
              disabled={isCreating || !customerName || !customerEmail}
              className="w-full rounded-md bg-primary px-4 py-2.5 text-[14px] font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Send className="h-4 w-4" />
                  Create & Email Code
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
      if (data.ok && data.data) {
        setBuilds(data.data);
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

  const updateStatus = useCallback(
    async (code: string, newStatus: BuildStatus) => {
      setUpdatingCode(code);
      try {
        const res = await fetch(trackerUrl(`/api/track/${code}`), {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-admin-key": adminKey,
          },
          body: JSON.stringify({ status: newStatus }),
        });
        const data = await res.json();
        if (data.ok) {
          fetchBuilds();
        }
      } catch {
        // silent
      } finally {
        setUpdatingCode(null);
      }
    },
    [adminKey, fetchBuilds],
  );

  const getNextStatus = (current: BuildStatus): BuildStatus | null => {
    const idx = BUILD_STATUSES.indexOf(current);
    if (idx === -1 || idx >= BUILD_STATUSES.length - 1) return null;
    return BUILD_STATUSES[idx + 1];
  };

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
                  setBuilds((prev) => [newBuild, ...prev]);
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
                  {builds.length} build{builds.length !== 1 ? "s" : ""}\
                </span>
              </div>

              {builds.map((build0) => {
                const build = build0 as BuildSummaryWithEstimates;
                const next = getNextStatus(build.status);
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
                        {(build.estimateSubtotal || build.taxAmount || build.totalWithTax) && (
                          <div className="mt-3 rounded-xl border hairline bg-secondary/10 p-3 text-[13px]">
                            <div className="mono text-[10px] uppercase tracking-[0.18em] text-slate-mute mb-2">
                              Estimate Details
                            </div>
                            <div className="space-y-1">
                              {build.estimateSubtotal && (
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-500">Subtotal</span>
                                  <span className="font-semibold">{build.estimateSubtotal}</span>
                                </div>
                              )}
                              {build.taxAmount && (
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-500">Tax</span>
                                  <span className="font-semibold">{build.taxAmount}</span>
                                </div>
                              )}
                              {build.totalWithTax && (
                                <div className="flex items-center justify-between pt-1 border-t hairline">
                                  <span className="font-medium">Total</span>
                                  <span className="font-semibold">{build.totalWithTax}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        <p className="mt-4 text-[11px] text-slate-mute flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(build.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {next && (
                          <button
                            onClick={() => updateStatus(build.trackingCode, next)}
                            disabled={updatingCode === build.trackingCode}
                            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[12px] font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
                          >
                            {updatingCode === build.trackingCode ? (
                              <span className="inline-block h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            ) : (
                              <>
                                Advance to {STATUS_LABELS[next]}
                                <ArrowUpRight className="h-3 w-3" />
                              </>
                            )}
                          </button>
                        )}
                        {build.status === "picked-up" && (
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
